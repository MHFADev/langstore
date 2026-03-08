'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/ui/FramerWrapper';

interface ProductGridProps {
  products: Product[];
  allCategories?: string[];
}

export function ProductGrid({ products, allCategories }: ProductGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get('category') || 'All';

  const setSelectedCategory = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/?${params.toString()}#catalog`, { scroll: false });
  };

  // Use provided categories or get unique categories from products
  const categories = allCategories || ['All', ...Array.from(new Set(products.map((p) => p.category || 'Other')))];

  const filteredProducts = products; // Already filtered on server if allCategories is provided

  return (
    <div className="w-full">
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div key={selectedCategory} className="min-h-[400px]">
        {filteredProducts.length > 0 ? (
          <StaggerContainer
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-10"
          >
            <AnimatePresence mode='popLayout' initial={true}>
              {filteredProducts.map((product) => (
                <StaggerItem
                  key={`${selectedCategory}-${product.id}`}
                  layout
                  className="w-full"
                >
                  <div data-category={product.category || 'Other'}>
                    <ProductCard product={product} />
                  </div>
                </StaggerItem>
              ))}
            </AnimatePresence>
          </StaggerContainer>
        ) : (
          <div className="flex h-60 flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-dashed border-muted text-center animate-in fade-in duration-500">
            <p className="text-lg font-medium text-muted-foreground">Tidak ada produk di kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
