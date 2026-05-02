ALTER TABLE products ADD COLUMN image_square_url TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN image_horizontal_url TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN image_vertical_url TEXT NOT NULL DEFAULT '';

UPDATE products
SET
  image_square_url = image_url,
  image_horizontal_url = image_url,
  image_vertical_url = image_url
WHERE image_url <> '';
