-- Add missing columns to poems table for complete game data storage
-- Migration: Add words and target_word_gender columns

-- Add words column to store individual word data with classes
ALTER TABLE poems ADD COLUMN IF NOT EXISTS words JSONB DEFAULT '[]'::jsonb;

-- Add target_word_gender column for gender selection step
ALTER TABLE poems ADD COLUMN IF NOT EXISTS target_word_gender TEXT DEFAULT 'masculin';

-- Add comment for documentation
COMMENT ON COLUMN poems.words IS 'Array of word objects with class, isSelected, and groupId properties';
COMMENT ON COLUMN poems.target_word_gender IS 'Gender of the target word for game step 4 (masculin or féminin)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_poems_target_word_gender ON poems(target_word_gender);
CREATE INDEX IF NOT EXISTS idx_poems_words_gin ON poems USING gin(words);