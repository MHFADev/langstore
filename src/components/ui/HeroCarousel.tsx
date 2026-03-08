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
    }, [emblaApi, setScrollSnaps, onSelect]);

    if (activeBanners.length === 0) return null;

    return (
        <div className="relative group perspective-1000">
            <div 
                className="overflow-hidden rounded-3xl shadow-2xl border-4 border-white/10 aspect-[16/9] md:aspect-[2.5/1] relative z-10" 
                ref={emblaRef}
            >
                <div className="flex touch-pan-y">
                    {activeBanners.map((banner, index) => (
                        <div className="relative flex-[0_0_100%] min-w-0" key={banner.id}>
                            <div className="relative w-full h-full aspect-[16/9] md:aspect-[2.5/1]">
                                <Image
                                    src={banner.image_url}
                                    alt={banner.title || 'Banner'}
                                    fill
                                    className="object-cover transition-transform duration-[10s] ease-linear scale-100 group-hover:scale-105"
                                    priority={index === 0}
                                />
                                {/* Dynamic Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none"></div>
                                
                                {/* Content with Staggered Animation */}
                                <div className="absolute inset-0 flex items-end p-6 md:p-12 text-white">
                                    <AnimatePresence mode='wait'>
                                        {selectedIndex === index && (
                                            <div className="max-w-3xl space-y-4">
                                                {banner.title && (
                                                    <motion.h2 
                                                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                                        exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
                                                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                                        className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70"
                                                    >
                                                        {banner.title}
                                                    </motion.h2>
                                                )}
                                                {banner.description && (
                                                    <motion.p 
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                                                        className="text-sm md:text-lg lg:text-xl text-gray-200 max-w-xl leading-relaxed drop-shadow-md font-medium"
                                                    >
                                                        {banner.description}
                                                    </motion.p>
                                                )}
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.5, delay: 0.3 }}
                                                    className="pt-4"
                                                >
                                                    <button className="relative overflow-hidden group/btn px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-sm transition-all hover:bg-white/20 hover:scale-105 active:scale-95 flex items-center gap-2">
                                                        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                                                        <span>Lihat Promo</span>
                                                        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                                    </button>
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Glowing Border Effect behind Carousel */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 -z-10 animate-pulse"></div>

            {/* Navigation Buttons */}
            <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/10 hover:scale-110 active:scale-90 z-20"
                onClick={() => emblaApi?.scrollPrev()}
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/10 hover:scale-110 active:scale-90 z-20"
                onClick={() => emblaApi?.scrollNext()}
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${
                            index === selectedIndex 
                                ? 'bg-white w-8 shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                                : 'bg-white/30 w-2 hover:bg-white/60 hover:w-4'
                        }`}
                        onClick={() => scrollTo(index)}
                    />
                ))}
            </div>
        </div>
    );
}
