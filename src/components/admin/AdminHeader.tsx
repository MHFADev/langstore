'use client';

import { SignOutButton } from '@/components/admin/SignOutButton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Settings, LayoutDashboard, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface AdminHeaderProps {
  userEmail?: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/admin/dashboard", label: "Produk", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Pesanan", icon: ({ className }: { className?: string }) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={clsx("lucide lucide-shopping-bag", className)}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
    )},
    { href: "/admin/settings/payment", label: "Pengaturan Toko", icon: Settings, active: pathname.startsWith("/admin/settings") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-foreground font-[family-name:var(--font-syne)] uppercase">
              LANG STR
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Admin
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "transition-colors hover:text-foreground flex items-center gap-2",
                  (link.active ?? pathname === link.href) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <link.icon className={clsx("h-4 w-4", (link as any).iconColor)} />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-sm text-muted-foreground hidden lg:inline-block">
            {userEmail}
          </span>
          <div className="hidden md:block">
            <SignOutButton />
          </div>
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-b bg-background animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={clsx(
                  "transition-colors hover:text-foreground flex items-center gap-3 py-2 text-sm font-medium border-b border-muted last:border-0",
                  (link.active ?? pathname === link.href) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <link.icon className={clsx("h-5 w-5", (link as any).iconColor)} />
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {userEmail}
              </span>
              <SignOutButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
