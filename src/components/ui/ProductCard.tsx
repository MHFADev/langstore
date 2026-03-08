'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm text-card-foreground shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      {/* Shine Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      
      {/* Border Gradient */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-primary/50 transition-all duration-500"></div>

      {/* Image Container with Glow Effect */}
      <div className="aspect-[4/5] overflow-hidden bg-secondary/30 relative p-3">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-60"></div>

        {product.image_url ? (
          <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Inner Glow on Hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ) : (
          <div className="flex h-full w-full rounded-xl items-center justify-center bg-secondary border border-border/50">
            <span className="text-muted-foreground text-sm font-medium">No image</span>
          </div>
        )}

        {/* Floating Badges */}
        {product.category && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-5 left-5 z-20"
          >
            <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md border border-white/10">
              {product.category}
            </span>
          </motion.div>
        )}
        
        <div className="absolute top-5 right-5 z-20">
            <motion.div 
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="bg-primary/90 backdrop-blur-md p-2 rounded-full shadow-lg cursor-pointer"
            >
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </motion.div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col space-y-3 p-5 relative z-20 -mt-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 font-[family-name:var(--font-space-grotesk)]">
              {product.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-yellow-500">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3 h-3 fill-current" />
                ))}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">(5.0)</span>
          </div>
        </div>

        <div className="mt-auto pt-3 flex flex-col gap-3">
          <div className="flex items-end justify-between px-1">
            <div className="flex flex-col">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Harga</span>
                <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Rp {Number(product.price).toLocaleString('id-ID')}
                </p>
            </div>
          </div>

          <Link
            href={`/checkout/${product.id}`}
            className="group/btn relative overflow-hidden inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 gap-2"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
            <ShoppingCart className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
            <span className="relative z-10">Beli Sekarang</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
