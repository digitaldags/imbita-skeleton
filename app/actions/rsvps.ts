/**
 * Server actions for fetching and managing RSVPs (admin only)
 */

'use server'

import { supabase } from '@/lib/supabase'
import type { Database, RSVP } from '@/lib/types'

/**
 * Fetch a page of RSVPs from the database, with optional attendance type filter
 * @param page - Zero-based page index
 * @param pageSize - Number of rows per page
 * @param filter - Attendance type filter ('all' | 'church' | 'reception' | 'both')
 * @param sortColumn - Column to sort by
 * @param sortDirection - Sort direction ('asc' | 'desc')
 * @param searchTerm - Optional search term matched against first_name or last_name
 */
export async function getRSVPsPaginated(
  page: number,
  pageSize: number,
  filter: 'all' | 'church' | 'reception' | 'both',
  sortColumn: 'first_name' | 'last_name' | 'email' | 'attending' | 'attendance_type' | 'created_at' | 'updated_at' = 'created_at',
  sortDirection: 'asc' | 'desc' = 'desc',
  searchTerm: string = ''
): Promise<{
  data: RSVP[]
  totalFiltered: number
  totalAll: number
  totalAttending: number
  totalNotAttending: number
  totalChurch: number
  totalReception: number
  totalBoth: number
}> {
  const empty = { data: [], totalFiltered: 0, totalAll: 0, totalAttending: 0, totalNotAttending: 0, totalChurch: 0, totalReception: 0, totalBoth: 0 }
  try {
    const from = page * pageSize
    const to = from + pageSize - 1
    const trimmed = searchTerm.trim()

    let pageQuery = supabase
      .from('rsvps')
      .select('*', { count: 'exact' })
      .order(sortColumn, { ascending: sortDirection === 'asc' })

    if (filter !== 'all') {
      pageQuery = pageQuery.eq('attending', true).eq('attendance_type', filter)
    }

    if (trimmed) {
      pageQuery = pageQuery.or(
        `first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%`
      )
    }

    pageQuery = pageQuery.range(from, to)

    const [pageResult, allResult, attendingResult, notAttendingResult, churchResult, receptionResult, bothResult] = await Promise.all([
      pageQuery,
      supabase.from('rsvps').select('id', { count: 'exact', head: true }),
      supabase.from('rsvps').select('id', { count: 'exact', head: true }).eq('attending', true),
      supabase.from('rsvps').select('id', { count: 'exact', head: true }).eq('attending', false),
      supabase.from('rsvps').select('id', { count: 'exact', head: true }).eq('attending', true).eq('attendance_type', 'church'),
      supabase.from('rsvps').select('id', { count: 'exact', head: true }).eq('attending', true).eq('attendance_type', 'reception'),
      supabase.from('rsvps').select('id', { count: 'exact', head: true }).eq('attending', true).eq('attendance_type', 'both'),
    ])

    if (pageResult.error) {
      console.error('Error fetching RSVPs:', pageResult.error)
      return empty
    }

    return {
      data: pageResult.data || [],
      totalFiltered: pageResult.count ?? 0,
      totalAll: allResult.count ?? 0,
      totalAttending: attendingResult.count ?? 0,
      totalNotAttending: notAttendingResult.count ?? 0,
      totalChurch: churchResult.count ?? 0,
      totalReception: receptionResult.count ?? 0,
      totalBoth: bothResult.count ?? 0,
    }
  } catch (error) {
    console.error('Error fetching RSVPs:', error)
    return empty
  }
}

/**
 * Fetch all RSVPs for CSV export, with optional attendance type filter
 * @param filter - Attendance type filter ('all' | 'church' | 'reception' | 'both')
 */
export async function getAllRSVPsForExport(
  filter: 'all' | 'church' | 'reception' | 'both'
): Promise<RSVP[]> {
  try {
    let query = supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('attending', true).eq('attendance_type', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching RSVPs for export:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching RSVPs for export:', error)
    return []
  }
}

/**
 * Update an existing RSVP
 * @param id - RSVP ID
 * @param updates - Fields to update (first_name, last_name, email, attending)
 */
export async function updateRSVP(
  id: string,
  updates: Partial<Pick<RSVP, 'first_name' | 'last_name' | 'email' | 'attending' | 'attendance_type'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    type RSVPUpdate = Database['public']['Tables']['rsvps']['Update'] & {
      updated_at?: string
    }

    const payload: RSVPUpdate = {
      updated_at: new Date().toISOString(),
    }

    if (typeof updates.first_name === 'string') {
      payload.first_name = updates.first_name.trim()
    }

    if (typeof updates.last_name === 'string') {
      payload.last_name = updates.last_name.trim()
    }

    if (typeof updates.email === 'string') {
      payload.email = updates.email.trim().toLowerCase()
    }

    if (typeof updates.attending === 'boolean') {
      payload.attending = updates.attending
    }

    if (updates.attendance_type && ['church', 'reception', 'both'].includes(updates.attendance_type)) {
      payload.attendance_type = updates.attendance_type
    }

    const { error } = await (supabase as any)
      .from('rsvps')
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('Error updating RSVP:', error)
      return { success: false, error: 'Failed to update RSVP.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

/**
 * Delete an RSVP
 * @param id - RSVP ID
 */
export async function deleteRSVP(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('rsvps').delete().eq('id', id)

    if (error) {
      console.error('Error deleting RSVP:', error)
      return { success: false, error: 'Failed to delete RSVP.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting RSVP:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

