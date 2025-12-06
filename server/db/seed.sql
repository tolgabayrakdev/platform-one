-- =============================================
-- TEST VERİLERİ - SEED
-- Her il için araç gönderileri
-- =============================================

-- NOT: Tekrar çalıştırırsan yeni kullanıcı ve gönderiler eklenir (duplicate olmaz email unique olduğu için)

-- =============================================
-- TEST KULLANICILARI ve GÖNDERİLER
-- =============================================

DO $$
DECLARE
    c_id INTEGER;
    b_id INTEGER;
    m_id INTEGER;
    u_id UUID;
    i INTEGER;
    j INTEGER;
    random_category VARCHAR;
    random_content TEXT;
    categories VARCHAR[] := ARRAY['satilik', 'kiralik', 'yedek_parca', 'aksesuar', 'servis'];
    first_names VARCHAR[] := ARRAY['Ahmet', 'Mehmet', 'Ali', 'Ayşe', 'Fatma', 'Zeynep', 'Mustafa', 'Hasan', 'Elif', 'Emre'];
    last_names VARCHAR[] := ARRAY['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan'];
    
    -- Dinamik içerik şablonları (marka ve model isimleri ile doldurulacak)
    satilik_template TEXT := '%s model %s satılık. %s km, bakımlı, hasarsız. Fiyat görüşülebilir. İletişim için mesaj atın. 🚗';
    kiralik_template TEXT := '%s kiralık. Günlük/haftalık/aylık kiralama seçenekleri mevcut. Detaylar için mesaj atın. 🚗';
    yedek_parca_template TEXT := '%s %s için yedek parça. Orijinal, çalışır durumda. Fiyat görüşülebilir. 🔧';
    
    aksesuar_icerikler TEXT[] := ARRAY[
        'Araç için güneşlik seti. 4 cam için, kaliteli malzeme. Fiyat: 150 TL. 🎨',
        'Araç için paspas seti. Kauçuk, su geçirmez. Fiyat: 200 TL.',
        'Araç için koltuk kılıfı seti. Kumaş, yıkanabilir. Fiyat: 300 TL.',
        'Araç için telefon tutacağı. Manyetik, güçlü. Fiyat: 50 TL.',
        'Araç için USB şarj adaptörü. Çift portlu, hızlı şarj. Fiyat: 80 TL.',
        'Araç için güneşlik perdesi. Ön cam için, katlanabilir. Fiyat: 100 TL.',
        'Araç için koku spreyleri seti. 3 adet, farklı kokular. Fiyat: 60 TL.',
        'Araç için temizlik seti. Mikrofiber bezler dahil. Fiyat: 120 TL.',
        'Araç için bagaj organizatörü. Katlanabilir, pratik. Fiyat: 180 TL.',
        'Araç için güneşlik cam filmi. Profesyonel uygulama. Fiyat görüşülebilir.'
    ];
    
    servis_icerikler TEXT[] := ARRAY[
        'Araç bakım ve onarım hizmeti. Deneyimli ustalar, uygun fiyat. İletişim için mesaj atın. 🛠️',
        'Periyodik bakım hizmeti. Yağ değişimi, filtre değişimi. Fiyat görüşülebilir.',
        'Motor tamiri hizmeti. Tüm markalar için hizmet. Deneyimli ekip.',
        'Fren sistemi bakımı. Fren balata, disk değişimi. Uygun fiyat garantisi.',
        'Klima bakımı ve tamiri. Gaz doldurma, filtre değişimi. Hızlı servis.',
        'Elektrik arıza tamiri. Alternatör, marş motoru, akü. Deneyimli elektrikçi.',
        'Kaporta ve boya hizmeti. Hasar onarımı, boyama. Profesyonel işçilik.',
        'Lastik değişimi ve balans ayarı. Tüm lastik markaları. Hızlı servis.',
        'Cam tamiri ve değişimi. Ön cam, yan camlar. Sigorta anlaşmalı.',
        'Egzoz tamiri. Muffler, katalizör değişimi. Uygun fiyat garantisi.'
    ];
    
    user_ids UUID[];
    city_ids INTEGER[];
    brand_ids INTEGER[];
    model_ids INTEGER[];
    brand_name TEXT;
    model_name TEXT;
    year_val INTEGER;
    km_val INTEGER;
    price_val INTEGER;
