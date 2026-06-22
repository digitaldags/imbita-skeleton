/**
 * Full-width hero header for the landing page.
 * Features an automatic slideshow with 3 images, sliding transitions,
 * manual navigation with arrow buttons, and customizable focal points for mobile responsiveness.
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Great_Vibes } from 'next/font/google'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { WeddingConfig } from '@/lib/config'

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
})

export default function Hero({
  couple,
  images,
}: {
  couple: WeddingConfig['couple']
  images: Array<{ src: string; mobileSrc: string }>
}) {
  const slides = images.map((image, index) => ({
    src: `/${image.src}`,
    mobileSrc: `/${image.mobileSrc}`,
    alt: `Couple photo ${index + 1}`,
    objectPosition: 'center center',
    mobileObjectPosition: 'center center',
  }))

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (!prefersReducedMotion && !isAutoPlayPaused) {
      const interval = setInterval(() => {
        setIsTransitioning(true)
        setCurrentIndex((prev) => prev + 1)
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [isAutoPlayPaused])

  useEffect(() => {
    if (currentIndex === slides.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(0)
      }, 1000)
      
      return () => clearTimeout(timeout)
    }
  }, [currentIndex])

  const goToNext = () => {
    setIsAutoPlayPaused(true)
    setIsTransitioning(true)
    setCurrentIndex((prev) => prev + 1)
  }

  const goToPrevious = () => {
    setIsAutoPlayPaused(true)
    if (currentIndex === 0) {
      setIsTransitioning(false)
      setCurrentIndex(slides.length)
      setTimeout(() => {
        setIsTransitioning(true)
        setCurrentIndex(slides.length - 1)
      }, 50)
    } else {
      setIsTransitioning(true)
      setCurrentIndex((prev) => prev - 1)
    }
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slideshow container */}
      <div 
        className="absolute inset-0 flex"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 1000ms ease-in-out' : 'none'
        }}
      >
        {[...slides, slides[0]].map((slide, index) => (
          <div key={index} className="relative min-w-full h-full">
            <Image
              src={slide.mobileSrc}
              alt={slide.alt}
              fill
              priority={index === 0}
              quality={95}
              sizes="100vw"
              className="object-cover md:hidden"
              style={{ objectPosition: slide.mobileObjectPosition || slide.objectPosition }}
            />
            
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              quality={95}
              sizes="100vw"
              className="object-cover hidden md:block"
              style={{ objectPosition: slide.objectPosition }}
            />
          </div>
        ))}
      </div>

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 md:bg-black/45" />

      {/* Centered content */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="text-center text-white space-y-4 md:space-y-6 animate-fade-in-up">
          <p className="text-sm uppercase tracking-[0.35em] md:tracking-[0.45em] text-wedding-beige-light">
            Save the Date
          </p>

          <h1
            className={`${greatVibes.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-wedding-beige-light`}
          >
            {couple.partner1} &amp; {couple.partner2}
          </h1>

          <p className="text-xs sm:text-sm md:text-base tracking-[0.25em] uppercase text-wedding-beige-light/90">
            {couple.date} · {couple.location}
          </p>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 
                   bg-white/20 hover:bg-white/30 backdrop-blur-sm
                   rounded-full p-2 md:p-3 transition-all
                   focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10
                   bg-white/20 hover:bg-white/30 backdrop-blur-sm
                   rounded-full p-2 md:p-3 transition-all
                   focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>
    </section>
  )
}


