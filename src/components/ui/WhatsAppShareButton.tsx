'use client';

import { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';

interface WhatsAppShareButtonProps {
    productName: string;
    productUrl: string;
    className?: string;
}

export function WhatsAppShareButton({ productName, productUrl, className }: WhatsAppShareButtonProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleShare = () => {
        // Construct the text to share
        // Using "Saluran WA" branding as requested by user, but functionally it's a share
        const text = `Cek produk ini: *${productName}* \n\n${productUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (!isMounted) return null;

    return (
        <button
            onClick={handleShare}
            className={`group flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium py-2.5 px-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${className}`}
            aria-label="Share to WhatsApp"
        >
            <Share2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span>(Saluran WA)</span>
        </button>
    );
}
