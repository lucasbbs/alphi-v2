import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Create a custom Supabase client that works with Clerk authentication (server-side)
export async function createClerkSupabaseClientServer(sessionToken: string | null): Promise<SupabaseClient> {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Pass the Clerk session token as the JWT to Supabase
        headers: sessionToken
          ? {
              Authorization: `Bearer ${sessionToken}`,
            }
          : {},
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