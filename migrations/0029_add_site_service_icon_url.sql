ALTER TABLE site_services ADD COLUMN icon_url TEXT NOT NULL DEFAULT '';

UPDATE site_services
SET icon_url = '/service-icons/shopping-cart.svg'
WHERE key = 'bahceKapisiMotorlari' AND icon_url = '';

UPDATE site_services
SET icon_url = '/service-icons/drafting-compass.svg'
WHERE key = 'otomatikBariyerSistemleri' AND icon_url = '';

UPDATE site_services
SET icon_url = '/service-icons/wrench.svg'
WHERE key = 'fotoselliKapilar' AND icon_url = '';

UPDATE site_services
SET icon_url = '/service-icons/pencil-ruler.svg'
WHERE key = 'plakaTanimaSistemleri' AND icon_url = '';
