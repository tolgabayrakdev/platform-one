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
    city_id INTEGER REFERENCES cities(id),
    brand_id INTEGER REFERENCES brands(id),
    model_id INTEGER REFERENCES models(id),
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



-- =============================================
-- ARAÇ MARKA VE MODEL TABLOLARI
-- =============================================

-- Araç Markaları
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Araç Modelleri
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE(brand_id, name)
);

-- =============================================
-- İLAN TABLOLARI (ARAÇ PLATFORMU)
-- =============================================

-- Kategoriler: satilik, kiralik, yedek_parca, aksesuar, servis
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    brand_id INTEGER NOT NULL REFERENCES brands(id),
    model_id INTEGER NOT NULL REFERENCES models(id),
    category VARCHAR(20) NOT NULL CHECK (category IN ('satilik', 'kiralik', 'yedek_parca', 'aksesuar', 'servis')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- YORUM TABLOLARI
-- =============================================

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_posts_city ON posts(city_id);
CREATE INDEX idx_posts_brand ON posts(brand_id);
CREATE INDEX idx_posts_model ON posts(model_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_models_brand ON models(brand_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- =============================================
-- BİLDİRİM TABLOLARI
-- =============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('comment', 'like', 'follow')),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- ÖRNEK VERİLER (MVP için)
-- =============================================

-- İller
INSERT INTO cities (name) VALUES 
    ('İstanbul'),
    ('Ankara'),
    ('İzmir');

-- =============================================
-- ARAÇ MARKA VE MODEL VERİLERİ
-- =============================================

-- Araç Markaları
INSERT INTO brands (name) VALUES 
    ('Fiat'),
    ('Renault'),
    ('Volkswagen'),
    ('Ford'),
    ('Opel'),
    ('Peugeot'),
    ('Toyota'),
    ('Hyundai'),
    ('Mercedes-Benz'),
    ('BMW');

-- Araç Modelleri - Fiat
INSERT INTO models (brand_id, name) VALUES 
    (1, 'Punto'),
    (1, 'Egea'),
    (1, 'Doblo'),
    (1, 'Fiorino'),
    (1, 'Tipo');

-- Araç Modelleri - Renault
INSERT INTO models (brand_id, name) VALUES 
    (2, 'Clio'),
    (2, 'Megane'),
    (2, 'Fluence'),
    (2, 'Symbol'),
    (2, 'Kangoo');

-- Araç Modelleri - Volkswagen
INSERT INTO models (brand_id, name) VALUES 
    (3, 'Golf'),
    (3, 'Polo'),
    (3, 'Passat'),
    (3, 'Jetta'),
    (3, 'Tiguan');

-- Araç Modelleri - Ford
INSERT INTO models (brand_id, name) VALUES 
    (4, 'Focus'),
    (4, 'Fiesta'),
    (4, 'Mondeo'),
    (4, 'Kuga'),
    (4, 'Transit');

-- Araç Modelleri - Opel
INSERT INTO models (brand_id, name) VALUES 
    (5, 'Corsa'),
    (5, 'Astra'),
    (5, 'Insignia'),
    (5, 'Crossland'),
    (5, 'Combo');
