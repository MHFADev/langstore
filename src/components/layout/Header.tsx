import Link from 'next/link';
import { Search, ShoppingBag } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2 group">
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-300">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-foreground font-[family-name:var(--font-space-grotesk)] group-hover:text-primary transition-colors">
            LANG STR
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="relative w-full max-w-xs md:max-w-sm group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="search"
              placeholder="Cari produk digital..."
              className="h-10 w-full rounded-full border border-primary/20 bg-secondary/50 pl-10 pr-4 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:bg-background hover:bg-secondary/80 focus:shadow-md"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
