CREATE TABLE IF NOT EXISTS wp_source_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  host TEXT NOT NULL DEFAULT '',
  port INTEGER NOT NULL DEFAULT 3306,
  database_name TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL DEFAULT '',
  password TEXT NOT NULL DEFAULT '',
  table_prefix TEXT NOT NULL DEFAULT 'wp_',
  old_site_url TEXT NOT NULL DEFAULT '',
  include_drafts INTEGER NOT NULL DEFAULT 0,
  last_test_at TEXT,
  last_test_status TEXT NOT NULL DEFAULT '',
  last_test_message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
