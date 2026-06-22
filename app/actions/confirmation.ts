/**
 * Server actions for RSVP confirmation
 */

'use server'

import { supabaseAdmin as supabase } from '@/lib/supabase'
import { decodeConfirmationToken } from '@/lib/confirmation'
import type { RSVP } from '@/lib/types'

/**
 * Fetch RSVP data by confirmation token
 */
export async function getRSVPByToken(token: string): Promise<{ success: boolean; data?: RSVP; error?: string }> {
  try {
    const id = decodeConfirmationToken(token)

    if (!id) {
      return {
        success: false,
        error: 'Invalid confirmation token',
      }
    }

    const { data: rsvpData, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('id', id)
      .single()

    if (rsvpError || !rsvpData) {
      console.error('Error fetching RSVP:', rsvpError)
      return {
        success: false,
        error: 'RSVP not found',
      }
    }

    return {
      success: true,
      data: rsvpData as RSVP,
    }
  } catch (error) {
    console.error('Error in getRSVPByToken:', error)
    return {
      success: false,
      error: 'Failed to retrieve RSVP',
    }
  }
}

