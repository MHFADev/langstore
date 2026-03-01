import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { ShoppingCart, Star, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/30">

      {/* Image Container with Glow Effect */}
      <div className="aspect-[4/5] overflow-hidden bg-secondary/50 relative p-4">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10"></div>

        {product.image_url ? (
          <div className="relative w-full h-full rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-700 ease-out shadow-lg">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="flex h-full w-full rounded-xl items-center justify-center bg-secondary border border-border/50">
            <span className="text-muted-foreground text-sm font-medium">No image</span>
          </div>
        )}

        {/* Floating Badges */}
        {product.category && (
          <div className="absolute top-6 left-6 z-20">
            <span className="inline-flex items-center rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md border border-primary/10">
              {product.category}
            </span>
          </div>
        )}
        <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-primary/90 backdrop-blur-md p-1.5 rounded-full shadow-lg">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col space-y-3 p-5 relative z-20 -mt-6">
        <div className="space-y-1.5 bg-background/80 backdrop-blur-xl p-4 rounded-xl border border-primary/5 shadow-sm">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2 font-[family-name:var(--font-space-grotesk)]">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-600">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-bold">5.0</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description || 'Produk digital premium dengan jaminan aman.'}
          </p>
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-3">
          <div className="flex items-end justify-between px-2">
            <span className="text-xs font-medium text-muted-foreground">Harga</span>
            <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
              Rp {Number(product.price).toLocaleString('id-ID')}
            </p>
          </div>

          <Link
            href={`/checkout/${product.id}`}
            className="group/btn relative overflow-hidden inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 gap-2"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
            <ShoppingCart className="h-4 w-4" />
            <span className="relative z-10">Beli Sekarang</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
