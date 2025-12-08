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

-- İndeksler
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_type_level ON user_badges(badge_type, badge_level);

-- Rozet Kazanım Kuralları (Referans):
-- ====================================
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
