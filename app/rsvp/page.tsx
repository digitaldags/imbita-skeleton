/**
 * RSVP form page
 */

import Link from 'next/link'
import { config } from '@/lib/config'
import RSVPForm from '@/components/RSVPForm'

export default function RSVPPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="mb-8">
            <Link
              href="/"
              className="text-wedding-primary hover:text-wedding-accent transition-colors"
            >
              ← Back to home
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif text-wedding-accent mb-2">
            RSVP
          </h1>
          <div className="w-24 h-1 bg-wedding-primary my-4"></div>
          <p className="text-wedding-primary mb-8">
            Please fill out the form below to let us know if you&apos;ll be joining us.
          </p>

          <RSVPForm
            showCeremony={config.sections.ceremony}
            showReception={config.sections.reception}
            ceremonyName={config.ceremony.name}
            receptionName={config.reception.name}
          />
        </div>
      </div>
    </div>
  )
}

