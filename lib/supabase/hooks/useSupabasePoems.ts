import { useState, useEffect } from 'react'
import { useUser, useSession } from '@clerk/nextjs'
import { createClerkSupabaseClientFromHook } from '@/lib/supabase/client'
import type { Poem as SupabasePoem } from '@/lib/supabase/types'

// Transform Supabase poem to Redux format for compatibility
interface ReduxPoem {
  id: string
  image: string | null
  verse: string
  words: Array<{
    word: string
    class: string
    isSelected: boolean
    groupId?: string
  }>
  wordGroups: Array<{
    id: string
    name: string
    color: string
    wordIndices: number[]
  }>
  targetWord: string
  targetWordGender: 'masculin' | 'féminin'
  createdAt: string
  gameParticipatingWords?: number[]
  wordColors?: {[key: number]: string}
}

function transformSupabasePoemToRedux(supabasePoem: SupabasePoem): ReduxPoem {
  // Parse words from content (simplified - in real app you'd store word data)
  const words = supabasePoem.content.split(/\s+/).map((word, index) => ({
    word: word.replace(/[.,;!?]/g, ''), // Remove punctuation
    class: 'unknown', // You'd need to store or derive this
    isSelected: false,
    groupId: supabasePoem.word_groups?.find(group => 
      group.word_indices.includes(index)
    )?.id
  }))

  return {
    id: supabasePoem.id,
    image: null, // Not stored in Supabase schema
    verse: supabasePoem.content,
    words,
    wordGroups: supabasePoem.word_groups?.map(group => ({
      ...group,
      wordIndices: group.word_indices
    })) || [],
    targetWord: supabasePoem.target_word,
    targetWordGender: 'masculin', // Default - not stored in Supabase
    createdAt: supabasePoem.created_at,
    gameParticipatingWords: supabasePoem.game_participating_words,
    wordColors: supabasePoem.word_colors
  }
}

export function useSupabasePoems() {
  const [poems, setPoems] = useState<ReduxPoem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()
  const { session } = useSession()

  useEffect(() => {
    if (user && session) {
      fetchPoems()
    }
  }, [user, session])

  const fetchPoems = async () => {
    if (!user || !session) return
    
    try {
      const sessionToken = await session.getToken({ template: 'supabase' })
      if (!sessionToken) return
      
      const supabase = createClerkSupabaseClientFromHook(sessionToken)
      
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const transformedPoems = (data || []).map(transformSupabasePoemToRedux)
      setPoems(transformedPoems)
    } catch (err) {
      console.error('Failed to fetch poems:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const addPoem = async (poem: Omit<SupabasePoem, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user || !session) return null
    
    try {
      const sessionToken = await session.getToken({ template: 'supabase' })
      if (!sessionToken) return null
      
      const supabase = createClerkSupabaseClientFromHook(sessionToken)
      
      const { data, error } = await supabase
        .from('poems')
        .insert([{ ...poem, user_id: user.id }])
        .select()
        .single()
      
      if (error) throw error
      
      const transformedPoem = transformSupabasePoemToRedux(data)
      setPoems(prev => [transformedPoem, ...prev])
      
      return transformedPoem
    } catch (err) {
      console.error('Failed to add poem:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }

  const updatePoem = async (id: string, updates: Partial<SupabasePoem>) => {
    if (!user || !session) return null
    
    try {
      const sessionToken = await session.getToken({ template: 'supabase' })
      if (!sessionToken) return null
      
      const supabase = createClerkSupabaseClientFromHook(sessionToken)
      
      const { data, error } = await supabase
        .from('poems')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      
      const transformedPoem = transformSupabasePoemToRedux(data)
      setPoems(prev => prev.map(p => p.id === id ? transformedPoem : p))
      
      return transformedPoem
    } catch (err) {
      console.error('Failed to update poem:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }

  const deletePoem = async (id: string) => {
    if (!user || !session) return false
    
    try {
      const sessionToken = await session.getToken({ template: 'supabase' })
      if (!sessionToken) return false
      
      const supabase = createClerkSupabaseClientFromHook(sessionToken)
      
      const { error } = await supabase
        .from('poems')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      setPoems(prev => prev.filter(p => p.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete poem:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }

  return {
    poems,
    loading,
    error,
    fetchPoems,
    addPoem,
    updatePoem,
    deletePoem
  }
}