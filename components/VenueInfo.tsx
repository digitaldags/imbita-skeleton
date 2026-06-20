/**
 * Venue Information component
 * Displays venue details based on attendance type
 */

import type { AttendanceType } from '@/lib/types'
import ChurchReminders from '@/components/ChurchReminders'

interface VenueInfoProps {
  attendanceType: AttendanceType
  isInc?: boolean
}

export default function VenueInfo({ attendanceType, isInc = false }: VenueInfoProps) {
  const showChurch = attendanceType === 'church' || attendanceType === 'both'
  const showReception = attendanceType === 'reception' || attendanceType === 'both'
  const showChurchReminders = showChurch && !isInc

  return (
    <div className="space-y-8">
      {showChurch && (
        <div className="bg-white border-l-4 border-wedding-maroon p-6 rounded-r-lg shadow-sm">
          <h3 className="text-xl font-serif text-wedding-maroon-dark mb-4">
            Church Ceremony
          </h3>
          <div className="space-y-2 text-wedding-maroon">
            <p>
              <span className="font-semibold">Venue:</span> Iglesia Ni Cristo – Locale of Pasay
            </p>
            <p>
              <span className="font-semibold">Location:</span> Pasay City, Metro Manila
            </p>
            <p>
              <span className="font-semibold">Date:</span> May 2, 2026
            </p>
            <p>
              <span className="font-semibold">Time:</span> 2:00 PM
            </p>
            <p className="text-sm italic mt-4 text-wedding-maroon/80">
              Please arrive 15–20 minutes early to be seated before the ceremony begins.
            </p>
          </div>
        </div>
      )}

      {showChurchReminders && (
        <ChurchReminders />
      )}

      {showReception && (
        <div className="bg-wedding-beige-light border-l-4 border-wedding-maroon p-6 rounded-r-lg shadow-sm">
          <h3 className="text-xl font-serif text-wedding-maroon-dark mb-4">
            Reception
          </h3>
          <div className="space-y-2 text-wedding-maroon">
            <p>
              <span className="font-semibold">Venue:</span> Admiral Hotel Manila – MGallery
            </p>
            <p>
              <span className="font-semibold">Location:</span> Roxas Boulevard, Manila
            </p>
            <p>
              <span className="font-semibold">Time:</span> 6:00 PM
            </p>
            <p className="text-sm italic mt-4 text-wedding-maroon/80">
              Join us for dinner, dancing, and celebration as we begin our journey together.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

