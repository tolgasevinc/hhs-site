ALTER TABLE quote_questions ADD COLUMN product_key TEXT;

UPDATE quote_questions
SET product_key = (
  SELECT products.key
  FROM products
  WHERE products.category_key = quote_questions.category_key
  ORDER BY products.sort_order ASC, products.key ASC
  LIMIT 1
)
WHERE product_key IS NULL;

CREATE INDEX IF NOT EXISTS idx_quote_questions_product ON quote_questions(category_key, product_key, sort_order);
