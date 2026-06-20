/**
 * Server actions for managing guest list (admin only)
 */

'use server'

import { supabase } from '@/lib/supabase'
import type { Database, Guest } from '@/lib/types'

/**
 * Fetch a page of guests from the database
 * @param page - Zero-based page index
 * @param pageSize - Number of rows per page
 * @param sortColumn - Column to sort by
 * @param sortDirection - Sort direction ('asc' | 'desc')
 * @param searchTerm - Optional search term matched against first_name or last_name
 */
export async function getGuestsPaginated(
  page: number,
  pageSize: number,
  sortColumn: 'first_name' | 'last_name' | 'enabled' | 'is_inc' | 'created_at' | 'updated_at' = 'created_at',
  sortDirection: 'asc' | 'desc' = 'desc',
  searchTerm: string = ''
): Promise<{
  data: Guest[]
  total: number
  totalEnabled: number
  totalDisabled: number
}> {
  try {
    const from = page * pageSize
    const to = from + pageSize - 1
    const trimmed = searchTerm.trim()

    let pageQuery = supabase
      .from('guest_list')
      .select('*', { count: 'exact' })
      .order(sortColumn, { ascending: sortDirection === 'asc' })

    if (trimmed) {
      pageQuery = pageQuery.or(
        `first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%`
      )
    }

    pageQuery = pageQuery.range(from, to)

    const [pageResult, enabledResult, disabledResult] = await Promise.all([
      pageQuery,
      supabase
        .from('guest_list')
        .select('id', { count: 'exact', head: true })
        .eq('enabled', true),
      supabase
        .from('guest_list')
        .select('id', { count: 'exact', head: true })
        .eq('enabled', false),
    ])

    if (pageResult.error) {
      console.error('Error fetching guests:', pageResult.error)
      return { data: [], total: 0, totalEnabled: 0, totalDisabled: 0 }
    }

    return {
      data: pageResult.data || [],
      total: pageResult.count ?? 0,
      totalEnabled: enabledResult.count ?? 0,
      totalDisabled: disabledResult.count ?? 0,
    }
  } catch (error) {
    console.error('Error fetching guests:', error)
    return { data: [], total: 0, totalEnabled: 0, totalDisabled: 0 }
  }
}

/**
 * Fetch all guests from the database (used for CSV export only)
 * @returns Array of all Guest objects
 */
export async function getAllGuestsForExport(): Promise<Guest[]> {
  try {
    const { data, error } = await supabase
      .from('guest_list')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching guests for export:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching guests for export:', error)
    return []
  }
}

/**
 * Check if a guest exists in the guest list AND is enabled (case-insensitive)
 * @param first_name - Guest first name
 * @param last_name - Guest last name
 * @returns true if guest exists and is enabled, false otherwise
 */
export async function checkGuestExists(
  first_name: string,
  last_name: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('guest_list')
      .select('id, enabled')
      .ilike('first_name', first_name.trim())
      .ilike('last_name', last_name.trim())
      .eq('enabled', true)
      .limit(1)

    if (error) {
      console.error('Error checking guest:', error)
      return false
    }

    return (data?.length ?? 0) > 0
  } catch (error) {
    console.error('Error checking guest:', error)
    return false
  }
}

/**
 * Update an existing guest
 * @param id - Guest ID
 * @param updates - Fields to update (first_name, last_name, enabled, is_inc)
 */
