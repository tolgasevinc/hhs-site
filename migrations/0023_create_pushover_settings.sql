CREATE TABLE IF NOT EXISTS pushover_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  user_key TEXT NOT NULL DEFAULT '',
  api_token TEXT NOT NULL DEFAULT '',
  email_address TEXT NOT NULL DEFAULT 'g76fqg9ggn@pomail.net',
  is_active INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
