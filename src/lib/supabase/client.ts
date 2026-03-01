import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy object or throw a handled error
    // Throwing error here might crash client components, so we log and throw
    console.error('Supabase env vars missing');
    throw new Error('Konfigurasi aplikasi belum lengkap.');
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
