-- 022_add_badge_levels.sql
-- Multi-level badge system

ALTER TABLE badges ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
ALTER TABLE badges ADD COLUMN levels JSONB DEFAULT '[]';
-- levels format: [{"level": 1, "threshold": 80, "count": 1, "xp_reward": 50}, ...]

ALTER TABLE user_badges ADD COLUMN badge_level INTEGER DEFAULT 1;
