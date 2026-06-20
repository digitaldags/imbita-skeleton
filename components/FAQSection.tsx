'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const churchOnlyFAQs = new Set([
  'Can we skip the ceremony and go to the reception?',
  'We will be going to the church, what time should we arrive?',
  'Can we take pictures and videos during the ceremony?',
  'Can we sit anywhere on the church?',
])

const faqs: FAQItem[] = [
  {
    question: 'Can we skip the ceremony and go to the reception?',
    answer: "Of course! We'll see you at the reception, just answer the RSVP :)",
  },
  {
    question: 'We will be going to the church, what time should we arrive?',
    answer:
      'We kindly ask our guests to arrive at the church by 2:00 PM so we can begin the ceremony on time and maintain its solemn atmosphere.',
  },
  {
    question: 'Where should I park?',
    answer: 'There are plenty of parking slots both in the church and hotel venue.',
  },
  {
    question: 'I am coming from out of town. Where should I stay?',
    answer:
      'You may check AIRBNB for nearby hotels/accommodations or message us via FB messenger to avail the special discount in Admiral Hotel Manila.',
  },
  {
    question: 'Can we take pictures and videos during the ceremony?',
    answer:
      "Our ceremony is unplugged and we plan to keep it solemn. Please keep your phones and put it in silent mode during the processional and ceremony. Once we are pronounced as husband and wife, you're free to take photos and videos. Please keep the aisle clear during the bridal entrance.",
  },
  {
    question: 'Can we bring our kids?',
    answer:
      "As much as we love kids, we want the event to be for adults only. The only kids attending our wedding are those we requested. Thank you for understanding.",
  },
  {
    question: 'Do you have any gift preference?',
    answer:
      "We are grateful for the time and effort you'll be spending just to be there on our special day. We'll be thankful to receive monetary gifts as we build our family.",
  },
  {
    question: 'Can we bring a plus-one with me?',
    answer:
      "As much as we'd love to have everyone celebrate with us, unfortunately, we can only accommodate limited number of guests due to venue space and budget restrictions.",
  },
  {
    question: 'Can we sit anywhere on the church?',
    answer:
      'Church seating arrangements are strictly implemented to uphold the solemnity and organization of the worship service. We sincerely ask for your understanding and respect for this practice.',
  },
  {
    question: 'Can we sit anywhere at the reception?',
    answer:
      "It took us a lot of effort and discussion to finish the seating arrangement which is planned for everyone's convenience and network preference. You'll be seating along with family and friends.",
  },
  {
    question: 'Do we really need to RSVP?',
    answer: 'Yes. This will help us finalize the headcount for catering and seating arrangement.',
  },
  {
    question: 'When can we leave?',
    answer: 'We would appreciate it if you could stay with us until the end of the program (9pm).',
  },
  {
    question: 'How can we help the couple have the best time?',
    answer:
      "RSVP NOW. Wear APPROPRIATE attire. Be there ON TIME. Stay until the end of the program, don't eat and run. Have fun and enjoy! :)",
  },
]

function FAQItem({ faq, isOpen, onToggle }: { faq: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-wedding-beige-dark/30 last:border-b-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full py-5 px-6 flex items-start justify-between gap-4 text-left hover:bg-wedding-beige-light/30 transition-colors duration-200 group"
      >
        <span className="text-lg font-medium text-wedding-maroon-dark group-hover:text-wedding-maroon transition-colors">
          {faq.question}
        </span>
        <span
          className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-wedding-maroon transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 text-base text-wedding-maroon-dark/80 leading-relaxed">
          {faq.answer}
        </div>
      </div>
    </div>
  )
}

export default function FAQSection({ receptionOnly = false }: { receptionOnly?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const visibleFAQs = receptionOnly
    ? faqs.filter((faq) => !churchOnlyFAQs.has(faq.question))
    : faqs

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="w-full bg-gradient-to-b from-white to-wedding-beige-light py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-wedding-maroon-dark mb-4 tracking-wide">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-1 bg-wedding-maroon mx-auto my-6"></div>
          <p className="text-lg text-wedding-maroon-dark/70 max-w-2xl mx-auto">
            We&apos;ve compiled answers to some common questions. If you have any other concerns, please
            feel free to reach out to us.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-wedding-beige-dark/20">
          {visibleFAQs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-wedding-maroon-dark/60 italic">
            Still have questions? Feel free to message us on Facebook!
          </p>
        </div>
      </div>
    </section>
  )
}

