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
    is_banned BOOLEAN DEFAULT false,
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
-- GÖNDERİ TABLOLARI (GARAJ MUHABBET)
-- =============================================

-- Kategoriler: soru, yedek_parca, servis, bakim, deneyim, yardim, anket
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    brand_id INTEGER REFERENCES brands(id),
    model_id INTEGER REFERENCES models(id),
    category VARCHAR(20) NOT NULL CHECK (category IN ('soru', 'yedek_parca', 'servis', 'bakim', 'deneyim', 'yardim', 'anket')),
    content TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
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

-- =============================================
-- KULLANICI ROZETLERİ TABLOLARI
-- =============================================

-- Kullanıcı Rozetleri Tablosu
-- Kullanıcılar yorum ve gönderi sayısına göre rozet kazanır
-- Seviyeler: bronze, silver, gold, platinum, diamond
CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR(20) NOT NULL CHECK (badge_type IN ('comment', 'post')),
    badge_level VARCHAR(20) NOT NULL CHECK (badge_level IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_type, badge_level)
);

-- =============================================
-- ANKET SİSTEMİ TABLOLARI
-- =============================================

-- Anketler tablosu
-- Her gönderi 1 adet ankete sahip olabilir
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
    question TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Anket seçenekleri
CREATE TABLE poll_options (
    id SERIAL PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(200) NOT NULL,
    option_order INTEGER NOT NULL,
    UNIQUE(poll_id, option_order)
);

-- Oylar (her kullanıcı 1 kere oy verebilir)
CREATE TABLE poll_votes (
    id SERIAL PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- =============================================
-- İNDEKSLER
-- =============================================

-- Users indeksleri
CREATE INDEX idx_users_is_banned ON users(is_banned) WHERE is_banned = true;

-- Posts indeksleri
CREATE INDEX idx_posts_city ON posts(city_id);
CREATE INDEX idx_posts_brand ON posts(brand_id);
CREATE INDEX idx_posts_model ON posts(model_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_user ON posts(user_id);

-- Models indeksleri
CREATE INDEX idx_models_brand ON models(brand_id);

-- Comments indeksleri
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Notifications indeksleri
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- User badges indeksleri
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_type_level ON user_badges(badge_type, badge_level);

-- Polls indeksleri
CREATE INDEX idx_polls_post ON polls(post_id);
CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);
CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user ON poll_votes(user_id);
CREATE INDEX idx_poll_votes_option ON poll_votes(option_id);

-- =============================================
-- ROZET KAZANIM KURALLARI (Referans)
-- =============================================
-- YORUM ROZETLERİ:
--   Bronze  (Bronz):   5+ yorum
--   Silver  (Gümüş):   25+ yorum
--   Gold    (Altın):   100+ yorum
--   Platinum (Platin): 500+ yorum
--   Diamond (Elmas):   1000+ yorum
--
-- GÖNDERİ ROZETLERİ:
--   Bronze  (Bronz):   2+ gönderi
--   Silver  (Gümüş):   10+ gönderi
--   Gold    (Altın):   50+ gönderi
--   Platinum (Platin): 200+ gönderi
--   Diamond (Elmas):   500+ gönderi
