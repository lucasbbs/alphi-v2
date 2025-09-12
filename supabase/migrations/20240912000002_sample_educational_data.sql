-- Migration: Add Sample Educational Data
-- Description: Inserts sample French poems for the Alphi learning game
-- Date: 2024-09-12

-- Insert sample educational poems for Quebec French learning
INSERT INTO poems (title, content, verses, target_word, game_participating_words, word_groups, word_colors, difficulty_level, user_id) VALUES
('Les Saisons', 
 'L''hiver arrive avec sa neige blanche. Le printemps apporte des fleurs colorées. L''été nous donne du soleil chaud. L''automne peint les feuilles en rouge.',
 ARRAY['L''hiver arrive avec sa neige blanche.', 'Le printemps apporte des fleurs colorées.', 'L''été nous donne du soleil chaud.', 'L''automne peint les feuilles en rouge.'],
 'SAISONS',
 ARRAY[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
 '{"temporal": [0, 8, 12], "nature": [2, 5, 10, 15], "descriptive": [1, 3, 6, 9, 13, 14]}',
 '{"temporal": "#FF6B6B", "nature": "#4ECDC4", "descriptive": "#45B7D1"}',
 'easy',
 'system'),

('La Famille', 
 'Ma mère cuisine dans la cuisine. Mon père lit le journal. Ma sœur joue avec son chat. Mon frère étudie ses leçons.',
 ARRAY['Ma mère cuisine dans la cuisine.', 'Mon père lit le journal.', 'Ma sœur joue avec son chat.', 'Mon frère étudie ses leçons.'],
 'FAMILLE',
 ARRAY[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
 '{"family": [0, 1, 3, 4, 8, 9, 12, 13], "actions": [2, 5, 7, 10, 14], "objects": [6, 11]}',
 '{"family": "#FF9F43", "actions": "#6C5CE7", "objects": "#00B894"}',
 'medium',
 'system'),

('L''École', 
 'L''élève écrit dans son cahier. Le professeur explique la leçon. Les enfants lèvent la main pour répondre. La cloche sonne la récréation.',
 ARRAY['L''élève écrit dans son cahier.', 'Le professeur explique la leçon.', 'Les enfants lèvent la main pour répondre.', 'La cloche sonne la récréation.'],
 'ÉCOLE',
 ARRAY[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
 '{"school_people": [0, 1, 3, 4, 7, 8], "actions": [2, 5, 9, 10, 15], "school_objects": [6, 11, 13, 14, 16]}',
 '{"school_people": "#E17055", "actions": "#74B9FF", "school_objects": "#00CEC9"}',
 'hard',
 'system')

ON CONFLICT DO NOTHING;