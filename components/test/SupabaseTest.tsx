'use client'

import React, { useEffect, useState } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClerkSupabaseClientFromHook } from '@/lib/supabase/client'
import type { Poem } from '@/lib/supabase/types'

export default function SupabaseTest() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const { session } = useSession()

  useEffect(() => {
    async function fetchPoems() {
      if (!user || !session) return
      
      try {
        // Get the Clerk session token for Supabase
        const sessionToken = await session.getToken({ template: 'supabase' })
        
        // Create authenticated Supabase client
        const supabase = createClerkSupabaseClientFromHook(sessionToken)
        
        // Fetch poems from Supabase
        const { data, error } = await supabase
          .from('poems')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setPoems(data || [])
      } catch (err) {
        console.error('Error fetching poems:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPoems()
  }, [user, session])

  const addTestPoem = async () => {
    if (!user || !session) return
    
    try {
      const sessionToken = await session.getToken({ template: 'supabase' })
      const supabase = createClerkSupabaseClientFromHook(sessionToken)
      
      const { data, error } = await supabase
        .from('poems')
        .insert([
          {
            title: `Test Poem ${Date.now()}`,
            content: 'Test content for poem',
            verses: ['This is a test verse'],
            target_word: 'TEST',
            game_participating_words: [0, 1, 2],
            difficulty_level: 'easy',
            user_id: user.id
          }
        ])
        .select()
      
      if (error) {
        throw error
      }
      
      if (data) {
        setPoems(prev => [data[0], ...prev])
      }
    } catch (err) {
      console.error('Error adding poem:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  if (!user) {
    return <div className="p-4">Please sign in to test Supabase integration</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Supabase + Clerk Integration Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Logged in as: {user.emailAddresses[0]?.emailAddress}
        </p>
      </div>

      <div className="mb-6">
        <button 
          onClick={addTestPoem}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Test Poem
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p>Loading poems...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Poems ({poems.length})</h3>
        {poems.length === 0 && !loading ? (
          <p className="text-gray-500 italic">No poems found. Add a test poem to get started!</p>
        ) : (
          poems.map((poem) => (
            <div key={poem.id} className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-lg">{poem.title}</h4>
              <p className="text-gray-600 mb-2">{poem.content}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Target: {poem.target_word}</span>
                <span>Difficulty: {poem.difficulty_level}</span>
                <span>Created: {new Date(poem.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}