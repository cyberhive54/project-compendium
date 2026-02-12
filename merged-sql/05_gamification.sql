-- ============================================================================
-- 05_gamification.sql
-- Merged from: 015, 022
-- Creates: badges, user_badges (with levels from 022 inlined)
-- ============================================================================

-- Badges table (with is_default and levels from 022)
CREATE TABLE badges (
  badge_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL,
  tier VARCHAR(20) DEFAULT 'bronze',
  xp_reward INTEGER DEFAULT 0,
  unlock_condition JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  levels JSONB DEFAULT '[]',
  CHECK (category IN ('streak', 'time', 'task', 'exam', 'subject', 'milestone')),
  CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'))
);

CREATE TABLE user_badges (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) REFERENCES badges(badge_id),
  badge_level INTEGER DEFAULT 1,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_unlocked ON user_badges(unlocked_at DESC);

-- Seed default badges
INSERT INTO badges (badge_id, name, description, icon, category, tier, xp_reward, unlock_condition) VALUES
  ('streak_7', 'Week Warrior', 'Maintain a 7-day study streak', '🔥', 'streak', 'bronze', 50, '{"type": "streak", "days": 7}'),
  ('streak_30', 'Monthly Master', 'Maintain a 30-day study streak', '🔥', 'streak', 'silver', 150, '{"type": "streak", "days": 30}'),
  ('streak_100', 'Century Scholar', 'Maintain a 100-day study streak', '🔥', 'streak', 'gold', 500, '{"type": "streak", "days": 100}'),
  ('streak_365', 'Year of Dedication', 'Maintain a 365-day study streak', '🔥', 'streak', 'platinum', 2000, '{"type": "streak", "days": 365}'),
  ('time_10h', 'Getting Started', 'Study for 10 total hours', '⏱️', 'time', 'bronze', 25, '{"type": "total_time", "hours": 10}'),
  ('time_100h', 'Dedicated Learner', 'Study for 100 total hours', '⏱️', 'time', 'silver', 200, '{"type": "total_time", "hours": 100}'),
  ('time_500h', 'Study Machine', 'Study for 500 total hours', '⏱️', 'time', 'gold', 750, '{"type": "total_time", "hours": 500}'),
  ('tasks_10', 'First Steps', 'Complete 10 tasks', '✅', 'task', 'bronze', 25, '{"type": "tasks_completed", "count": 10}'),
  ('tasks_100', 'Task Master', 'Complete 100 tasks', '✅', 'task', 'silver', 150, '{"type": "tasks_completed", "count": 100}'),
  ('tasks_500', 'Unstoppable', 'Complete 500 tasks', '✅', 'task', 'gold', 500, '{"type": "tasks_completed", "count": 500}'),
  ('exam_perfect', 'Perfect Score', 'Score 100% on any exam', '🏆', 'exam', 'gold', 300, '{"type": "exam_accuracy", "percentage": 100}'),
  ('exam_90', 'Top Scorer', 'Score 90%+ on an exam', '🎯', 'exam', 'silver', 100, '{"type": "exam_accuracy", "percentage": 90}'),
  ('first_goal', 'Goal Setter', 'Create your first goal', '🎯', 'milestone', 'bronze', 10, '{"type": "first_goal"}'),
  ('first_timer', 'Time Keeper', 'Complete your first timer session', '⏱️', 'milestone', 'bronze', 10, '{"type": "first_timer_session"}'),
  ('first_exam', 'Test Taker', 'Complete your first exam task', '📝', 'milestone', 'bronze', 10, '{"type": "first_exam"}');
