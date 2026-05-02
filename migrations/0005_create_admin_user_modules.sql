CREATE TABLE IF NOT EXISTS admin_user_modules (
  user_id TEXT NOT NULL,
  module_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, module_key),
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO admin_user_modules (user_id, module_key)
SELECT id, 'products' FROM admin_users WHERE is_active = 1;

INSERT OR IGNORE INTO admin_user_modules (user_id, module_key)
SELECT id, 'users' FROM admin_users WHERE is_active = 1;

INSERT OR IGNORE INTO admin_user_modules (user_id, module_key)
SELECT id, 'settings' FROM admin_users WHERE is_active = 1;
