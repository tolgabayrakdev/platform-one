-- =============================================
-- GARAJ NOTLARI TABLOLARI
-- =============================================

-- Garaj Notları Tablosu (Kişisel Araç Bakım Defteri)
CREATE TABLE garage_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('servis', 'bakim', 'yedek_parca', 'lastik', 'sigorta', 'vergiler', 'diger')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    mileage INTEGER, -- KM bilgisi
    cost DECIMAL(10, 2), -- Harcama tutarı
    service_location VARCHAR(200), -- Servis yeri/kişi
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_garage_notes_user ON garage_notes(user_id);
CREATE INDEX idx_garage_notes_date ON garage_notes(date DESC);
CREATE INDEX idx_garage_notes_type ON garage_notes(type);
CREATE INDEX idx_garage_notes_mileage ON garage_notes(mileage DESC);

-- Updated_at otomatik güncelleme trigger
CREATE OR REPLACE FUNCTION update_garage_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_garage_notes_updated_at
    BEFORE UPDATE ON garage_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_garage_notes_updated_at();
