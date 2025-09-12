import React from 'react'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import SupabaseTest from '@/components/test/SupabaseTest'

export default function TestSupabasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SignedIn>
        <SupabaseTest />
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-600">Please sign in to test the Supabase integration</p>
          </div>
        </div>
      </SignedOut>
    </div>
  )
}