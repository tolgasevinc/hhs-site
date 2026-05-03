CREATE TABLE IF NOT EXISTS quote_requests (
  id TEXT PRIMARY KEY,
  is_anonymous INTEGER NOT NULL DEFAULT 0,
  page_key TEXT NOT NULL DEFAULT '',
  category_key TEXT NOT NULL,
  category_title TEXT NOT NULL DEFAULT '',
  product_key TEXT NOT NULL,
  product_title TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  answers_json TEXT NOT NULL DEFAULT '[]',
  whatsapp_message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
