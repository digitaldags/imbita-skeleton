/**
 * Attire Details Component
 * Recreates the attire section from the physical wedding invitation
 */

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function AttireDetails() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Color palette from the invitation
  const colorPalette = [
    { name: 'Deep Forest Green', hex: '#2D5016' },
    { name: 'Standard Green', hex: '#5F8A3D' },
    { name: 'Olive Green', hex: '#A4A865' },
    { name: 'Sand Beige', hex: '#D4B896' },
    { name: 'Deep Brown', hex: '#5B3A29' },
  ]

  return (
    <section className="w-full bg-wedding-beige-light py-20 md:py-12 relative overflow-hidden">
      {/* Subtle paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      <div
        className={`max-w-4xl mx-auto px-4 relative z-10 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex flex-col items-center">
          {/* Centered Attire Information */}
          <div className="space-y-8 md:space-y-4 w-full">
            {/* Heading */}
            <div className="text-center">
              <h2 className="text-5xl md:text-6xl font-serif text-wedding-maroon-dark mb-3 md:mb-2 tracking-wide">
                ATTIRE
              </h2>
              <p className="text-2xl md:text-3xl font-serif text-wedding-maroon italic">
                Strictly Formal
              </p>
            </div>

            {/* Dress Code Details */}
            <div className="space-y-3 md:space-y-2 text-lg md:text-xl text-wedding-maroon-dark text-center">
              <p className="font-medium">
                <span className="font-semibold">Gentlemen</span> 
                <span className="mx-2">|</span> 
                <span className="italic">Barong Tagalog</span>
              </p>
              <p className="font-medium">
                <span className="font-semibold">Ladies</span> 
                <span className="mx-2">|</span> 
                <span className="italic">Long Gown / Dress</span>
              </p>
            </div>

            {/* Illustrations and Color Palette */}
            <div className="flex flex-col items-center gap-6 md:gap-4 pt-4 md:pt-2">
              {/* Character Illustrations */}
              <div className="flex items-end justify-center gap-1.5 sm:gap-4">
                {/* Lady in Green Gown */}
                <div className="relative w-32 h-52 sm:w-48 sm:h-72 md:w-56 md:h-96 flex-shrink-0">
                  <Image
                    src="/green-gown.png"
                    alt="Lady in Green Gown"
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 128px, (max-width: 768px) 192px, 224px"
                  />
                </div>

                {/* Color Palette Circles */}
                <div className="flex gap-0.5 sm:gap-2 items-center px-1 sm:px-4 flex-shrink-0 self-center">
                  {colorPalette.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full shadow-sm sm:shadow-md border border-white sm:border-2 flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>

                {/* Gentleman in Barong */}
              <div className="relative w-32 h-52 sm:w-48 sm:h-72 md:w-56 md:h-96 flex-shrink-0">
                  <Image
                    src="/barong-tagalog.png"
                    alt="Gentleman in Barong Tagalog"
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 128px, (max-width: 768px) 192px, 244px"
                  />
                </div>
              </div>

              {/* Additional Note */}
              <div className="bg-white/60 backdrop-blur-sm border-l-4 border-wedding-maroon p-4 rounded-r-lg shadow-sm max-w-md mx-auto">
                <p className="text-sm text-wedding-maroon-dark leading-relaxed text-center">
                  Please honor the dress code and color palette to ensure a cohesive and 
                  elegant celebration aesthetic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

