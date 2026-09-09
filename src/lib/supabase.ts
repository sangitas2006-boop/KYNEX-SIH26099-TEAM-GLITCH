import { createClient } from '@supabase/supabase-js'

type KynexRuntimeConfig = {
    supabaseUrl?: string
    supabasePublishableKey?: string
}

declare global {
    interface Window {
          __KYNEX_CONFIG__?: KynexRuntimeConfig
    }
}

const runtimeConfig = typeof window !== 'undefined' ? window.__KYNEX_CONFIG__ : undefined
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || runtimeConfig?.supabaseUrl
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || runtimeConfig?.supabasePublishableKey

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
          auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
          },
  })
    : null
