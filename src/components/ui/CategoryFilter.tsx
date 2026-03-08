'use client';

import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  // Ensure we don't have duplicates and 'All' is handled correctly
  const uniqueCategories = Array.from(new Set(categories));

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
      {uniqueCategories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={clsx(
            'relative px-4 py-2 text-sm font-medium transition-colors rounded-full',
            selectedCategory === category
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary'
          )}
        >
          {selectedCategory === category && (
            <motion.div
              layoutId="activeCategory"
              className="absolute inset-0 bg-primary rounded-full"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{category}</span>
        </button>
      ))}
    </div>
  );
}
