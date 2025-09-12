-- Enable Row Level Security on all tables
-- Create poems table
CREATE TABLE IF NOT EXISTS poems (
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

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT auth.jwt()->>'sub',
    poem_id UUID NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    time_taken INTEGER NOT NULL, -- in seconds
    score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
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

-- Enable RLS on all tables
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for poems table
CREATE POLICY "Users can view all poems"
ON poems
FOR SELECT
TO authenticated
USING (true); -- Allow all users to view all poems

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

-- Create RLS policies for user_progress table
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

-- Create RLS policies for user_stats table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_poems_user_id ON poems(user_id);
CREATE INDEX IF NOT EXISTS idx_poems_difficulty ON poems(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_poem_id ON user_progress(poem_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_poems_updated_at
    BEFORE UPDATE ON poems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();