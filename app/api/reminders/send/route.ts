/**
 * Bulk reminder send route
 * Sends reminder emails to all attending RSVPs that haven't received one yet.
 * Requires admin authentication via cookie.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { supabase } from '@/lib/supabase'
import { ReminderEmail } from '@/emails/ReminderEmail'
import type { RSVP } from '@/lib/types'

function isAdminAuthenticated(): boolean {
  const cookieStore = cookies()
  return cookieStore.get('admin-authenticated')?.value === 'true'
}

function computeDaysAway(): { daysAway: number; weddingDateFormatted: string } {
  const weddingDate = new Date(process.env.WEDDING_DATE || '2026-05-02')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  weddingDate.setHours(0, 0, 0, 0)
  const daysAway = Math.ceil(
    (weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  const weddingDateFormatted = weddingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return { daysAway, weddingDateFormatted }
}

export async function POST() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL

  if (!apiKey || !fromEmail) {
    return NextResponse.json(
      { error: 'Email service is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.' },
      { status: 500 }
    )
  }

  // Fetch all attending RSVPs that haven't received a reminder yet
  const { data: rsvps, error: fetchError } = await supabase
    .from('rsvps')
    .select('*')
    .eq('attending', true)
    .eq('reminder_sent', false)

  if (fetchError) {
    console.error('Error fetching RSVPs for bulk reminder:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch RSVPs.' }, { status: 500 })
  }

  if (!rsvps || rsvps.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No pending reminders to send.' })
  }

  const resend = new Resend(apiKey)
  const { daysAway, weddingDateFormatted } = computeDaysAway()

  let sent = 0
  const failed: string[] = []

  for (const rsvp of rsvps as RSVP[]) {
    // Look up is_inc using case-insensitive match, same pattern as confirmation.ts
    const { data: guestData } = await supabase
      .from('guest_list')
      .select('is_inc')
      .ilike('first_name', rsvp.first_name)
      .ilike('last_name', rsvp.last_name)
      .limit(1)

    const isInc = guestData && guestData.length > 0 ? (guestData[0] as { is_inc: boolean }).is_inc : false

    try {
      const html = await render(
        ReminderEmail({
          firstName: rsvp.first_name,
          attendanceType: rsvp.attendance_type,
          isInc,
          daysAway,
          weddingDateFormatted,
        })
      )

      const daysLabel =
        daysAway === 1 ? 'just 1 day away' : daysAway === 0 ? 'today' : `${daysAway} days away`

      const { error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: rsvp.email,
        subject: `Our wedding is ${daysLabel}! 💌`,
        html,
      })

      if (sendError) {
        console.error(`Failed to send reminder to ${rsvp.email}:`, sendError)
        failed.push(rsvp.email)
        continue
      }

      // Mark as sent
      await (supabase as any)
        .from('rsvps')
        .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
        .eq('id', rsvp.id)

      sent++
    } catch (err) {
      console.error(`Error sending reminder to ${rsvp.email}:`, err)
      failed.push(rsvp.email)
    }
  }

  return NextResponse.json({
    sent,
    failed: failed.length,
    message: `Sent ${sent} reminder${sent !== 1 ? 's' : ''}.${failed.length > 0 ? ` ${failed.length} failed.` : ''}`,
  })
}
