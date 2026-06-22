'use client'

import { useState } from 'react'
import type { WeddingConfig } from '@/lib/config'

type FAQItem = WeddingConfig['faq'][number]

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

export default function FAQSection({ faqs }: { faqs: WeddingConfig['faq'] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
          {faqs.map((faq, index) => (
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

