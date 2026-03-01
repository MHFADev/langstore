import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      console.warn('Supabase env vars missing during build time');
      return null as any; // Allow build to continue
    }
    // Return a dummy object or throw a handled error

  client = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )

  return client
}
