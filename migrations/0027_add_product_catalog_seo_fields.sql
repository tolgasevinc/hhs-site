ALTER TABLE product_categories ADD COLUMN meta_title TEXT NOT NULL DEFAULT '';
ALTER TABLE product_categories ADD COLUMN meta_keywords TEXT NOT NULL DEFAULT '';
ALTER TABLE product_categories ADD COLUMN meta_description TEXT NOT NULL DEFAULT '';

ALTER TABLE products ADD COLUMN meta_title TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN meta_keywords TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN meta_description TEXT NOT NULL DEFAULT '';
