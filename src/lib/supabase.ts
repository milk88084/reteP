import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Base (unauthenticated) client — used for public/anon queries
export const supabase = createClient(supabaseUrl, supabaseKey)

// Module-level authed client, swapped out by SupabaseAuthSync on each session change
let _authed: SupabaseClient = supabase

export const getAuthedSupabase = () => _authed

export const setAuthedSupabase = (client: SupabaseClient) => { _authed = client }

export const createAuthedClient = (token: string): SupabaseClient =>
  createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
