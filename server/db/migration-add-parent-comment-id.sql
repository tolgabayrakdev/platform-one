-- Migration: comments tablosuna parent_comment_id ekle
-- Mevcut veritabanı için çalıştırılacak

ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
