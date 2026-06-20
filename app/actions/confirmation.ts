/**
 * Server actions for RSVP confirmation
 */

'use server'

import { supabase } from '@/lib/supabase'
import { decodeConfirmationToken } from '@/lib/confirmation'
import type { RSVP } from '@/lib/types'

/**
 * Extended RSVP type with guest information
 */
interface RSVPWithGuest extends RSVP {
  guest_is_inc?: boolean
}

/**
 * Guest data subset for is_inc query
 */
interface GuestIncData {
  is_inc: boolean
}

/**
 * Fetch RSVP data by confirmation token with guest information
 */
export async function getRSVPByToken(token: string): Promise<{ success: boolean; data?: RSVPWithGuest; error?: string }> {
  try {
    const id = decodeConfirmationToken(token)
    
    if (!id) {
      return {
        success: false,
        error: 'Invalid confirmation token',
      }
    }

    // Fetch RSVP data
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

    // Cast to RSVP type for TypeScript
    const rsvp = rsvpData as RSVP

    // Fetch matching guest data to get is_inc status
    const { data: guestData } = await supabase
      .from('guest_list')
      .select('is_inc')
      .ilike('first_name', rsvp.first_name)
      .ilike('last_name', rsvp.last_name)
      .limit(1)

    // Get the first result if it exists
    const guestIncInfo = (guestData && guestData.length > 0 ? guestData[0] : null) as GuestIncData | null

    // Combine RSVP and guest data
    const combinedData: RSVPWithGuest = {
      ...rsvp,
      guest_is_inc: guestIncInfo?.is_inc ?? false,
    }

    return {
      success: true,
      data: combinedData,
    }
  } catch (error) {
    console.error('Error in getRSVPByToken:', error)
    return {
      success: false,
      error: 'Failed to retrieve RSVP',
    }
  }
}

