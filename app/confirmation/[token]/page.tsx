/**
 * RSVP Confirmation Page
 * Displays confirmation details after successful RSVP submission
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRSVPByToken } from '@/app/actions/confirmation'
import VenueInfo from '@/components/VenueInfo'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ConfirmationPageProps {
  params: {
    token: string
  }
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { token } = params
  const result = await getRSVPByToken(token)

  // Redirect to home if RSVP not found or invalid token
  if (!result.success || !result.data) {
    redirect('/')
  }

  const rsvp = result.data
  const attendanceLabel = {
    both: 'Both Church & Reception',
    church: 'Church Ceremony Only',
    reception: 'Reception Only',
  }[rsvp.attendance_type]

  return (
    <div className="min-h-screen bg-wedding-beige-light py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-wedding-maroon-dark mb-2">
            {rsvp.attending ? 'RSVP Confirmed!' : 'Response Received'}
          </h1>
          <p className="text-lg text-wedding-maroon">
            {rsvp.attending
              ? 'Your RSVP has been successfully recorded.'
              : 'Thank you for letting us know.'}
          </p>
        </div>

        {/* RSVP Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-xl font-semibold text-wedding-maroon-dark mb-4 border-b border-wedding-beige-dark pb-2">
            Your Details
          </h2>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-wedding-maroon/70 block mb-1">Guest Name</span>
              <p className="text-lg text-wedding-maroon-dark">
                {rsvp.first_name} {rsvp.last_name}
              </p>
            </div>

            <div>
              <span className="text-sm font-medium text-wedding-maroon/70 block mb-1">Email</span>
              <p className="text-wedding-maroon-dark">{rsvp.email}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-wedding-maroon/70 block mb-1">Attendance Status</span>
              <p className="text-wedding-maroon-dark">
                {rsvp.attending ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Attending
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Not Attending
                  </span>
                )}
              </p>
            </div>

            {rsvp.attending && (
              <div>
                <span className="text-sm font-medium text-wedding-maroon/70 block mb-1">
                  Attending
                </span>
                <p className="text-wedding-maroon-dark font-medium">{attendanceLabel}</p>
              </div>
            )}
          </div>
        </div>

        {/* Venue Information */}
        {rsvp.attending && (
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-2xl font-serif text-wedding-maroon-dark mb-4 text-center">
              Event Details
            </h2>
            <VenueInfo attendanceType={rsvp.attendance_type} isInc={rsvp.guest_is_inc} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <Link
            href={rsvp.attendance_type === 'reception' ? '/reception' : '/'}
            className="inline-block bg-wedding-maroon text-white px-8 py-3 rounded-lg font-semibold hover:bg-wedding-maroon-dark transition-colors duration-200 text-center"
          >
            Back to Home
          </Link>
          {rsvp.attending && (
            <Link
              href={rsvp.attendance_type === 'reception' ? '/reception#venue-details' : '/#venue-details'}
              className="inline-block bg-white text-wedding-maroon border-2 border-wedding-maroon px-8 py-3 rounded-lg font-semibold hover:bg-wedding-beige-light transition-colors duration-200 text-center"
            >
              View Full Venue Details
            </Link>
          )}
        </div>

        {/* Additional Note */}
        <div className="mt-8 text-center text-sm text-wedding-maroon/70 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <p>
            If you need to make changes to your RSVP, please contact us directly.
          </p>
        </div>
      </div>
    </div>
  )
}

