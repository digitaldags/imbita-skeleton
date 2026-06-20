/**
 * API route for handling RSVP submissions
 * POST /api/rsvp
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Database, RSVPFormData } from '@/lib/types'
import { checkGuestExists } from '@/app/actions/guests'

async function hasExistingRSVP(first_name: string, last_name: string) {
  const { data, error } = await supabase
    .from('rsvps')
    .select('id')
    .ilike('first_name', first_name.trim())
    .ilike('last_name', last_name.trim())
    .limit(1)

  if (error) {
    console.error('Error checking existing RSVP:', error)
    return false
  }

  return (data?.length ?? 0) > 0
}

export async function POST(request: NextRequest) {
  try {
    const body: RSVPFormData = await request.json()

    // Validate required fields
    if (!body.first_name || !body.last_name || !body.email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    // Prevent duplicate RSVPs by name (case-insensitive)
    const alreadyRSVPed = await hasExistingRSVP(body.first_name, body.last_name)
    if (alreadyRSVPed) {
      return NextResponse.json(
        {
          error: 'We already received an RSVP under this name.',
        },
        { status: 409 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if guest exists in guest list (case-insensitive)
    const guestExists = await checkGuestExists(body.first_name, body.last_name)

    if (!guestExists) {
      return NextResponse.json(
        {
          error:
            'Your name is not in our guest list. Please contact us if you believe this is an error.',
        },
        { status: 403 }
      )
    }

    // Validate attendance_type if attending
    if (body.attending && !['church', 'reception', 'both'].includes(body.attendance_type)) {
      return NextResponse.json(
        { error: 'Invalid attendance type selected' },
        { status: 400 }
      )
    }

    // Insert RSVP into database
    type RSVPInsert = Database['public']['Tables']['rsvps']['Insert']
    const newRSVP: RSVPInsert = {
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      email: body.email.trim().toLowerCase(),
      attending: body.attending ?? false,
      attendance_type: body.attending ? body.attendance_type : 'both',
    }

    const { data, error } = await supabase
      .from('rsvps')
      // Cast to any to satisfy Supabase generic typing in this context
      .insert(newRSVP as any)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save RSVP. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data, message: 'RSVP submitted successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

