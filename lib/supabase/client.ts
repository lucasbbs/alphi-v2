import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Session } from '@clerk/nextjs/server'

// Create a custom Supabase client that works with Clerk authentication
export function createClerkSupabaseClient(session: Session | null): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Pass the Clerk session token as the JWT to Supabase
        headers: {
          Authorization: `Bearer ${session?.getToken({ template: 'supabase' })}`,
        },
      },
    }
  )
}

// Client-side version using the session hook
export function createClerkSupabaseClientFromHook(sessionToken: string | null): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: sessionToken
          ? {
              Authorization: `Bearer ${sessionToken}`,
            }
          : {},
      },
    }
  )
}

// Default client without authentication (for public data)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)