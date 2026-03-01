# Lang STR - Digital Gaming Store

## Project Overview

A Next.js e-commerce application for selling digital gaming products (game accounts, top-ups, joki services, premium apps). Built with Next.js 16, React 19, Supabase, and Tailwind CSS v4.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Auth**: Supabase Auth (admin authentication)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Storage**: Supabase Storage (product images, settings)

## Key Features

- Public storefront with product catalog and category filtering
- Guest checkout with WhatsApp-based order confirmation
- Admin dashboard (login at `/admin/login`) for managing products, categories, orders, settings
- Image compression/WebP conversion on upload
- SEO settings (meta title, description, Google Analytics, etc.)
- Store settings (payment methods: QRIS, Bank Transfer, Dana, GoPay)

## Project Structure

```
src/
  app/           # Next.js App Router pages
    admin/       # Admin dashboard pages
    checkout/    # Checkout flow
  components/
    admin/       # Admin-specific components
    layout/      # Layout components (Header)
    ui/          # Reusable UI components (shadcn-based)
  hooks/         # Custom React hooks
  lib/
    supabase/    # Supabase client, server, middleware setup
    schema.sql   # Full database schema
    utils.ts     # Utility functions
  types/         # TypeScript type definitions
scripts/
  migrate.js         # Migration runner (Supabase)
  migrations/        # Incremental SQL migrations
```

## Environment Variables

Required secrets:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key

Optional:
- `DATABASE_URL` - Direct Postgres connection (for migrations)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for REST migrations)
- `NEXT_PUBLIC_WHATSAPP_NUMBER` - Admin WhatsApp number

## Development

- Run: `npm run dev` (starts Next.js on port 5000)
- Database migrations: `npm run db:push` (requires DATABASE_URL or Supabase service credentials)

## Deployment

- Target: Autoscale
- Build: `npm run build`
- Start: `npm run start`
