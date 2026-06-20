/**
 * Server actions for RSVP form
 * These run on the server and can be called directly from client components
 */

'use server'

import { supabase } from '@/lib/supabase'
import { generateConfirmationToken } from '@/lib/confirmation'
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

export interface ActionResult {
  success: boolean
  error?: string
  data?: { id: string; [key: string]: any }
  token?: string
}

/**
 * Submit an RSVP using server action
 * @param formData - RSVP form data
 * @returns ActionResult with success status and optional error message
 */
export async function submitRSVP(formData: RSVPFormData): Promise<ActionResult> {
  try {
    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.email) {
      return {
        success: false,
        error: 'First name, last name, and email are required',
      }
    }

    // Prevent duplicate RSVPs by name (case-insensitive)
    const alreadyRSVPed = await hasExistingRSVP(
      formData.first_name,
      formData.last_name
    )
    if (alreadyRSVPed) {
      return {
        success: false,
        error: 'We already received an RSVP under this name.',
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        error: 'Invalid email format',
      }
    }

    // Check if guest exists in guest list (case-insensitive)
    const guestExists = await checkGuestExists(
      formData.first_name,
      formData.last_name
    )

    if (!guestExists) {
      return {
        success: false,
        error: 'Your name is not in our guest list. Please contact us if you believe this is an error.',
      }
    }

    // Validate attendance_type if attending
    if (formData.attending && !['church', 'reception', 'both'].includes(formData.attendance_type)) {
      return {
        success: false,
        error: 'Invalid attendance type selected',
      }
    }

    // Insert RSVP into database
    type RSVPInsert = Database['public']['Tables']['rsvps']['Insert']
    const newRSVP: RSVPInsert = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim().toLowerCase(),
      attending: formData.attending ?? false,
      attendance_type: formData.attending ? formData.attendance_type : 'both',
    }

    const { data, error } = await supabase
      .from('rsvps')
      // Cast to any to satisfy Supabase generic typing in this context
      .insert(newRSVP as any)
      .select()
      .single()

    if (error || !data) {
      console.error('Supabase error:', error)
      return {
        success: false,
        error: 'Failed to save RSVP. Please try again.',
      }
    }

    // Generate confirmation token on the server
    // Cast data to any to access id property
    const token = generateConfirmationToken((data as any).id)

    return {
      success: true,
      data,
      token,
    }
  } catch (error) {
    console.error('Server action error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

