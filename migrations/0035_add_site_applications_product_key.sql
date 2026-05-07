ALTER TABLE site_applications ADD COLUMN product_key TEXT NOT NULL DEFAULT '';

UPDATE site_applications
SET product_key = COALESCE(
  (
    SELECT p.key
    FROM products p
    WHERE p.category_key = site_applications.category_key
    ORDER BY p.sort_order ASC, p.title ASC
    LIMIT 1
  ),
  product_key
)
WHERE product_key = '';

CREATE INDEX IF NOT EXISTS idx_site_applications_product_sort ON site_applications(product_key, sort_order);
