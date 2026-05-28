-- Add archive state to events table
ALTER TABLE events ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0;

-- Partial index for efficient active-only queries (common case)
-- SQLite query planner uses this when WHERE clause matches exactly
CREATE INDEX IF NOT EXISTS idx_events_active ON events(timestamp DESC) WHERE is_archived = 0;
