CREATE TABLE IF NOT EXISTS quote_questions (
  id TEXT PRIMARY KEY,
  category_key TEXT NOT NULL,
  question TEXT NOT NULL,
  answer_type TEXT NOT NULL DEFAULT 'text',
  options_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_key) REFERENCES product_categories(key) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quote_questions_category ON quote_questions(category_key, sort_order);
