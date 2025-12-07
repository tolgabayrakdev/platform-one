-- Migration: posts tablosuna images kolonu ekle
-- Mevcut veritabanı için çalıştırılacak

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Mevcut kayıtlar için boş array set et
UPDATE posts SET images = '[]'::jsonb WHERE images IS NULL;
