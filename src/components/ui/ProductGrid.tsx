'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ui/ProductCard';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category || 'Other')))];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter((p) => (p.category || 'Other') === selectedCategory);

  return (
    <div>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {filteredProducts.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-10"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-dashed border-muted text-center">
          <p className="text-lg font-medium text-muted-foreground">Tidak ada produk di kategori ini.</p>
        </div>
      )}
    </div>
  );
}
