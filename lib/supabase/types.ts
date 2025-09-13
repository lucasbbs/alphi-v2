// Database types for the educational app
export interface Poem {
  id: string
  title: string
  content: string
  image: string | null
  verses: string[]
  target_word: string
  game_participating_words: number[]
  word_groups?: WordGroup[]
  word_colors?: Record<number, string>
  difficulty_level: 'easy' | 'medium' | 'hard'
  created_at: string
  updated_at: string
  user_id: string
}

export interface WordGroup {
  id: string
  name: string
  color: string
  word_indices: number[]
}

export interface UserProgress {
  id: string
  user_id: string
  poem_id: string
  completed_at: string
  time_taken: number
  score: number
  created_at: string
}

export interface UserStats {
  id: string
  user_id: string
  total_games_played: number
  total_time_played: number
  average_score: number
  best_score: number
  poems_completed: string[]
  created_at: string
  updated_at: string
}