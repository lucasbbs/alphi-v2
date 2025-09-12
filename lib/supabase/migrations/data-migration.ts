import { createClerkSupabaseClientFromHook } from '@/lib/supabase/client'
import type { Poem as SupabasePoem, UserProgress, UserStats } from '@/lib/supabase/types'

// Current localStorage Poem interface (from Redux)
interface LocalStoragePoem {
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

// Game data from localStorage
interface LocalStorageGameData {
  id: string
  verse: string
  targetWord: string
  time: number
  score: number
  lives: number
  completedAt: string
}

/**
 * Transform localStorage poem to Supabase format
 */
export function transformPoemForSupabase(
  localPoem: LocalStoragePoem, 
  userId: string
): Omit<SupabasePoem, 'id' | 'created_at' | 'updated_at'> {
  // Generate title from first few words of verse or use default
  const title = localPoem.verse.split(' ').slice(0, 4).join(' ') + '...'
  
  // Determine difficulty based on target word length and participating words
  const participatingWordsCount = localPoem.gameParticipatingWords?.length || localPoem.words.length
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  
  if (participatingWordsCount <= 4) {
    difficulty = 'easy'
  } else if (participatingWordsCount >= 8) {
    difficulty = 'hard'
  }

  return {
    title,
    content: localPoem.verse,
    verses: [localPoem.verse], // Convert single verse to array
    target_word: localPoem.targetWord,
    game_participating_words: localPoem.gameParticipatingWords || 
      localPoem.words.map((_, index) => index), // Default to all words
    word_groups: localPoem.wordGroups?.map(group => ({
      id: group.id,
      name: group.name,
      color: group.color,
      word_indices: group.wordIndices
    })) || [],
    word_colors: localPoem.wordColors || {},
    difficulty_level: difficulty,
    user_id: userId
  }
}

/**
 * Transform game history to user progress entries
 */
export function transformGameDataToUserProgress(
  gameData: LocalStorageGameData,
  poemId: string,
  userId: string
): Omit<UserProgress, 'id' | 'created_at'> {
  return {
    user_id: userId,
    poem_id: poemId,
    completed_at: gameData.completedAt,
    time_taken: gameData.time,
    score: gameData.score
  }
}

/**
 * Calculate user stats from game history
 */
export function calculateUserStats(
  gameHistory: LocalStorageGameData[],
  userId: string
): Omit<UserStats, 'id' | 'created_at' | 'updated_at'> {
  const totalGames = gameHistory.length
  const totalTime = gameHistory.reduce((sum, game) => sum + game.time, 0)
  const totalScore = gameHistory.reduce((sum, game) => sum + game.score, 0)
  const bestScore = Math.max(...gameHistory.map(game => game.score))
  const averageScore = totalGames > 0 ? totalScore / totalGames : 0
  
  // Get unique poems completed
  const uniquePoems = Array.from(new Set(gameHistory.map(game => game.id)))

  return {
    user_id: userId,
    total_games_played: totalGames,
    total_time_played: totalTime,
    average_score: Math.round(averageScore * 100) / 100, // Round to 2 decimals
    best_score: bestScore,
    poems_completed: uniquePoems
  }
}

/**
 * Main migration function - migrates all localStorage data to Supabase
 */
export async function migrateLocalStorageToSupabase(
  sessionToken: string,
  userId: string
): Promise<{
  poemsCount: number
  progressCount: number
  statsCreated: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let poemsCount = 0
  let progressCount = 0
  let statsCreated = false

  try {
    const supabase = createClerkSupabaseClientFromHook(sessionToken)

    // 1. Migrate Poems
    const savedPoems = localStorage.getItem('alphi-admin-poems')
    if (savedPoems) {
      try {
        const localPoems: LocalStoragePoem[] = JSON.parse(savedPoems)
        
        for (const localPoem of localPoems) {
          const supabasePoem = transformPoemForSupabase(localPoem, userId)
          
          const { error } = await supabase
            .from('poems')
            .insert([supabasePoem])
          
          if (error) {
            errors.push(`Failed to migrate poem "${localPoem.verse.substring(0, 30)}...": ${error.message}`)
          } else {
            poemsCount++
          }
        }
      } catch (error) {
        errors.push(`Failed to parse admin poems: ${error}`)
      }
    }

    // 2. Migrate Game History to User Progress
    const savedGames = localStorage.getItem('alphi-games')
    if (savedGames) {
      try {
        const gameHistory: LocalStorageGameData[] = JSON.parse(savedGames)
        
        // Get all poems from database to map game history to poem IDs
        const { data: poems } = await supabase
          .from('poems')
          .select('id, target_word, content')
          .eq('user_id', userId)

        const poemMap = new Map(poems?.map(p => [p.target_word, p.id]) || [])
        
        for (const game of gameHistory) {
          // Try to find matching poem by target word
          const poemId = poemMap.get(game.targetWord)
          
          if (poemId) {
            const progressData = transformGameDataToUserProgress(game, poemId, userId)
            
            const { error } = await supabase
              .from('user_progress')
              .insert([progressData])
            
            if (error) {
              errors.push(`Failed to migrate game progress: ${error.message}`)
            } else {
              progressCount++
            }
          } else {
            errors.push(`No matching poem found for game with target word: ${game.targetWord}`)
          }
        }

        // 3. Create User Stats
        if (gameHistory.length > 0) {
          const statsData = calculateUserStats(gameHistory, userId)
          
          const { error } = await supabase
            .from('user_stats')
            .insert([statsData])
          
          if (error) {
            errors.push(`Failed to create user stats: ${error.message}`)
          } else {
            statsCreated = true
          }
        }
      } catch (error) {
        errors.push(`Failed to parse game history: ${error}`)
      }
    }

    return {
      poemsCount,
      progressCount,
      statsCreated,
      errors
    }
  } catch (error) {
    errors.push(`Migration failed: ${error}`)
    return {
      poemsCount: 0,
      progressCount: 0,
      statsCreated: false,
      errors
    }
  }
}

/**
 * Check if migration is needed (has localStorage data but no Supabase data)
 */
export async function checkMigrationStatus(
  sessionToken: string,
  userId: string
): Promise<{
  hasLocalStorageData: boolean
  hasSupabaseData: boolean
  needsMigration: boolean
}> {
  // Check localStorage
  const hasLocalStoragePoems = !!localStorage.getItem('alphi-admin-poems')
  const hasLocalStorageGames = !!localStorage.getItem('alphi-games')
  const hasLocalStorageData = hasLocalStoragePoems || hasLocalStorageGames

  // Check Supabase
  const supabase = createClerkSupabaseClientFromHook(sessionToken)
  const { data: poems } = await supabase
    .from('poems')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  const hasSupabaseData = (poems?.length || 0) > 0

  return {
    hasLocalStorageData,
    hasSupabaseData,
    needsMigration: hasLocalStorageData && !hasSupabaseData
  }
}