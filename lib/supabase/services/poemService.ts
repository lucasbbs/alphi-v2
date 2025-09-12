import { createClerkSupabaseClientFromHook } from '../client'
import { Poem as SupabasePoem } from '../types'

// Transform Supabase poem to local poem format
export function transformSupabasePoem(supabasePoem: SupabasePoem): LocalPoem {
  // Convert Supabase word groups to local format
  const localWordGroups: LocalWordGroup[] = supabasePoem.word_groups 
    ? (Array.isArray(supabasePoem.word_groups) ? supabasePoem.word_groups : []).map((group: any) => ({
        id: group.id || `group-${Math.random()}`,
        name: group.name || 'Group',
        color: group.color || '#EF4444',
        wordIndices: group.word_indices || group.wordIndices || []
      }))
    : []

  return {
    id: supabasePoem.id,
    image: null, // Images handled separately for now
    verse: supabasePoem.content,
    words: [], // Will be populated from verses parsing
    wordGroups: localWordGroups,
    targetWord: supabasePoem.target_word,
    targetWordGender: 'masculin', // Default, can be extended
    createdAt: supabasePoem.created_at,
    gameParticipatingWords: supabasePoem.game_participating_words || [],
    wordColors: supabasePoem.word_colors ? JSON.parse(JSON.stringify(supabasePoem.word_colors)) : {}
  }
}

// Transform local poem to Supabase format
export function transformLocalPoem(localPoem: LocalPoem): Partial<SupabasePoem> {
  // Convert local word groups to Supabase format
  const supabaseWordGroups = localPoem.wordGroups.map(group => ({
    id: group.id,
    name: group.name,
    color: group.color,
    word_indices: group.wordIndices
  }))

  return {
    title: `Poem ${localPoem.id}`,
    content: localPoem.verse,
    verses: [localPoem.verse],
    target_word: localPoem.targetWord,
    game_participating_words: localPoem.gameParticipatingWords || [],
    word_groups: supabaseWordGroups as any,
    word_colors: localPoem.wordColors || {},
    difficulty_level: 'medium' // Default difficulty
  }
}

// Local poem interface (matches current gameSlice)
export interface LocalPoem {
  id: string
  image: string | null
  verse: string
  words: GameWord[]
  wordGroups: LocalWordGroup[]
  targetWord: string
  targetWordGender: 'masculin' | 'féminin'
  createdAt: string
  gameParticipatingWords?: number[]
  wordColors?: {[key: number]: string}
}

export interface GameWord {
  word: string
  class: string
  isSelected: boolean
  groupId?: string
}

export interface LocalWordGroup {
  id: string
  name: string
  color: string
  wordIndices: number[]
}

export class PoemService {
  private async getSupabaseClient() {
    // This needs to be called from a component with access to Clerk session
    throw new Error('PoemService methods must be called from components with access to Clerk session')
  }

  static async fetchPoems(sessionToken: string): Promise<LocalPoem[]> {
    try {
      const supabase = createClerkSupabaseClientFromHook(sessionToken)
      
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching poems:', error)
        throw error
      }

      return (data || []).map(transformSupabasePoem)
    } catch (error) {
      console.error('Failed to fetch poems:', error)
      return []
    }
  }

  static async createPoem(sessionToken: string, poem: LocalPoem): Promise<LocalPoem | null> {
    try {
      const supabase = createClerkSupabaseClientFromHook(sessionToken)
      
      const supabasePoem = transformLocalPoem(poem)
      
      const { data, error } = await supabase
        .from('poems')
        .insert([supabasePoem])
        .select()
        .single()

      if (error) {
        console.error('Error creating poem:', error)
        throw error
      }

      return transformSupabasePoem(data)
    } catch (error) {
      console.error('Failed to create poem:', error)
      return null
    }
  }

  static async updatePoem(sessionToken: string, poem: LocalPoem): Promise<LocalPoem | null> {
    try {
      const supabase = createClerkSupabaseClientFromHook(sessionToken)
      
      const supabasePoem = transformLocalPoem(poem)
      
      const { data, error } = await supabase
        .from('poems')
        .update(supabasePoem)
        .eq('id', poem.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating poem:', error)
        throw error
      }

      return transformSupabasePoem(data)
    } catch (error) {
      console.error('Failed to update poem:', error)
      return null
    }
  }

  static async deletePoem(sessionToken: string, poemId: string): Promise<boolean> {
    try {
      const supabase = createClerkSupabaseClientFromHook(sessionToken)
      
      const { error } = await supabase
        .from('poems')
        .delete()
        .eq('id', poemId)

      if (error) {
        console.error('Error deleting poem:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Failed to delete poem:', error)
      return false
    }
  }
}