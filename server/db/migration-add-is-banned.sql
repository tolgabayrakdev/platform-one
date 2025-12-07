-- Migration: users tablosuna is_banned kolonu ekle
-- Mevcut veritabanı için çalıştırılacak

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- Mevcut kayıtlar için false set et
UPDATE users SET is_banned = false WHERE is_banned IS NULL;

-- İndeks ekle (banlanmış kullanıcıları hızlı sorgulamak için)
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(is_banned) WHERE is_banned = true;