export async function updateGuest(
  id: string,
  updates: Partial<Pick<Guest, 'first_name' | 'last_name' | 'enabled' | 'is_inc'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    type GuestUpdate = Database['public']['Tables']['guest_list']['Update'] & {
      updated_at?: string
    }

    const payload: GuestUpdate = {
      updated_at: new Date().toISOString(),
    }

    if (typeof updates.first_name === 'string') {
      payload.first_name = updates.first_name.trim()
    }

    if (typeof updates.last_name === 'string') {
      payload.last_name = updates.last_name.trim()
    }

    if (typeof updates.enabled === 'boolean') {
      payload.enabled = updates.enabled
    }

    if (typeof updates.is_inc === 'boolean') {
      payload.is_inc = updates.is_inc
    }

    const { error } = await (supabase as any)
      .from('guest_list')
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('Error updating guest:', error)
      return { success: false, error: 'Failed to update guest.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating guest:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

/**
 * Check if guest already exists in RSVPs (case-insensitive)
 */
async function checkGuestInRSVPs(
  first_name: string,
  last_name: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .select('id')
      .ilike('first_name', first_name.trim())
      .ilike('last_name', last_name.trim())
      .limit(1)

    if (error) {
      console.error('Error checking RSVPs:', error)
      return false
    }

    return (data?.length ?? 0) > 0
  } catch (error) {
    console.error('Error checking RSVPs:', error)
    return false
  }
}

/**
 * Check if a guest exists (regardless of enabled status) for uniqueness checks
 */
async function checkGuestExistsAny(
  first_name: string,
  last_name: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('guest_list')
      .select('id')
      .ilike('first_name', first_name.trim())
      .ilike('last_name', last_name.trim())
      .limit(1)

    if (error) {
      console.error('Error checking guest:', error)
      return false
    }

    return (data?.length ?? 0) > 0
  } catch (error) {
    console.error('Error checking guest:', error)
    return false
  }
}

/**
 * Create a new guest entry (admin action)
 */
export async function createGuest(
  first_name: string,
  last_name: string,
  enabled: boolean = true,
  is_inc: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedFirst = first_name.trim()
    const trimmedLast = last_name.trim()

    if (!trimmedFirst || !trimmedLast) {
      return { success: false, error: 'First and last name are required.' }
    }

    const exists = await checkGuestExistsAny(trimmedFirst, trimmedLast)
    if (exists) {
      return { success: false, error: 'Guest already exists in the list.' }
    }

    const inRSVPs = await checkGuestInRSVPs(trimmedFirst, trimmedLast)
    if (inRSVPs) {
      return {
        success: false,
        error: 'This guest has already submitted an RSVP.',
      }
    }

    type GuestInsert = Database['public']['Tables']['guest_list']['Insert']
    const newGuest: GuestInsert = {
      first_name: trimmedFirst,
      last_name: trimmedLast,
      enabled,
      is_inc,
    }

    const { error } = await supabase
      .from('guest_list')
      .insert(newGuest as any)

    if (error) {
      console.error('Error adding guest:', error)
      return { success: false, error: 'Failed to add guest.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error adding guest:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

/**
 * Delete a guest
 * @param id - Guest ID
 */
export async function deleteGuest(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('guest_list').delete().eq('id', id)

    if (error) {
      console.error('Error deleting guest:', error)
      return { success: false, error: 'Failed to delete guest.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting guest:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

/**
 * Import guests from CSV data
 * @param csvData - CSV file content as string
 * @returns Object with success status, counts, and errors
 */
export async function importGuestsFromCSV(csvData: string): Promise<{
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}> {
  try {
    const lines = csvData.split('\n').filter((line) => line.trim())
    const errors: string[] = []
    let imported = 0
    let skipped = 0

    // Skip header row if present
    const startIndex = lines[0].toLowerCase().includes('first') ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse CSV line (handle quoted values)
      const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map((v) =>
        v.replace(/^"|"$/g, '').trim()
      )

      if (!values || values.length < 2) {
        errors.push(`Line ${i + 1}: Invalid format (need first_name, last_name)`)
        skipped++
        continue
      }

      const [first_name, last_name] = values

      if (!first_name || !last_name) {
        errors.push(`Line ${i + 1}: Missing first or last name`)
        skipped++
        continue
      }

      // Check if guest already exists
      const exists = await checkGuestExistsAny(first_name, last_name)
      if (exists) {
        skipped++
        continue
      }

      // Check if in RSVPs
      const inRSVPs = await checkGuestInRSVPs(first_name, last_name)
      if (inRSVPs) {
        skipped++
        continue
      }

      // Insert guest
      type GuestInsert = Database['public']['Tables']['guest_list']['Insert']
      const newGuest: GuestInsert = {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        enabled: true,
        is_inc: false,
      }

      const { error } = await supabase
        .from('guest_list')
        .insert(newGuest as any)

      if (error) {
        errors.push(`Line ${i + 1}: ${error.message}`)
        skipped++
      } else {
        imported++
      }
    }

    return {
      success: true,
      imported,
      skipped,
      errors,
    }
  } catch (error) {
    console.error('Error importing CSV:', error)
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: ['Failed to process CSV file. Please check the format.'],
    }
  }
}

