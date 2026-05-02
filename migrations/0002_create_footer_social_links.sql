CREATE TABLE IF NOT EXISTS footer_social_links (
  platform TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO footer_social_links (platform, label, url, sort_order, is_active)
VALUES
  ('instagram', 'Instagram', '', 1, 1),
  ('facebook', 'Facebook', '', 2, 1),
  ('linkedin', 'LinkedIn', '', 3, 1),
  ('youtube', 'YouTube', '', 4, 1),
  ('tiktok', 'TikTok', '', 5, 1);
