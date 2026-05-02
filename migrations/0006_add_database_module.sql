INSERT OR IGNORE INTO admin_user_modules (user_id, module_key)
SELECT id, 'database' FROM admin_users WHERE is_active = 1;
