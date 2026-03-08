'use client';

import { StoreSettings } from '@/types';
import { Facebook, Instagram, Twitter, MessageCircle, MapPin, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

interface FooterProps {
    settings: StoreSettings | null;
}

export function Footer({ settings }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-secondary/30 border-t border-primary/10 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="container relative mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {settings?.favicon_url ? (
                                <img src={settings.favicon_url} alt="Logo" className="w-8 h-8 object-contain" />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                                    L
                                </div>
                            )}
                            <span className="text-xl font-bold font-[family-name:var(--font-space-grotesk)] tracking-tight">
                                {settings?.site_title?.split('|')[0] || 'LANG STR'}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            {settings?.site_description || 'Marketplace Terpercaya untuk Jual Beli Akun Game, Nokos, dan Aplikasi Premium dengan Aman dan Cepat.'}
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-foreground">Menu Utama</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link href="/#catalog" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                    Katalog Produk
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                    Tentang Kami
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-primary transition-colors flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                                    Syarat & Ketentuan
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-foreground">Kategori Populer</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/category/game-account" className="hover:text-primary transition-colors">
                                    Game Account
                                </Link>
                            </li>
                            {/* Removed Top Up Game */}
                            <li>
                                <Link href="/category/nokos" className="hover:text-primary transition-colors">
                                    Nokos
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/premium-app" className="hover:text-primary transition-colors">
                                    Aplikasi Premium
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/joki" className="hover:text-primary transition-colors">
                                    Jasa Joki
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-foreground">Hubungi Kami</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <MessageCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">WhatsApp Admin</p>
                                    <a href={`https://wa.me/${settings?.whatsapp_number_admin || ''}`} target="_blank" className="hover:text-primary transition-colors">
                                        {settings?.whatsapp_number_admin || '+62 812-3456-7890'}
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">Email</p>
                                    <a href="mailto:support@langstr.id" className="hover:text-primary transition-colors">
                                        support@langstr.id
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-foreground">Jam Operasional</p>
                                    <p>Setiap Hari: 09:00 - 22:00 WIB</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>
                        &copy; {currentYear} <span className="font-bold text-foreground">LANG STR</span>. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link href="/sitemap" className="hover:text-foreground transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
