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
    categories VARCHAR[] := ARRAY['soru', 'yedek_parca', 'servis', 'bakim', 'deneyim', 'yardim'];
    first_names VARCHAR[] := ARRAY['Ahmet', 'Mehmet', 'Ali', 'Ayşe', 'Fatma', 'Zeynep', 'Mustafa', 'Hasan', 'Elif', 'Emre'];
    last_names VARCHAR[] := ARRAY['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan'];
    
    -- Topluluk/forum odaklı içerik şablonları
    soru_icerikler TEXT[] := ARRAY[
        '%s %s modelinde yağ değişimi ne kadar sürede yapılmalı? İlk kez araç sahibi oldum, bilgisi olan var mı? ❓',
        '%s %s için hangi lastik markası önerirsiniz? Kış lastiği alacağım, tavsiyeleriniz neler?',
        '%s %s motorunda garip bir ses var, ne olabilir? Motor çalışırken tık tık ses geliyor.',
        '%s %s için servis önerisi var mı? İstanbul''da güvenilir bir servis arıyorum.',
        '%s %s kliması yeterince soğutmuyor, ne yapabilirim? Gaz doldurma gerekir mi?',
        '%s %s frenlerinde gıcırtı var, normal mi? Fren balata değişimi gerekir mi?',
        '%s %s için akü önerisi? Kaç amper olmalı? Hangi marka daha iyi?',
        '%s %s radyatör suyu sürekli azalıyor, neden olabilir? Kontrol ettirdim ama bir şey bulamadılar.',
        '%s %s için cam filmi önerisi var mı? Hangi marka ve renk tonu daha iyi?',
        '%s %s motor yağı hangi marka kullanıyorsunuz? Sentetik mi mineral mi tercih ediyorsunuz?'
    ];
    
    yedek_parca_icerikler TEXT[] := ARRAY[
        '%s %s için orijinal far fiyatları ne kadar? Birisi çarptı, değiştirmem gerekiyor.',
        '%s %s için egzoz borusu nereden bulabilirim? Orijinal veya yedek parça önerisi var mı?',
        '%s %s için kaporta parçası lazım. Sağ ön kapı, nereden temin edebilirim?',
        '%s %s için motor parçası arıyorum. Alternatör arızalı, nereden alabilirim?',
        '%s %s için fren balata önerisi? Hangi marka daha uzun ömürlü?',
        '%s %s için klima kompresörü arızalı. Tamir mi yoksa değişim mi daha mantıklı?',
        '%s %s için amortisör önerisi var mı? Hangi marka daha konforlu?',
        '%s %s için cam silecek motoru arızalı. Nereden bulabilirim? Fiyatı ne kadar?',
        '%s %s için radyatör fanı çalışmıyor. Değişim mi yoksa tamir mi?',
        '%s %s için yakıt pompası arızalı. Orijinal parça nereden bulabilirim?'
    ];
    
    servis_icerikler TEXT[] := ARRAY[
        '%s %s için güvenilir servis önerisi var mı? İstanbul''da periyodik bakım yaptıracağım.',
        '%s %s motor arızası var, hangi servise götüreyim? Deneyimli bir servis arıyorum.',
        '%s %s için klima bakımı yaptıran var mı? Nerede yaptırdınız, memnun kaldınız mı?',
        '%s %s kaporta boyası yaptıracağım. İyi bir boyacı önerisi var mı?',
        '%s %s için fren bakımı yaptıran var mı? Hangi servis daha uygun fiyatlı?',
        '%s %s motor yağı değişimi nerede yaptırıyorsunuz? Güvenilir bir yer önerisi?',
        '%s %s için lastik değişimi ve balans ayarı yaptıran var mı? Nerede yaptırdınız?',
        '%s %s elektrik arızası var. İyi bir elektrikçi önerisi var mı?',
        '%s %s için cam tamiri yaptıran var mı? Ön camda çatlak var, tamir edilebilir mi?',
        '%s %s egzoz tamiri yaptıran var mı? Hangi servis daha uygun?'
    ];
    
    bakim_icerikler TEXT[] := ARRAY[
        '%s %s periyodik bakım programı nasıl? Kaç km''de ne yapılmalı?',
        '%s %s için motor yağı değişimi ne sıklıkla yapılmalı? Sentetik yağ kullanıyorum.',
        '%s %s filtre değişimleri ne zaman yapılmalı? Hava filtresi, yakıt filtresi, yağ filtresi?',
        '%s %s klima bakımı nasıl yapılır? Kendim yapabilir miyim yoksa servise mi götürmeliyim?',
        '%s %s fren bakımı ne zaman yapılmalı? Fren balata ömrü ne kadar?',
        '%s %s akü bakımı nasıl yapılır? Su seviyesi kontrolü gerekir mi?',
        '%s %s lastik bakımı ve rotasyon ne zaman yapılmalı?',
        '%s %s motor soğutma sistemi bakımı nasıl yapılır? Radyatör suyu ne zaman değişmeli?',
        '%s %s için kış bakımı neler yapılmalı? Kışa hazırlık için önerileriniz?',
        '%s %s yaz bakımı neler yapılmalı? Klima bakımı, lastik kontrolü vs?'
    ];
    
    deneyim_icerikler TEXT[] := ARRAY[
        '%s %s ile 2 yıllık deneyimim. Genel olarak memnunum ama şu konularda dikkat edilmeli...',
        '%s %s satın aldım, ilk izlenimlerim. Motor performansı ve yakıt tüketimi hakkında...',
        '%s %s ile uzun yol deneyimi. Konfor ve yakıt tüketimi nasıl?',
        '%s %s bakım masrafları. 1 yılda ne kadar harcadım, sizlerle paylaşmak istedim.',
        '%s %s ile şehir içi kullanım deneyimi. Trafikte nasıl, manevra kabiliyeti nasıl?',
        '%s %s satın alma sürecim. Hangi özelliklere dikkat ettim, tavsiyelerim...',
        '%s %s ile kış kullanımı. Karlı yolda nasıl, kış lastiği gerekli mi?',
        '%s %s modifikasyon deneyimlerim. Ne yaptırdım, memnun kaldım mı?',
        '%s %s servis deneyimlerim. Hangi servise gittim, memnun kaldım mı?',
        '%s %s ile ilgili genel görüşlerim. Artıları ve eksileri neler?'
    ];
    
    yardim_icerikler TEXT[] := ARRAY[
        '%s %s yolda kaldı, yardım lazım! Motor çalışmıyor, ne yapabilirim?',
        '%s %s için acil yedek parça lazım. Alternatör arızalı, nereden bulabilirim?',
        '%s %s için servis önerisi lazım. Motor arızası var, güvenilir bir yer arıyorum.',
        '%s %s lastik patladı, yedek lastik yok. Ne yapmalıyım? Çekici mi çağırayım?',
        '%s %s akü bitti, yol kenarında kaldım. Akü takviyesi yapabilir misiniz?',
        '%s %s yakıt bitti, yolda kaldım. En yakın benzin istasyonu nerede?',
        '%s %s için acil tamirci lazım. Frenler çalışmıyor, güvenli bir şekilde durduramıyorum.',
        '%s %s cam kırıldı, acil cam tamiri lazım. Nereden yaptırabilirim?',
        '%s %s için çekici lazım. Motor arızası var, servise çekmem gerekiyor.',
        '%s %s için acil yardım! Araç çalışmıyor, ne yapabilirim?'
    ];
    
    user_ids UUID[];
    city_ids INTEGER[];
    brand_ids INTEGER[];
    model_ids INTEGER[];
    brand_name TEXT;
    model_name TEXT;
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
                'test_' || c_id || '_' || extract(epoch from now())::bigint || '_' || floor(random() * 10000)::int || '_' || i || '@garajmuhabbet.app',
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
                    random_category := categories[floor(random() * 6 + 1)];
                    
                    -- Kategoriye göre içerik oluştur
                    CASE random_category
                        WHEN 'soru' THEN 
                            random_content := format(soru_icerikler[floor(random() * 10 + 1)], brand_name, model_name);
                        WHEN 'yedek_parca' THEN 
                            random_content := format(yedek_parca_icerikler[floor(random() * 10 + 1)], brand_name, model_name);
                        WHEN 'servis' THEN 
                            random_content := format(servis_icerikler[floor(random() * 10 + 1)], brand_name, model_name);
                        WHEN 'bakim' THEN 
                            random_content := format(bakim_icerikler[floor(random() * 10 + 1)], brand_name, model_name);
                        WHEN 'deneyim' THEN 
                            random_content := format(deneyim_icerikler[floor(random() * 10 + 1)], brand_name, model_name);
                        WHEN 'yardim' THEN 
                            random_content := format(yardim_icerikler[floor(random() * 10 + 1)], brand_name, model_name);
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
SELECT 'Kullanıcı: ' || COUNT(*) FROM users WHERE email LIKE 'test%@garajmuhabbet.app'
UNION ALL
SELECT 'Gönderi: ' || COUNT(*) FROM posts;
