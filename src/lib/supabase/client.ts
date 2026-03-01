import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy object or throw a handled error
    // Throwing error here might crash client components, so we log and throw
    console.error('Supabase env vars missing');
    throw new Error('Konfigurasi aplikasi belum lengkap.');
  }

  client = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )

  return client
}
