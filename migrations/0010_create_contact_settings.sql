CREATE TABLE IF NOT EXISTS contact_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  phone_primary TEXT NOT NULL DEFAULT '',
  phone_secondary TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  google_map_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO contact_settings (
  id,
  phone_primary,
  phone_secondary,
  whatsapp,
  service,
  email,
  address,
  google_map_url
)
VALUES (
  'default',
  '+90 264 291 00 60',
  '+90 542 614 29 29',
  '+90 542 614 29 29',
  'Sakarya ve çevre iller',
  'info@hhsotomatikkapi.com',
  'Sakarya ve çevre iller',
  ''
);
