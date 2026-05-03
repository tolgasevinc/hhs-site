ALTER TABLE quote_questions ADD COLUMN page_key TEXT NOT NULL DEFAULT 'all';
ALTER TABLE quote_questions ADD COLUMN image_url TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_quote_questions_page_product ON quote_questions(page_key, category_key, product_key, sort_order);
