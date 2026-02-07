-- 016_create_backups_metadata.sql
-- Metadata for user backups

CREATE TABLE backups_metadata (
  backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  size_bytes BIGINT,
  include_archived BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backups_metadata_user ON backups_metadata(user_id, created_at DESC);
