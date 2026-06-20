/**
 * Landing page with wedding details and link to RSVP
 */

import Link from 'next/link'
import Hero from '@/components/Hero'
import VenueDetails from '@/components/VenueDetails'
import AttireDetails from '@/components/AttireDetails'
import FAQSection from '@/components/FAQSection'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-wedding-beige-light">
      {/* Full-screen hero */}
      <Hero />

      {/* Venue Details Section */}
      <VenueDetails />

      {/* Attire Details Section */}
      <AttireDetails />

      {/* FAQ Section */}
      <FAQSection />

      {/* RSVP CTA Section */}
      <section className="w-full bg-white py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-wedding-maroon-dark mb-4">
              Join Our Celebration
            </h2>
            <div className="w-24 h-1 bg-wedding-maroon mx-auto my-6"></div>
            <p className="text-lg text-wedding-maroon-dark mb-8">
              We can&apos;t wait to celebrate with you! Please RSVP by April 2nd
              to help us plan for the perfect day.
            </p>

            <Link
              href="/rsvp"
              className="inline-block bg-wedding-maroon text-white px-8 py-3 rounded-lg font-semibold hover:bg-wedding-maroon-dark transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              RSVP Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

