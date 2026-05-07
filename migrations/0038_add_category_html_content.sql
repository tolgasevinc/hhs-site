ALTER TABLE product_categories ADD COLUMN html_content TEXT NOT NULL DEFAULT '';

UPDATE product_categories
SET html_content = COALESCE(
  (
    SELECT sp.html_content
    FROM site_pages sp
    WHERE sp.slug = product_categories.page_slug
    ORDER BY sp.is_active DESC, sp.sort_order ASC, sp.updated_at DESC
    LIMIT 1
  ),
  html_content
)
WHERE html_content = '';
