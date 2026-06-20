/**
 * Single-RSVP reminder send route
 * Sends a reminder email to one specific RSVP by ID.
 * Always sends regardless of reminder_sent state, allowing re-sends.
 * Requires admin authentication via cookie.
 */

import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { id } = params

  // Fetch the specific RSVP
  const { data: rsvpData, error: fetchError } = await supabase
    .from('rsvps')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !rsvpData) {
    return NextResponse.json({ error: 'RSVP not found.' }, { status: 404 })
  }

  const rsvp = rsvpData as RSVP

  if (!rsvp.attending) {
    return NextResponse.json(
      { error: 'This guest is not attending and will not receive a reminder.' },
      { status: 400 }
    )
  }

  // Look up is_inc using case-insensitive match, same pattern as confirmation.ts
  const { data: guestData } = await supabase
    .from('guest_list')
    .select('is_inc')
    .ilike('first_name', rsvp.first_name)
    .ilike('last_name', rsvp.last_name)
    .limit(1)

  const isInc = guestData && guestData.length > 0 ? (guestData[0] as { is_inc: boolean }).is_inc : false

  const resend = new Resend(apiKey)
  const { daysAway, weddingDateFormatted } = computeDaysAway()

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
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
  }

  // Mark as sent
  const { error: updateError } = await (supabase as any)
    .from('rsvps')
    .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    console.error('Failed to update reminder_sent flag:', updateError)
  }

  return NextResponse.json({ sent: true, message: 'Reminder sent successfully.' })
}
