import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Clerk provides this; updated by SupabaseAuthSync on session change
let _getToken: (() => Promise<string | null>) | null = null

export const setTokenGetter = (fn: (() => Promise<string | null>) | null) => {
  _getToken = fn
}

// Single client — injects a fresh Clerk JWT before every request
export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: async (url, options = {}) => {
      const token = _getToken ? await _getToken() : null
      const headers = new Headers(options.headers as HeadersInit)
      if (token) headers.set('Authorization', `Bearer ${token}`)
      else        headers.delete('Authorization')
      return fetch(url, { ...options, headers })
    },
  },
  auth: {
    persistSession:     false,
    autoRefreshToken:   false,
    detectSessionInUrl: false,
  },
})
