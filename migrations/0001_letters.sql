PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS letters (
  id TEXT PRIMARY KEY,
  owner_hash TEXT NOT NULL,
  request_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  card TEXT NOT NULL,
  logo TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(owner_hash, request_id)
);

CREATE TABLE IF NOT EXISTS letter_replies (
  id TEXT PRIMARY KEY,
  letter_id TEXT NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(letter_id, request_id)
);
CREATE INDEX IF NOT EXISTS letter_replies_chronology ON letter_replies(letter_id, created_at);

CREATE TABLE IF NOT EXISTS letter_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS letter_rate_expiry ON letter_rate_limits(expires_at);
