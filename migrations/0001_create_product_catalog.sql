PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS product_categories (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  key TEXT PRIMARY KEY,
  category_key TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_key) REFERENCES product_categories(key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_key TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_key) REFERENCES products(key) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_children (
  key TEXT PRIMARY KEY,
  product_key TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_key) REFERENCES products(key) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_category_key ON products(category_key);
CREATE INDEX IF NOT EXISTS idx_product_badges_product_key ON product_badges(product_key);
CREATE INDEX IF NOT EXISTS idx_product_children_product_key ON product_children(product_key);

INSERT OR IGNORE INTO product_categories (key, title, slug, description, sort_order)
VALUES
  ('gateSystems', 'Kapı Sistemleri', 'kapi-sistemleri', 'Bahçe, garaj ve otomatik geçiş çözümleri.', 1),
  ('accessControl', 'Geçiş Kontrol', 'gecis-kontrol', 'Araç ve yaya geçişlerini kontrollü hale getiren sistemler.', 2);

INSERT OR IGNORE INTO products (key, category_key, title, slug, description, image_url, alt_text, sort_order)
VALUES
  ('slidingGateMotors', 'gateSystems', 'Yana Kayar Kapı Motorları', 'yana-kayar-kapi-motorlari', 'Site, villa ve işletme girişleri için yoğun kullanıma uygun motor çözümleri.', 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', 'Modern bahçe giriş kapısı', 1),
  ('swingGateMotors', 'gateSystems', 'Kanatlı Kapı Motorları', 'kanatli-kapi-motorlari', 'Çift kanat ve tek kanat bahçe kapıları için otomasyon sistemleri.', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'Konut girişinde kanatlı bahçe kapısı', 2),
  ('garageDoors', 'gateSystems', 'Garaj Kapıları', 'garaj-kapilari', 'Seksiyonel, kepenk ve panjur kontrollü garaj kapısı çözümleri.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', 'Modern bina ve garaj girişi', 3),
  ('barrierSystems', 'accessControl', 'Otomatik Bariyer Sistemleri', 'otomatik-bariyer-sistemleri', 'Otopark, fabrika ve site girişleri için hızlı bariyer çözümleri.', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', 'Kurumsal tesis giriş alanı', 4),
  ('plateRecognition', 'accessControl', 'Plaka Tanıma Sistemleri', 'plaka-tanima-sistemleri', 'Yetkili araç geçişi, kayıt ve otopark kontrolü için kamera tabanlı çözümler.', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80', 'Şehir yolunda araç geçişleri', 5),
  ('photocellDoors', 'accessControl', 'Fotoselli Kapılar', 'fotoselli-kapilar', 'Mağaza, hastane ve ofis girişleri için otomatik cam kapı sistemleri.', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80', 'Modern cam cepheli bina girişi', 6);

INSERT OR IGNORE INTO product_badges (product_key, label, sort_order)
VALUES
  ('slidingGateMotors', 'Yoğun Kullanım', 1),
  ('slidingGateMotors', 'Bahçe Kapısı', 2),
  ('slidingGateMotors', 'Motorlu Sistem', 3),
  ('swingGateMotors', 'Sessiz Çalışma', 1),
  ('swingGateMotors', 'Konut', 2),
  ('swingGateMotors', 'Kanatlı Kapı', 3),
  ('garageDoors', 'Garaj', 1),
  ('garageDoors', 'Kepenk', 2),
  ('garageDoors', 'Panjur', 3),
  ('barrierSystems', 'Otopark', 1),
  ('barrierSystems', 'Site', 2),
  ('barrierSystems', 'Hızlı Geçiş', 3),
  ('plateRecognition', 'Kamera', 1),
  ('plateRecognition', 'Otopark', 2),
  ('plateRecognition', 'Yetkili Geçiş', 3),
  ('photocellDoors', 'Cam Kapı', 1),
  ('photocellDoors', 'Yoğun Geçiş', 2),
  ('photocellDoors', 'Fotoselli', 3);

INSERT OR IGNORE INTO product_children (key, product_key, title, slug, sort_order)
VALUES
  ('residentialSliding', 'slidingGateMotors', 'Konut Tipi', 'konut-tipi-yana-kayar', 1),
  ('industrialSliding', 'slidingGateMotors', 'Endüstriyel Tip', 'endustriyel-yana-kayar', 2),
  ('linearArm', 'swingGateMotors', 'Lineer Kollu', 'lineer-kollu', 1),
  ('articulatedArm', 'swingGateMotors', 'Mafsallı Kollu', 'mafsalli-kollu', 2),
  ('parkingBarrier', 'barrierSystems', 'Otopark Bariyeri', 'otopark-bariyeri', 1),
  ('industrialBarrier', 'barrierSystems', 'Endüstriyel Bariyer', 'endustriyel-bariyer', 2);
