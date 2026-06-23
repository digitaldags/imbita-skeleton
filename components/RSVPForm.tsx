'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { submitRSVP } from '@/app/actions/rsvp'
import type { RSVPFormData, AttendanceType } from '@/lib/types'

export default function RSVPForm({
  showCeremony,
  showReception,
  ceremonyName,
  receptionName,
}: {
  showCeremony: boolean
  showReception: boolean
  ceremonyName: string
  receptionName: string
}) {
  const router = useRouter()

  const showAttendanceType = showCeremony && showReception
  const singleType: AttendanceType = showCeremony ? 'ceremony' : 'reception'

  const attendanceOptions: { value: AttendanceType; label: string }[] = [
    { value: 'both',      label: 'Both Events' },
    { value: 'ceremony',  label: `${ceremonyName} Only` },
    { value: 'reception', label: `${receptionName} Only` },
  ]

  const [formData, setFormData] = useState<RSVPFormData>({
    first_name: '',
    last_name: '',
    email: '',
    attending: true,
    attendance_type: showAttendanceType ? 'both' : singleType,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    setShowErrorModal(false)

    try {
      const result = await submitRSVP(formData)

      if (result.success && result.token) {
        router.push(`/confirmation/${result.token}`)
      } else {
        if (
          result.error?.includes('not in our guest list') ||
          result.error?.includes('guest list')
        ) {
          setShowErrorModal(true)
        } else {
          setMessage({ type: 'error', text: result.error || 'Something went wrong. Please try again.' })
        }
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again or contact us for assistance.',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-wedding-accent mb-2">
            First Name *
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            required
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="w-full px-4 py-2 border border-wedding-beige-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-primary focus:border-transparent"
            placeholder="Your first name"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-wedding-accent mb-2">
            Last Name *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            required
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="w-full px-4 py-2 border border-wedding-beige-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-primary focus:border-transparent"
            placeholder="Your last name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-wedding-accent mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-wedding-beige-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-primary focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-wedding-accent mb-3">
            Will you be attending? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="attending"
                checked={formData.attending === true}
                onChange={() => setFormData({ ...formData, attending: true })}
                className="mr-2 text-wedding-primary focus:ring-wedding-primary"
              />
              <span className="text-wedding-accent">Yes, I&apos;ll be there!</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="attending"
                checked={formData.attending === false}
                onChange={() => setFormData({ ...formData, attending: false })}
                className="mr-2 text-wedding-primary focus:ring-wedding-primary"
              />
              <span className="text-wedding-accent">Sorry, I can&apos;t make it</span>
            </label>
          </div>
        </div>

        {formData.attending && showAttendanceType && (
          <div>
            <label className="block text-sm font-medium text-wedding-accent mb-3">
              Attendance Preference *
            </label>
            <div className="space-y-2">
              {attendanceOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="attendance_type"
                    value={option.value}
                    checked={formData.attendance_type === option.value}
                    onChange={(e) => setFormData({ ...formData, attendance_type: e.target.value as AttendanceType })}
                    className="mr-2 text-wedding-primary focus:ring-wedding-primary"
                  />
                  <span className="text-wedding-accent">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {formData.attending && !showAttendanceType && (
          <div className="bg-wedding-secondary border border-wedding-beige-dark rounded-lg px-4 py-3">
            <p className="text-sm font-medium text-wedding-accent">
              Attendance: <span className="font-semibold">
                {showCeremony ? ceremonyName : receptionName}
              </span>
            </p>
          </div>
        )}

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-wedding-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-wedding-accent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
        </button>
      </form>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-wedding-accent mb-4">
              Guest Not Found
            </h3>
            <p className="text-wedding-primary mb-6">
              Your name is not in our guest list. Please contact us if you believe this is an error.
            </p>
            <button
              onClick={() => {
                setShowErrorModal(false)
                setIsSubmitting(false)
              }}
              className="w-full bg-wedding-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-wedding-accent transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
