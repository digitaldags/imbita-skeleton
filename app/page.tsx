import Link from 'next/link'
import { config } from '@/lib/config'
import Hero from '@/components/Hero'
import VenueDetails from '@/components/VenueDetails'
import AttireDetails from '@/components/AttireDetails'
import FAQSection from '@/components/FAQSection'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-wedding-beige-light">
      <Hero couple={config.couple} images={config.hero.images} />

      {(config.sections.ceremony || config.sections.reception) && (
        <VenueDetails
          ceremony={config.ceremony}
          reception={config.reception}
          showCeremony={config.sections.ceremony}
          showReception={config.sections.reception}
        />
      )}

      {config.sections.attire && <AttireDetails attire={config.attire} />}

      {config.sections.faq && <FAQSection faqs={config.faq} />}

      {config.sections.rsvp && (
        <section className="w-full bg-white py-20">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-serif text-wedding-maroon-dark mb-4">
                Join Our Celebration
              </h2>
              <div className="w-24 h-1 bg-wedding-maroon mx-auto my-6"></div>
              <p className="text-lg text-wedding-maroon-dark mb-8">
                We can&apos;t wait to celebrate with you! Please RSVP by{' '}
                {config.rsvpDeadline} to help us plan for the perfect day.
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
      )}
    </main>
  )
}

