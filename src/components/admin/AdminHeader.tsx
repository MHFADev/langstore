'use client';

import { SignOutButton } from '@/components/admin/SignOutButton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Settings, LayoutDashboard } from 'lucide-react';

interface AdminHeaderProps {
  userEmail?: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            <Link
              href="/admin/dashboard"
              className={clsx(
                "transition-colors hover:text-foreground flex items-center gap-2",
                pathname === "/admin/dashboard" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/orders"
              className={clsx(
                "transition-colors hover:text-foreground flex items-center gap-2",
                pathname === "/admin/orders" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              Pesanan
            </Link>
            <Link
              href="/admin/categories"
              className={clsx(
                "transition-colors hover:text-foreground flex items-center gap-2",
                pathname === "/admin/categories" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tags"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19a2.4 2.4 0 0 1-3.4 0L7 12.5" /><path d="m15 5-2.5 2.5" /><path d="M7 12.5V5h7.5" /><circle cx="10" cy="10" r="1" /></svg>
              Kategori
            </Link>
            <Link
              href="/admin/settings/payment"
              className={clsx(
                "transition-colors hover:text-foreground flex items-center gap-2",
                pathname === "/admin/settings/payment" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
              Pembayaran
            </Link>
            <Link
              href="/admin/settings"
              className={clsx(
                "transition-colors hover:text-foreground flex items-center gap-2",
                pathname === "/admin/settings" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
              Akun
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            {userEmail}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
