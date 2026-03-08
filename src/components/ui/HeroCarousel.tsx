'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Banner } from '@/types';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
    banners: Banner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const activeBanners = banners.filter(b => b.is_active).sort((a, b) => a.sort_order - b.sort_order);

    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        
        // Auto-play
        const intervalId = setInterval(() => {
            if (emblaApi.canScrollNext()) {
                emblaApi.scrollNext();
            } else {
                emblaApi.scrollTo(0);
            }
        }, 5000); // 5 seconds

        return () => {
            emblaApi.off('select', onSelect);
            clearInterval(intervalId);
        };
    }, [emblaApi, onSelect]);

    if (activeBanners.length === 0) return null;

    return (
        <div className="relative group">
            <div className="overflow-hidden rounded-3xl shadow-2xl border-4 border-white/10 aspect-[16/9] md:aspect-[2.5/1]" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {activeBanners.map((banner) => (
                        <div className="relative flex-[0_0_100%] min-w-0" key={banner.id}>
                            <div className="relative w-full h-full aspect-[16/9] md:aspect-[2.5/1]">
                                <Image
                                    src={banner.image_url}
                                    alt={banner.title || 'Banner'}
                                    fill
                                    className="object-cover"
                                    priority={true}
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                                
                                {/* Content */}
                                {(banner.title || banner.description) && (
                                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            {banner.title && (
                                                <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-md">
                                                    {banner.title}
                                                </h2>
                                            )}
                                            {banner.description && (
                                                <p className="text-sm md:text-lg text-gray-200 max-w-2xl drop-shadow-sm">
                                                    {banner.description}
                                                </p>
                                            )}
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                onClick={() => emblaApi?.scrollPrev()}
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                onClick={() => emblaApi?.scrollNext()}
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                            index === selectedIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                        }`}
                        onClick={() => scrollTo(index)}
                    />
                ))}
            </div>
        </div>
    );
}
