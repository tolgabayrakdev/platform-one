-- =============================================
-- TEST VERİLERİ - SEED
-- Her mahalle için 100 ilan
-- =============================================

-- NOT: Tekrar çalıştırırsan yeni kullanıcı ve ilanlar eklenir (duplicate olmaz email unique olduğu için)

-- =============================================
-- TEST KULLANICILARI ve İLANLAR
-- =============================================

DO $$
DECLARE
    n_id INTEGER;
    u_id UUID;
    i INTEGER;
    j INTEGER;
    random_category VARCHAR;
    random_content TEXT;
    categories VARCHAR[] := ARRAY['kayip', 'yardim', 'etkinlik', 'ucretsiz', 'soru'];
    first_names VARCHAR[] := ARRAY['Ahmet', 'Mehmet', 'Ali', 'Ayşe', 'Fatma', 'Zeynep', 'Mustafa', 'Hasan', 'Elif', 'Emre'];
    last_names VARCHAR[] := ARRAY['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan'];
    
    kayip_icerikler TEXT[] := ARRAY[
        'Turuncu beyaz renkli kedim kayboldu. 2 yaşında, erkek, adı Pamuk. Gören olursa lütfen haber versin. 🐱',
        'Siyah labrador cinsi köpeğim kayıp. Adı Max, 3 yaşında. Tasmasında telefon numarası var.',
        'Gri British Shorthair kedim dün akşamdan beri kayıp. Adı Minnoş, çok uysal. Ödüllü!',
        'Sarı kanarya kuşum camdan kaçtı. Şarkı söylemeyi çok sever. Bulan olursa minnettar olurum.',
        'Kahverengi Pomeranian köpeğim kayıp. Adı Boncuk, 5 yaşında, dişi. Çok üzgünüm 😢',
        'Beyaz Ankara kedisi kayıp. Bir gözü mavi bir gözü yeşil. Adı Kar.',
        'Golden Retriever köpeğim dün parktan kaçtı. Adı Buddy, çok cana yakın.',
        'Muhabbet kuşum uçtu gitti. Yeşil renkte, konuşuyor. Adı Çiko.',
        'Tekir kedim 3 gündür kayıp. Kulağında küçük bir çentik var. Lütfen yardım edin.',
        'Siyah beyaz Husky kayıp. Mavi gözlü, adı Luna. Çok özledik.'
    ];
    
    yardim_icerikler TEXT[] := ARRAY[
        'Yarın taşınıyorum, yardımcı olabilecek 2-3 kişi arıyorum. Kahvaltı ve öğle yemeği benden! 📦',
        'Acil matkap lazım, yarın sabaha kadar. Ödünç verebilecek var mı?',
        'Arabam bozuldu, akü takviye edebilecek biri var mı? Şu an X caddesindeyim.',
        'Çocuğumu yarın okula götüremiyorum, biri alabilir mi? Aynı okulda çocuğu olan?',
        'Bilgisayarım çok yavaşladı, format atabilecek biri var mı? Karşılığında yemek ısmarlarım.',
        'Dolap taşımada yardım lazım, 3. kata çıkaracağız. Akşam 18:00 civarı müsait olan?',
        'Kedime yarın bakabilecek biri var mı? 1 günlük iş seyahati için.',
        'İngilizce çeviri yapabilecek biri lazım acil. Kısa bir metin, ücretli olabilir.',
        'Bisiklet tamiri bilen var mı? Zincir koptu, nasıl takılıyor bilmiyorum.',
        'Yarın hastaneye gidiyorum, arabası olan biri götürebilir mi? Taksi çok pahalı.'
    ];
    
    etkinlik_icerikler TEXT[] := ARRAY[
        'Bu cumartesi mahalle pikniği yapıyoruz! Herkes davetli, parkta saat 14:00''da buluşalım. 🌳',
        'Kitap kulübü toplantısı bu çarşamba. Bu ay Sabahattin Ali okuyoruz. Katılmak isteyen?',
        'Mahalle koşu grubu kuruyoruz! Her sabah 07:00''da parkta buluşma. İlgilenen yazsın.',
        'Çocuklar için ücretsiz resim kursu başlıyor. Cumartesi günleri, 10:00-12:00.',
        'Bu pazar mahalle temizlik günü! Gönüllüler arıyoruz. Malzemeler belediyeden.',
        'Yoga dersleri başlıyor! Her salı ve perşembe akşamı. İlk ders ücretsiz.',
        'Mahalle mangal partisi bu hafta sonu! Herkes bir şey getirsin. 🍖',
        'Satranç turnuvası düzenliyoruz. Tüm yaş gruplarına açık. Kayıt için mesaj atın.',
        'Film gecesi bu cuma! Açık havada, battaniyenizi getirin. Film: Yeşilçam klasiği.',
        'Komşu buluşması bu akşam kafede. Yeni taşınanlar özellikle bekliyoruz!'
    ];
    
    ucretsiz_icerikler TEXT[] := ARRAY[
        'Ücretsiz koltuk takımı. 3+2+1, biraz eskimiş ama kullanılabilir. Alacak olan yazsın. 🛋️',
        'Çalışan eski buzdolabı. Taşıma sizden, ücretsiz veriyorum.',
        'Çocuk kıyafetleri (2-4 yaş). Temiz, iyi durumda. Poşetlenmiş bekliyor.',
        'Eski kitaplar - roman, hikaye, tarih. 50+ kitap, hepsi ücretsiz.',
        'Tek kişilik yatak. Şilte dahil, temiz. Öğrenciye verilir.',
        'Çalışır durumda çamaşır makinesi. 10 yaşında ama hala iş görüyor.',
        'Bebek arabası, az kullanılmış. İhtiyacı olana ücretsiz.',
        'Eski bilgisayar monitörü. VGA girişli, çalışıyor.',
        'Mutfak eşyaları - tencere, tava seti. Taşındığım için veriyorum.',
        'Bisiklet (tamir gerekli). Lastiği patlak, zinciri sağlam.'
    ];
    
    soru_icerikler TEXT[] := ARRAY[
        'Bu mahallede güvenilir bir tesisatçı bilen var mı? Acil değil ama öneri lazım. 🔧',
        'En yakın eczane hangisi ve kaça kadar açık?',
        'Mahallede kedi maması satan market var mı? Sürekli şehir merkezine gidiyorum.',
        'Çöpler hangi gün toplanıyor? Yeni taşındım, bilmiyorum.',
        'İyi bir kuaför önerebilir misiniz? Erkek kuaförü arıyorum.',
        'Parkın açık olduğu saatler nedir? Gece koşusu yapmak istiyorum.',
        'Mahallede wifi iyi çeken cafe var mı? Uzaktan çalışıyorum.',
        'Pazar günleri açık market var mı?',
        'Veteriner önerisi lazım. Kedim için rutin kontrol yaptıracağım.',
        'Mahallede elektrikçi bilen var mı? Sigorta sürekli atıyor.'
    ];
    
    user_ids UUID[];
