'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Banner } from '@/types';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface HeroCarouselProps {
    banners: Banner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 });
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
        emblaApi.on('reInit', onSelect);

        // Auto-play
        const intervalId = setInterval(() => {
            if (emblaApi.canScrollNext()) {
                emblaApi.scrollNext();
            } else {
                emblaApi.scrollTo(0);
            }
        }, 6000); // 6 seconds

        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
            clearInterval(intervalId);
        };
    }, [emblaApi, onSelect]);

    if (activeBanners.length === 0) return null;

    return (
        <div className="relative group perspective-1000 w-full max-w-full overflow-hidden">
            <div 
                className="overflow-hidden rounded-xl md:rounded-3xl shadow-2xl border-4 border-white/10 aspect-[16/9] md:aspect-[2.5/1] relative z-10 w-full bg-muted" 
                ref={emblaRef}
            >
                <div className="flex touch-pan-y h-full">
                    {activeBanners.map((banner, index) => (
                        <div className="relative flex-[0_0_100%] min-w-0 h-full" key={banner.id}>
                            <div className="relative w-full h-full">
                                <Image
                                    src={banner.image_url}
                                    alt={banner.title || 'Banner Promo'}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                                />
                                {/* Dynamic Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none"></div>
                                
                                {/* Content with Staggered Animation */}
                                <div className="absolute inset-0 flex items-end p-4 md:p-12 text-white">
                                    <AnimatePresence mode='wait'>
                                        {selectedIndex === index && (
                                            <div className="w-full max-w-3xl space-y-2 md:space-y-4">
                                                {banner.title && (
                                                    <motion.h2 
                                                        initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
                                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                                        exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
                                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                                        className="text-2xl md:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70"
                                                    >
                                                        {banner.title}
                                                    </motion.h2>
                                                )}
                                                {banner.description && (
                                                    <motion.p 
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -5 }}
                                                        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                                                        className="text-xs md:text-lg lg:text-xl text-gray-200 max-w-xl leading-relaxed drop-shadow-md font-medium line-clamp-2 md:line-clamp-none"
                                                    >
                                                        {banner.description}
                                                    </motion.p>
                                                )}
                                                {banner.link_url && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.4, delay: 0.2 }}
                                                        className="pt-2 md:pt-4"
                                                    >
                                                        <a 
                                                            href={banner.link_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="relative inline-flex overflow-hidden group/btn px-4 py-2 md:px-6 md:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-xs md:text-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95 items-center gap-2"
                                                            aria-label={`Lihat promo: ${banner.title}`}
                                                        >
                                                            <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                                                            <span>Lihat Promo</span>
                                                            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                                        </a>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Glowing Border Effect behind Carousel - Hidden on mobile for performance */}
            <div className="hidden md:block absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 -z-10"></div>

            {/* Navigation Buttons - Hidden on mobile, visible on desktop hover */}
            <div className="hidden md:block">
                <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/10 hover:scale-110 active:scale-90 z-20"
                    onClick={() => emblaApi?.scrollPrev()}
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/10 hover:scale-110 active:scale-90 z-20"
                    onClick={() => emblaApi?.scrollNext()}
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20 bg-black/20 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/5">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out ${
                            index === selectedIndex 
                                ? 'bg-white w-6 md:w-8 shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                                : 'bg-white/30 w-1.5 md:w-2 hover:bg-white/60 hover:w-3 md:hover:w-4'
                        }`}
                        onClick={() => scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
