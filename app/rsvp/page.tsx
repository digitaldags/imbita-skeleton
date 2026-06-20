/**
 * RSVP form page
 */

import Link from 'next/link'
import RSVPForm from '@/components/RSVPForm'

export default function RSVPPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="mb-8">
            <Link
              href="/"
              className="text-wedding-maroon hover:text-wedding-maroon-dark transition-colors"
            >
              ← Back to home
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif text-wedding-maroon-dark mb-2">
            RSVP
          </h1>
          <div className="w-24 h-1 bg-wedding-maroon my-4"></div>
          <p className="text-wedding-maroon mb-8">
            Please fill out the form below to let us know if you&apos;ll be joining us.
          </p>

          <RSVPForm />
        </div>
      </div>
    </div>
  )
}

