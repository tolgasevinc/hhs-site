UPDATE footer_social_links
SET url = 'https://www.instagram.com/', updated_at = CURRENT_TIMESTAMP
WHERE platform = 'instagram' AND url = '';

UPDATE footer_social_links
SET url = 'https://www.facebook.com/', updated_at = CURRENT_TIMESTAMP
WHERE platform = 'facebook' AND url = '';

UPDATE footer_social_links
SET url = 'https://www.linkedin.com/', updated_at = CURRENT_TIMESTAMP
WHERE platform = 'linkedin' AND url = '';

UPDATE footer_social_links
SET url = 'https://www.youtube.com/', updated_at = CURRENT_TIMESTAMP
WHERE platform = 'youtube' AND url = '';

UPDATE footer_social_links
SET url = 'https://www.tiktok.com/', updated_at = CURRENT_TIMESTAMP
WHERE platform = 'tiktok' AND url = '';
