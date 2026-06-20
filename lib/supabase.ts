import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

type SupabaseClient = ReturnType<typeof createClient<Database>>

let _client: SupabaseClient | undefined

function getClient(): SupabaseClient {
  if (_client) return _client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_KEY.'
    )
  }
  _client = createClient<Database>(url, key)
  return _client
}

// Proxy defers client creation to first use (request time, not build time)
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    return Reflect.get(getClient(), prop)
  },
})

