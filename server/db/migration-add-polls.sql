-- Anket Sistemi Tabloları
-- Her gönderi 1 adet ankete sahip olabilir
-- Her kullanıcı bir ankette sadece 1 kere oy verebilir

-- Anketler tablosu
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

-- İndeksler
CREATE INDEX idx_polls_post ON polls(post_id);
CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);
CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user ON poll_votes(user_id);
CREATE INDEX idx_poll_votes_option ON poll_votes(option_id);

-- Posts tablosuna 'anket' kategorisi eklemek için:
-- ALTER TABLE posts DROP CONSTRAINT posts_category_check;
-- ALTER TABLE posts ADD CONSTRAINT posts_category_check 
--     CHECK (category IN ('soru', 'yedek_parca', 'servis', 'bakim', 'deneyim', 'yardim', 'anket'));

-- Anket gönderileri için brand_id ve model_id NULL olabilmeli:
ALTER TABLE posts ALTER COLUMN brand_id DROP NOT NULL;
ALTER TABLE posts ALTER COLUMN model_id DROP NOT NULL;
ALTER TABLE posts DROP CONSTRAINT posts_category_check; ALTER TABLE posts ADD CONSTRAINT posts_category_check CHECK (category IN ('soru', 'yedek_parca', 'servis', 'bakim', 'deneyim', 'yardim', 'anket'));