BEGIN
    -- Tüm illeri al
    SELECT ARRAY_AGG(id) INTO city_ids FROM cities;
    
    -- Tüm markaları al
    SELECT ARRAY_AGG(id) INTO brand_ids FROM brands;
    
    -- Her il için
    FOREACH c_id IN ARRAY city_ids LOOP
        user_ids := ARRAY[]::UUID[];
        
        -- 5 kullanıcı oluştur (her çalıştırmada unique)
        FOR i IN 1..5 LOOP
            INSERT INTO users (first_name, last_name, email, phone, password, is_verified, email_verified, phone_verified, city_id)
            VALUES (
                first_names[floor(random() * 10 + 1)],
                last_names[floor(random() * 10 + 1)],
                'test_' || c_id || '_' || extract(epoch from now())::bigint || '_' || floor(random() * 10000)::int || '_' || i || '@arac.app',
                '+9053' || (10000000 + floor(random() * 89999999))::TEXT,
                '$2b$10$xPPMfPZfMqNqR0ZJGtOeAuYxLxMqMqMqMqMqMqMqMqMqMqMqMqMqM',
                true, true, true, c_id
            )
            RETURNING id INTO u_id;
            
            user_ids := array_append(user_ids, u_id);
        END LOOP;
        
        -- Her marka için
        FOREACH b_id IN ARRAY brand_ids LOOP
            -- Marka ismini al
            SELECT name INTO brand_name FROM brands WHERE id = b_id;
            
            -- Bu markaya ait modelleri al
            SELECT ARRAY_AGG(id) INTO model_ids FROM models WHERE brand_id = b_id;
            
            -- Eğer bu markaya ait model yoksa atla
            IF model_ids IS NULL THEN
                CONTINUE;
            END IF;
            
            -- Her model için 10 gönderi oluştur
            FOREACH m_id IN ARRAY model_ids LOOP
                -- Model ismini al
                SELECT name INTO model_name FROM models WHERE id = m_id;
                
                FOR j IN 1..10 LOOP
                    random_category := categories[floor(random() * 5 + 1)];
                    
                    -- Rastgele yıl, km ve fiyat oluştur
                    year_val := 2015 + floor(random() * 10); -- 2015-2024 arası
                    km_val := 20000 + floor(random() * 100000); -- 20.000-120.000 km arası
                    price_val := 150000 + floor(random() * 400000); -- 150.000-550.000 TL arası
                    
                    -- Kategoriye göre içerik oluştur
                    CASE random_category
                        WHEN 'satilik' THEN 
                            random_content := format(satilik_template, year_val::TEXT, brand_name || ' ' || model_name, km_val::TEXT);
                        WHEN 'kiralik' THEN 
                            random_content := format(kiralik_template, brand_name || ' ' || model_name);
                        WHEN 'yedek_parca' THEN 
                            random_content := format(yedek_parca_template, brand_name, model_name);
                        WHEN 'aksesuar' THEN 
                            random_content := aksesuar_icerikler[floor(random() * 10 + 1)];
                        WHEN 'servis' THEN 
                            random_content := servis_icerikler[floor(random() * 10 + 1)];
                    END CASE;
                    
                    INSERT INTO posts (user_id, city_id, brand_id, model_id, category, content, created_at)
                    VALUES (
                        user_ids[floor(random() * 5 + 1)],
                        c_id,
                        b_id,
                        m_id,
                        random_category,
                        random_content,
                        NOW() - (floor(random() * 30) || ' days')::INTERVAL - (floor(random() * 24) || ' hours')::INTERVAL
                    );
                END LOOP;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Sonuç
SELECT 'Kullanıcı: ' || COUNT(*) FROM users WHERE email LIKE 'test%@arac.app'
UNION ALL
SELECT 'Gönderi: ' || COUNT(*) FROM posts;
