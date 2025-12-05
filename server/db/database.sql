CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- KULLANICI TABLOLARI
-- =============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL, 
    is_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    email_verify_token VARCHAR(255),
    email_verify_token_created_at TIMESTAMP,
    phone_verify_token VARCHAR(255),
    phone_verify_token_created_at TIMESTAMP,
    neighborhood_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- LOKASYON TABLOLARI
-- =============================================

-- İller
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- İlçeler
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL
);

-- Mahalleler
CREATE TABLE neighborhoods (
    id SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

-- Users tablosuna foreign key ekle
ALTER TABLE users ADD CONSTRAINT fk_users_neighborhood 
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id);

-- =============================================
-- İLAN TABLOLARI
-- =============================================

-- Kategoriler: kayip, yardim, etkinlik, ucretsiz, soru
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    neighborhood_id INTEGER NOT NULL REFERENCES neighborhoods(id),
    category VARCHAR(20) NOT NULL CHECK (category IN ('kayip', 'yardim', 'etkinlik', 'ucretsiz', 'soru')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_posts_neighborhood ON posts(neighborhood_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_districts_city ON districts(city_id);
CREATE INDEX idx_neighborhoods_district ON neighborhoods(district_id);

-- =============================================
-- ÖRNEK VERİLER (MVP için)
-- =============================================

-- İller
INSERT INTO cities (name) VALUES 
    ('İstanbul'),
    ('Ankara'),
    ('İzmir');

-- İlçeler - İstanbul
INSERT INTO districts (city_id, name) VALUES 
    (1, 'Kadıköy'),
    (1, 'Beşiktaş'),
    (1, 'Üsküdar'),
    (1, 'Şişli'),
    (1, 'Bakırköy');

-- İlçeler - Ankara
INSERT INTO districts (city_id, name) VALUES 
    (2, 'Çankaya'),
    (2, 'Keçiören'),
    (2, 'Yenimahalle');

-- İlçeler - İzmir
INSERT INTO districts (city_id, name) VALUES 
    (3, 'Konak'),
    (3, 'Karşıyaka'),
    (3, 'Bornova');

-- Mahalleler - Kadıköy
INSERT INTO neighborhoods (district_id, name) VALUES 
    (1, 'Caferağa'),
    (1, 'Moda'),
    (1, 'Fenerbahçe'),
    (1, 'Göztepe');

-- Mahalleler - Beşiktaş
INSERT INTO neighborhoods (district_id, name) VALUES 
    (2, 'Levent'),
    (2, 'Etiler'),
    (2, 'Bebek');

-- Mahalleler - Üsküdar
INSERT INTO neighborhoods (district_id, name) VALUES 
    (3, 'Acıbadem'),
    (3, 'Altunizade');

-- Mahalleler - Çankaya
INSERT INTO neighborhoods (district_id, name) VALUES 
    (6, 'Kızılay'),
    (6, 'Bahçelievler'),
    (6, 'Çayyolu');

-- Mahalleler - Konak
INSERT INTO neighborhoods (district_id, name) VALUES 
    (9, 'Alsancak'),
    (9, 'Kordon');
