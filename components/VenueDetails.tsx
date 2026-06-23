'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { WeddingConfig } from '@/lib/config'

interface VenueDetailsProps {
  ceremony: WeddingConfig['ceremony']
  reception: WeddingConfig['reception']
  showCeremony: boolean
  showReception: boolean
}

export default function VenueDetails({ ceremony, reception, showCeremony, showReception }: VenueDetailsProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true)
    }, [])

    return (
        <div className="w-full" id="venue-details">
            {showCeremony && (
                <section className="w-full bg-white py-20 md:py-32">
                    <div
                        className={`max-w-6xl mx-auto px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-serif text-wedding-accent mb-4">
                                Ceremony
                            </h2>
                            <p className="text-lg text-wedding-primary italic">
                                Where our union begins
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                            <div className="space-y-6 order-1">
                                <div>
                                    <h3 className="text-2xl font-semibold text-wedding-accent mb-3">
                                        {ceremony.name}
                                    </h3>
                                    <p className="text-wedding-primary mb-2">
                                        <span className="font-medium">Location:</span> {ceremony.address}
                                    </p>
                                    <p className="text-wedding-primary mb-2">
                                        <span className="font-medium">Date:</span> {ceremony.date}
                                    </p>
                                    <p className="text-wedding-primary mb-4">
                                        <span className="font-medium">Time:</span> Ceremony starts at {ceremony.time}
                                    </p>
                                    <div className="bg-wedding-secondary border-l-4 border-wedding-primary p-4 rounded-r-lg">
                                        <p className="text-sm text-wedding-accent">
                                            <span className="font-semibold">Note:</span> {ceremony.note}
                                        </p>
                                    </div>

                                    <div className="hidden md:block mt-6">
                                        <a
                                            href={ceremony.mapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block bg-wedding-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-wedding-accent transition-colors duration-200 shadow-sm text-sm"
                                        >
                                            Get Directions
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full order-2">
                                <div className="rounded-xl overflow-hidden shadow-lg relative aspect-[4/3]">
                                    <Image
                                        src={`/${ceremony.image}`}
                                        alt={ceremony.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            </div>

                            <div className="block md:hidden order-3">
                                <a
                                    href={ceremony.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-wedding-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-wedding-accent transition-colors duration-200 shadow-sm text-sm"
                                >
                                    Get Directions
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {showReception && (
                <section className="w-full bg-wedding-secondary py-20 md:py-32">
                    <div
                        className={`max-w-6xl mx-auto px-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl md:text-5xl font-serif text-wedding-accent mb-4">
                                Reception Venue
                            </h2>
                            <p className="text-lg text-wedding-primary italic">
                                Where we celebrate together
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                            <div className="space-y-6 order-1 md:order-2">
                                <div>
                                    <h3 className="text-2xl font-semibold text-wedding-accent mb-3">
                                        {reception.name}
                                    </h3>
                                    <p className="text-wedding-primary mb-2">
                                        <span className="font-medium">Location:</span> {reception.address}
                                    </p>
                                    <p className="text-wedding-primary mb-4">
                                        <span className="font-medium">Time:</span> Reception starts at {reception.time}
                                    </p>
                                    <div className="bg-white border-l-4 border-wedding-primary p-4 rounded-r-lg shadow-sm">
                                        <p className="text-sm text-wedding-accent">
                                            {reception.note}
                                        </p>
                                    </div>

                                    <div className="hidden md:block mt-6">
                                        <a
                                            href={reception.mapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block bg-wedding-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-wedding-accent transition-colors duration-200 shadow-sm text-sm"
                                        >
                                            Get Directions
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full order-2 md:order-1">
                                <div className="rounded-xl overflow-hidden shadow-lg relative aspect-[4/3]">
                                    <Image
                                        src={`/${reception.image}`}
                                        alt={reception.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            </div>

                            <div className="block md:hidden order-3">
                                <a
                                    href={reception.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-wedding-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-wedding-accent transition-colors duration-200 shadow-sm text-sm"
                                >
                                    Get Directions
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
