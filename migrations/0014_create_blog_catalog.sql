CREATE TABLE IF NOT EXISTS blog_categories (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_tags (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  target_keyword TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_title TEXT NOT NULL,
  meta_keywords TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  image_alt TEXT NOT NULL DEFAULT '',
  old_url TEXT NOT NULL DEFAULT '',
  seo_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_post_categories (
  post_key TEXT NOT NULL,
  category_key TEXT NOT NULL,
  PRIMARY KEY (post_key, category_key),
  FOREIGN KEY (post_key) REFERENCES blog_posts(key) ON DELETE CASCADE,
  FOREIGN KEY (category_key) REFERENCES blog_categories(key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_key TEXT NOT NULL,
  tag_key TEXT NOT NULL,
  PRIMARY KEY (post_key, tag_key),
  FOREIGN KEY (post_key) REFERENCES blog_posts(key) ON DELETE CASCADE,
  FOREIGN KEY (tag_key) REFERENCES blog_tags(key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blog_redirects (
  old_url TEXT PRIMARY KEY,
  post_key TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_key) REFERENCES blog_posts(key) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_post_categories_category ON blog_post_categories(category_key);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON blog_post_tags(tag_key);

INSERT OR IGNORE INTO blog_categories (key, title, slug, description, sort_order)
VALUES ('genel', 'Genel', 'genel', 'Genel blog yazıları.', 1);

INSERT OR IGNORE INTO admin_user_modules (user_id, module_key)
SELECT id, 'blog' FROM admin_users WHERE is_active = 1;