BEGIN
    -- Her mahalle için
    FOR n_id IN SELECT id FROM neighborhoods LOOP
        user_ids := ARRAY[]::UUID[];
        
        -- 5 kullanıcı oluştur (her çalıştırmada unique)
        FOR i IN 1..5 LOOP
            INSERT INTO users (first_name, last_name, email, phone, password, is_verified, email_verified, phone_verified, neighborhood_id)
            VALUES (
                first_names[floor(random() * 10 + 1)],
                last_names[floor(random() * 10 + 1)],
                'test_' || n_id || '_' || extract(epoch from now())::bigint || '_' || floor(random() * 10000)::int || '_' || i || '@mahalle.app',
                '+9053' || (10000000 + floor(random() * 89999999))::TEXT,
                '$2b$10$xPPMfPZfMqNqR0ZJGtOeAuYxLxMqMqMqMqMqMqMqMqMqMqMqMqMqM',
                true, true, true, n_id
            )
            RETURNING id INTO u_id;
            
            user_ids := array_append(user_ids, u_id);
        END LOOP;
        
        -- 100 ilan oluştur
        FOR j IN 1..100 LOOP
            random_category := categories[floor(random() * 5 + 1)];
            
            CASE random_category
                WHEN 'kayip' THEN random_content := kayip_icerikler[floor(random() * 10 + 1)];
                WHEN 'yardim' THEN random_content := yardim_icerikler[floor(random() * 10 + 1)];
                WHEN 'etkinlik' THEN random_content := etkinlik_icerikler[floor(random() * 10 + 1)];
                WHEN 'ucretsiz' THEN random_content := ucretsiz_icerikler[floor(random() * 10 + 1)];
                WHEN 'soru' THEN random_content := soru_icerikler[floor(random() * 10 + 1)];
            END CASE;
            
            INSERT INTO posts (user_id, neighborhood_id, category, content, created_at)
            VALUES (
                user_ids[floor(random() * 5 + 1)],
                n_id,
                random_category,
                random_content,
                NOW() - (floor(random() * 30) || ' days')::INTERVAL - (floor(random() * 24) || ' hours')::INTERVAL
            );
        END LOOP;
    END LOOP;
END $$;

-- Sonuç
SELECT 'Kullanıcı: ' || COUNT(*) FROM users WHERE email LIKE 'test%@mahalle.app'
UNION ALL
SELECT 'İlan: ' || COUNT(*) FROM posts;
