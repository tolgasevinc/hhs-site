CREATE TABLE IF NOT EXISTS site_services (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_services (key, title, summary, detail, sort_order, is_active)
VALUES
  (
    'bahceKapisiMotorlari',
    'Bahçe Kapısı Motorları',
    'Yana kayar ve kanatlı kapılar için motor, kumanda, fotosel ve aksesuar çözümleri.',
    'Yana kayar ve kanatlı bahçe kapıları için motor, kumanda, fotosel, emniyet ekipmanları ve aksesuar çözümleri sunuyoruz.',
    1,
    1
  ),
  (
    'otomatikBariyerSistemleri',
    'Otomatik Bariyer Sistemleri',
    'Site, fabrika, otopark ve işletme girişleri için profesyonel bariyer sistemleri.',
    'Site, fabrika, otopark ve işletme girişlerinde yoğun kullanıma uygun otomatik bariyer sistemleri planlıyor ve kuruyoruz.',
    2,
    1
  ),
  (
    'fotoselliKapilar',
    'Fotoselli Kapılar',
    'Mağaza, hastane, ofis ve yoğun geçiş alanları için otomatik cam kapı sistemleri.',
    'Mağaza, hastane, ofis ve yoğun geçiş alanlarında kullanılabilecek fotoselli otomatik cam kapı çözümleri sağlıyoruz.',
    3,
    1
  ),
  (
    'plakaTanimaSistemleri',
    'Plaka Tanıma Sistemleri',
    'Araç giriş kontrolü, ambulans geçiş önceliği ve yetkili araç geçiş çözümleri.',
    'Araç giriş kontrolü, yetkili araç geçişi ve özel geçiş senaryoları için plaka tanıma çözümleri kuruyoruz.',
    4,
    1
  );
