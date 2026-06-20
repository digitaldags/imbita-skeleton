/**
 * Venue Details component
 * Displays ceremony and reception venue information with images
 */

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function VenueDetails({ showChurch = true }: { showChurch?: boolean }) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    return (
        <div className="w-full" id="venue-details">
            {/* Ceremony Section */}
            {showChurch && <section className="w-full bg-white py-20 md:py-32">
                <div
                    className={`max-w-6xl mx-auto px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-serif text-wedding-maroon-dark mb-4">
                            Church Ceremony
                        </h2>
                        <p className="text-lg text-wedding-maroon italic">
                            Where our union begins
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                        <div className="space-y-6 order-1">
                            <div>
                                <h3 className="text-2xl font-semibold text-wedding-maroon-dark mb-3">
                                    Iglesia Ni Cristo – Locale of Pasay
                                </h3>
                                <p className="text-wedding-maroon mb-2">
                                    <span className="font-medium">Location:</span> Pasay City,
                                    Metro Manila
                                </p>
                                <p className="text-wedding-maroon mb-2">
                                    <span className="font-medium">Date:</span> May 2, 2026
                                </p>
                                <p className="text-wedding-maroon mb-4">
                                    <span className="font-medium">Time:</span> Ceremony starts at
                                    2:00 PM
                                </p>
                                <div className="bg-wedding-beige-light border-l-4 border-wedding-maroon p-4 rounded-r-lg">
                                    <p className="text-sm text-wedding-maroon-dark">
                                        <span className="font-semibold">Note:</span> Please arrive
                                        15–20 minutes early to be seated before the ceremony begins.
                                    </p>
                                </div>

                                {/* QR Code Card - Hidden on mobile, shown on desktop */}
                                <div className="hidden md:block mt-6 bg-wedding-beige-light/50 border border-wedding-beige-dark rounded-lg p-4 shadow-sm">
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="flex-shrink-0 bg-white p-2 rounded-lg shadow-sm">
                                            <Image
                                                src="/qr-church.png"
                                                alt="QR Code for Church Directions"
                                                width={96}
                                                height={96}
                                                className="w-24 h-24"
                                            />
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="text-base font-serif text-wedding-maroon-dark mb-1">
                                                Scan for Directions
                                            </p>
                                            <p className="text-xs text-wedding-maroon/70">
                                                Opens in Google Maps
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full order-2">
                            <div className="rounded-xl overflow-hidden shadow-lg relative aspect-[4/3]">
                                <Image
                                    src="/church-ceremony-1.png"
                                    alt="Iglesia Ni Cristo - Locale of Pasay"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>

                        {/* QR Code Card - Shown on mobile only, appears after image */}
                        <div className="block md:hidden order-3">
                            <div className="bg-wedding-beige-light/50 border border-wedding-beige-dark rounded-lg p-4 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex-shrink-0 bg-white p-2 rounded-lg shadow-sm">
                                        <Image
                                            src="/qr-church.png"
                                            alt="QR Code for Church Directions"
                                            width={96}
                                            height={96}
                                            className="w-24 h-24"
                                        />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-base font-serif text-wedding-maroon-dark mb-1">
                                            Scan for Directions
                                        </p>
                                        <p className="text-xs text-wedding-maroon/70">
                                            Opens in Google Maps
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>}

            {/* Reception Section */}
            <section className="w-full bg-wedding-beige-light py-20 md:py-32">
                <div
                    className={`max-w-6xl mx-auto px-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                >
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-serif text-wedding-maroon-dark mb-4">
                            Reception Venue
                        </h2>
                        <p className="text-lg text-wedding-maroon italic">
                            Where we celebrate together
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                        <div className="space-y-6 order-1 md:order-2">
                            <div>
                                <h3 className="text-2xl font-semibold text-wedding-maroon-dark mb-3">
                                    Admiral M Gallery Hotel
                                </h3>
                                <p className="text-wedding-maroon mb-2">
                                    <span className="font-medium">Location:</span> Roxas
                                    Boulevard, Manila
                                </p>
                                <p className="text-wedding-maroon mb-4">
                                    <span className="font-medium">Time:</span> Reception
                                    starts at 6:00 PM
                                </p>
                                <div className="bg-white border-l-4 border-wedding-maroon p-4 rounded-r-lg shadow-sm">
                                    <p className="text-sm text-wedding-maroon-dark">
                                        Join us for dinner, dancing, and celebration as we begin our
                                        journey together as husband and wife.
                                    </p>
                                </div>

                                {/* QR Code Card - Hidden on mobile, shown on desktop */}
                                <div className="hidden md:block mt-6 bg-white/80 border border-wedding-beige-dark rounded-lg p-4 shadow-sm">
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="flex-shrink-0 bg-white p-2 rounded-lg shadow-sm">
                                            <Image
                                                src="/qr-reception.png"
                                                alt="QR Code for Reception Directions"
                                                width={96}
                                                height={96}
                                                className="w-24 h-24"
                                            />
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="text-base font-serif text-wedding-maroon-dark mb-1">
                                                Scan for Directions
                                            </p>
                                            <p className="text-xs text-wedding-maroon/70">
                                                Opens in Google Maps
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full order-2 md:order-1">
                            <div className="rounded-xl overflow-hidden shadow-lg relative aspect-[4/3]">
                                <Image
                                    src="/reception-hotel.jpg"
                                    alt="Admiral Hotel Manila – MGallery"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>

                        {/* QR Code Card - Shown on mobile only, appears after image */}
                        <div className="block md:hidden order-3">
                            <div className="bg-white/80 border border-wedding-beige-dark rounded-lg p-4 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex-shrink-0 bg-white p-2 rounded-lg shadow-sm">
                                        <Image
                                            src="/qr-reception.png"
                                            alt="QR Code for Reception Directions"
                                            width={96}
                                            height={96}
                                            className="w-24 h-24"
                                        />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-base font-serif text-wedding-maroon-dark mb-1">
                                            Scan for Directions
                                        </p>
                                        <p className="text-xs text-wedding-maroon/70">
                                            Opens in Google Maps
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

