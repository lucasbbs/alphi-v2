-- Migration: Initial Alphi Educational App Setup
-- Description: Creates tables for French language learning game with user authentication
-- Date: 2024-09-12

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create poems table for educational content
CREATE TABLE poems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    verses TEXT[] NOT NULL,
    target_word TEXT NOT NULL,
    game_participating_words INTEGER[] NOT NULL DEFAULT '{}',
    word_groups JSONB,
    word_colors JSONB,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub'
);

-- Create user_progress table for tracking game completion
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
    poem_id UUID NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    time_taken INTEGER NOT NULL, -- in seconds
    score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_stats table for overall user statistics
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
    total_games_played INTEGER DEFAULT 0,
    total_time_played INTEGER DEFAULT 0, -- in seconds
    average_score DECIMAL(5,2) DEFAULT 0.00,
    best_score INTEGER DEFAULT 0,
    poems_completed TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for poems table
CREATE POLICY "Users can view all poems"
ON poems
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own poems"
ON poems
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update their own poems"
ON poems
FOR UPDATE
TO authenticated
USING (auth.jwt()->>'sub' = user_id)
WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can delete their own poems"
ON poems
FOR DELETE
TO authenticated
USING (auth.jwt()->>'sub' = user_id);

-- RLS Policies for user_progress table
CREATE POLICY "Users can view their own progress"
ON user_progress
FOR SELECT
TO authenticated
USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can create their own progress"
ON user_progress
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- RLS Policies for user_stats table
CREATE POLICY "Users can view their own stats"
ON user_stats
FOR SELECT
TO authenticated
USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can create their own stats"
ON user_stats
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update their own stats"
ON user_stats
FOR UPDATE
TO authenticated
USING (auth.jwt()->>'sub' = user_id)
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- Create performance indexes
CREATE INDEX idx_poems_user_id ON poems(user_id);
CREATE INDEX idx_poems_difficulty ON poems(difficulty_level);
CREATE INDEX idx_poems_target_word ON poems(target_word);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_poem_id ON user_progress(poem_id);
CREATE INDEX idx_user_progress_completed_at ON user_progress(completed_at);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_poems_updated_at
    BEFORE UPDATE ON poems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();