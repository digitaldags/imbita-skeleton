/**
 * TypeScript types for the database schema
 */

export type AttendanceType = 'ceremony' | 'reception' | 'both'

export interface RSVP {
  id: string
  first_name: string
  last_name: string
  email: string
  attending: boolean
  attendance_type: AttendanceType
  created_at: string
  updated_at: string | null
  reminder_sent: boolean
  reminder_sent_at: string | null
}

export interface Guest {
  id: string
  first_name: string
  last_name: string
  enabled: boolean
  created_at: string
  updated_at: string | null
}

export interface Database {
  public: {
    Tables: {
      rsvps: {
        Row: RSVP
        Insert: {
          first_name: string
          last_name: string
          email: string
          attending: boolean
          attendance_type: AttendanceType
        }
        Update: Partial<{
          first_name: string
          last_name: string
          email: string
          attending: boolean
          attendance_type: AttendanceType
          reminder_sent: boolean
          reminder_sent_at: string | null
        }>
        Relationships: []
      }
      guest_list: {
        Row: Guest
        Insert: {
          first_name: string
          last_name: string
          enabled?: boolean
        }
        Update: Partial<{
          first_name: string
          last_name: string
          enabled: boolean
        }>
        Relationships: []
      }
    }
  }
}

export interface RSVPFormData {
  first_name: string
  last_name: string
  email: string
  attending: boolean
  attendance_type: AttendanceType
}

