import type { AttendanceType } from '@/lib/types'
import { config } from '@/lib/config'

interface VenueInfoProps {
  attendanceType: AttendanceType
}

export default function VenueInfo({ attendanceType }: VenueInfoProps) {
  const showCeremony = attendanceType === 'ceremony' || attendanceType === 'both'
  const showReception = attendanceType === 'reception' || attendanceType === 'both'

  return (
    <div className="space-y-8">
      {showCeremony && (
        <div className="bg-white border-l-4 border-wedding-primary p-6 rounded-r-lg shadow-sm">
          <h3 className="text-xl font-serif text-wedding-accent mb-4">
            Ceremony
          </h3>
          <div className="space-y-2 text-wedding-primary">
            <p>
              <span className="font-semibold">Venue:</span> {config.ceremony.name}
            </p>
            <p>
              <span className="font-semibold">Location:</span> {config.ceremony.address}
            </p>
            <p>
              <span className="font-semibold">Date:</span> {config.ceremony.date}
            </p>
            <p>
              <span className="font-semibold">Time:</span> {config.ceremony.time}
            </p>
            <p className="text-sm italic mt-4 text-wedding-primary/80">
              {config.ceremony.note}
            </p>
          </div>
        </div>
      )}

      {showReception && (
        <div className="bg-wedding-secondary border-l-4 border-wedding-primary p-6 rounded-r-lg shadow-sm">
          <h3 className="text-xl font-serif text-wedding-accent mb-4">
            Reception
          </h3>
          <div className="space-y-2 text-wedding-primary">
            <p>
              <span className="font-semibold">Venue:</span> {config.reception.name}
            </p>
            <p>
              <span className="font-semibold">Location:</span> {config.reception.address}
            </p>
            <p>
              <span className="font-semibold">Time:</span> {config.reception.time}
            </p>
            <p className="text-sm italic mt-4 text-wedding-primary/80">
              {config.reception.note}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
