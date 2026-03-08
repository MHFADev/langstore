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
    if (category === selectedCategory) return;

    const params = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    // Use transition to prioritize responsiveness of the click
    const newUrl = `/?${params.toString()}#catalog`;
    router.push(newUrl, { scroll: false });
  };

  // Use provided categories or get unique categories from products
  const categories = allCategories || ['All', ...Array.from(new Set(products.map((p) => p.category || 'Other')))];

  // Add a useMemo for filtered products to ensure no unnecessary calculations
  const filteredProducts = products; 

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
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-8"
          >
            <AnimatePresence mode='wait' initial={false}>
              {filteredProducts.map((product) => (
                <StaggerItem
                  key={`${selectedCategory}-${product.id}`}
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
          <div className="flex h-60 flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-dashed border-muted text-center animate-in fade-in duration-300">
            <p className="text-lg font-medium text-muted-foreground">Tidak ada produk di kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
