# Garaj Muhabbet - Platform Özellikleri ve Modülleri

Bu dokümantasyon, platformun sahip olduğu tüm modülleri ve özellikleri detaylı olarak listeler.

---

## 📋 İçindekiler

- [Backend Modülleri](#backend-modülleri)
- [Frontend Modülleri](#frontend-modülleri)
- [Teknik Özellikler](#teknik-özellikler)
- [Özet İstatistikler](#özet-istatistikler)

---

## 🔧 Backend Modülleri ve Özellikler

### 1. Authentication (Kimlik Doğrulama)

**Dosyalar:**
- `server/src/controller/auth-controller.js`
- `server/src/service/auth-service.js`
- `server/src/routes/auth-routes.js`
- `server/src/middleware/auth-middleware.js`

**Özellikler:**
- ✅ Kullanıcı kaydı (email + telefon)
- ✅ Email doğrulama (token sistemi)
- ✅ Telefon doğrulama (SMS)
- ✅ Email/telefon kod yeniden gönderme
- ✅ Login/Logout
- ✅ JWT token yönetimi
- ✅ Rate limiting (auth endpoint'leri için)
- ✅ Kullanıcı banlama sistemi (`is_banned`)

**API Endpoints:**
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/verify-email` - Email doğrula
- `POST /api/auth/verify-phone` - Telefon doğrula
- `POST /api/auth/resend-email-code` - Email kodu yeniden gönder
- `POST /api/auth/resend-phone-code` - Telefon kodu yeniden gönder
- `POST /api/auth/login` - Giriş
- `GET /api/auth/me` - Kullanıcı bilgisi
- `POST /api/auth/logout` - Çıkış

---

### 2. User Management (Kullanıcı Yönetimi)

**Dosyalar:**
- `server/src/controller/user-controller.js`
- `server/src/service/user-service.js`
- `server/src/routes/user-routes.js`

**Özellikler:**
- ✅ Profil görüntüleme
- ✅ Şehir güncelleme
- ✅ Araç bilgisi güncelleme (marka/model)
- ✅ Kullanıcı doğrulama durumu takibi

**API Endpoints:**
- `GET /api/users/profile` - Profil getir
- `PUT /api/users/city` - Şehir güncelle
- `PUT /api/users/vehicle` - Araç bilgisi güncelle

---

### 3. Post Management (Gönderi Yönetimi)

**Dosyalar:**
- `server/src/controller/post-controller.js`
- `server/src/service/post-service.js`
- `server/src/routes/post-routes.js`

**Özellikler:**
- ✅ Gönderi oluşturma (7 kategori)
- ✅ Gönderi listeleme (pagination)
- ✅ Gönderi silme
- ✅ Çoklu resim yükleme (Cloudinary)
- ✅ Filtreleme sistemi
- ✅ Arama fonksiyonu
- ✅ Trend analizi
- ✅ Benzer gönderiler

**Kategoriler:**
1. `soru` - Soru
2. `yedek_parca` - Yedek Parça
3. `servis` - Servis
4. `bakim` - Bakım
5. `deneyim` - Deneyim
6. `yardim` - Yardım
7. `anket` - Anket

**Filtreleme Özellikleri:**
- Şehir bazlı (`cityId`)
- Marka bazlı (`brandId`)
- Model bazlı (`modelId`)
- Kategori bazlı (`category`)
- Metin araması (içerik, kullanıcı adı, şehir, marka, model)

**Scope Bazlı Filtreleme:**
- `my` - Kullanıcının kendi gönderileri
- `all` - Tüm gönderiler

**API Endpoints:**
- `GET /api/posts` - Gönderileri listele (filtreli)
- `GET /api/posts/my` - Kendi gönderilerim
- `GET /api/posts/trends` - Trend verileri
- `GET /api/posts/stats` - Platform istatistikleri
- `POST /api/posts` - Gönderi oluştur
- `DELETE /api/posts/:id` - Gönderi sil
- `GET /api/posts/:id` - Tek gönderi detayı
- `GET /api/posts/:id/related` - Benzer gönderiler

---

### 4. Comment System (Yorum Sistemi)

**Dosyalar:**
- `server/src/controller/comment-controller.js`
- `server/src/service/comment-service.js`
- `server/src/routes/comment-routes.js`

**Özellikler:**
- ✅ Yorum ekleme
- ✅ Yorum silme
- ✅ Yorumlara cevap verme (nested comments)
- ✅ Yorum listeleme (hierarchical)
- ✅ Bildirim gönderme (yorum yapıldığında)

**API Endpoints:**
- `POST /api/posts/:postId/comments` - Yorum ekle
- `GET /api/posts/:postId/comments` - Yorumları listele
- `DELETE /api/comments/:id` - Yorum sil

---

### 5. Poll System (Anket Sistemi)

**Dosyalar:**
- `server/src/controller/poll-controller.js`
- `server/src/service/poll-service.js`
- `server/src/routes/poll-routes.js`

**Özellikler:**
- ✅ Anket oluşturma (gönderi ile birlikte)
- ✅ Anket seçenekleri
- ✅ Oy verme (her kullanıcı 1 kere)
- ✅ Anket sonuçları (yüzde, toplam oy)
- ✅ Kullanıcı oy durumu takibi

**API Endpoints:**
- `POST /api/polls/:postId/vote` - Oy ver
- `GET /api/polls/:postId` - Anket detayı

---

### 6. Badge System (Rozet Sistemi)

**Dosyalar:**
- `server/src/controller/badge-controller.js`
- `server/src/service/badge-service.js`
- `server/src/routes/badge-routes.js`

**Özellikler:**
- ✅ Otomatik rozet kazanma
- ✅ Rozet görüntüleme
- ✅ Sonraki rozet ilerleme takibi

**Rozet Seviyeleri:**

**Yorum Rozetleri:**
- 🥉 Bronze (Bronz): 5+ yorum
- 🥈 Silver (Gümüş): 25+ yorum
- 🥇 Gold (Altın): 100+ yorum
- 💎 Platinum (Platin): 500+ yorum
- 💠 Diamond (Elmas): 1000+ yorum

**Gönderi Rozetleri:**
- 🥉 Bronze (Bronz): 2+ gönderi
- 🥈 Silver (Gümüş): 10+ gönderi
- 🥇 Gold (Altın): 50+ gönderi
- 💎 Platinum (Platin): 200+ gönderi
- 💠 Diamond (Elmas): 500+ gönderi

**API Endpoints:**
- `GET /api/users/badges` - Kendi rozetlerim
- `GET /api/users/:userId/badges` - Kullanıcı rozetleri

---

### 7. Notification System (Bildirim Sistemi)

**Dosyalar:**
- `server/src/controller/notification-controller.js`
- `server/src/service/notification-service.js`
- `server/src/service/notification-manager.js`
- `server/src/routes/notification-routes.js`

**Özellikler:**
- ✅ Bildirim oluşturma (yorum, like, follow tipleri)
- ✅ Bildirim listeleme
- ✅ Okundu/okunmadı durumu
- ✅ Tümünü okundu işaretleme
- ✅ SSE (Server-Sent Events) ile anlık bildirimler
- ✅ Okunmamış bildirim sayısı

**API Endpoints:**
- `GET /api/notifications` - Bildirimleri listele
- `GET /api/notifications/stream` - SSE stream
- `GET /api/notifications/unread-count` - Okunmamış sayısı
- `PUT /api/notifications/:id/read` - Okundu işaretle
- `PUT /api/notifications/read-all` - Tümünü okundu işaretle

---

### 8. Location Service (Lokasyon Servisi)

**Dosyalar:**
- `server/src/controller/location-controller.js`
- `server/src/service/location-service.js`
- `server/src/routes/location-routes.js`

**Özellikler:**
- ✅ Şehir listesi (81 il)
- ✅ İlçe listesi (şehir bazlı)
- ✅ Marka listesi
- ✅ Model listesi (marka bazlı)

**API Endpoints:**
- `GET /api/locations/cities` - Şehirleri listele
- `GET /api/locations/districts/:cityId` - İlçeleri listele
- `GET /api/locations/brands` - Markaları listele
- `GET /api/locations/models/:brandId` - Modelleri listele

---

### 9. Upload Service (Yükleme Servisi)

**Dosyalar:**
- `server/src/controller/upload-controller.js`
- `server/src/service/upload-service.js`
- `server/src/routes/upload-routes.js`
- `server/src/config/cloudinary.js`

**Özellikler:**
- ✅ Resim yükleme (Cloudinary)
- ✅ Çoklu resim desteği
- ✅ Resim optimizasyonu

**API Endpoints:**
- `POST /api/upload/images` - Resim yükle

---

### 10. Database (Veritabanı)

**Dosyalar:**
- `server/db/database.sql`
- `server/db/migration-*.sql`

**Tablolar:**
1. `users` - Kullanıcılar
2. `cities` - Şehirler (81 il)
3. `brands` - Araç markaları
4. `models` - Araç modelleri
5. `posts` - Gönderiler
6. `comments` - Yorumlar
7. `notifications` - Bildirimler
8. `user_badges` - Kullanıcı rozetleri
9. `polls` - Anketler
10. `poll_options` - Anket seçenekleri
11. `poll_votes` - Anket oyları

**Özellikler:**
- ✅ PostgreSQL veritabanı
- ✅ İndeksler (performans optimizasyonu)
- ✅ Foreign key constraints
- ✅ Migration dosyaları

---

### 11. Middleware

**Dosyalar:**
- `server/src/middleware/auth-middleware.js`
- `server/src/middleware/error-handler.js`
- `server/src/middleware/rate-limiter.js`

**Özellikler:**
- ✅ Authentication middleware
- ✅ Error handler
- ✅ Rate limiter
- ✅ CORS yapılandırması

---

## 🎨 Frontend (Web) Modülleri ve Özellikler

### 1. Sayfalar (Pages)

#### Ana Sayfalar
- **`/`** - Landing page
  - Hero section
  - Platform istatistikleri
  - Trend gösterimi
  - Son gönderiler

- **`/feed`** - Global feed
  - Tüm gönderiler
  - Filtreleme (kategori, şehir, marka, model)
  - Arama
  - Infinite scroll
  - Trend sidebar

- **`/home`** - Kullanıcı feed'i
  - Şehir bazlı gönderiler
  - Filtreleme
  - Arama
  - Infinite scroll

- **`/explore`** - Keşfet sayfası

#### Kullanıcı Sayfaları
- **`/sign-in`** - Giriş sayfası
- **`/sign-up`** - Kayıt sayfası
- **`/onboarding`** - İlk kayıt (şehir/araç seçimi)
- **`/profile`** - Profil sayfası (modüler yapı)
- **`/my-posts`** - Kullanıcının gönderileri
- **`/notifications`** - Bildirimler sayfası

#### İçerik Sayfaları
- **`/post/[id]`** - Gönderi detay sayfası
  - Gönderi içeriği
  - Yorumlar (nested)
  - Anket (varsa)
  - Resim galerisi
  - Paylaş butonu

- **`/blog`** - Blog listesi
- **`/blog/[slug]`** - Blog detay

#### Statik Sayfalar
- **`/about`** - Hakkında
- **`/contact`** - İletişim
- **`/privacy`** - Gizlilik politikası
- **`/terms`** - Kullanım şartları

---

### 2. Components (Bileşenler)

#### Post Components
- **`PostCard`** - Gönderi kartı
  - Kullanıcı bilgisi
  - İçerik
  - Resimler
  - Anket
  - Kategori
  - Yorum sayısı
  - Paylaş butonu
  - Sil butonu (kendi gönderileri için)

- **`FilterDrawer`** - Filtre drawer'ı
  - Kategori seçimi
  - Şehir seçimi
  - Marka seçimi
  - Model seçimi
  - Tümünü temizle

- **`PageHeader`** - Sayfa başlığı
  - Başlık
  - Arama çubuğu
  - Bildirim ikonu (okunmamış sayısı)
  - Filtre butonu (aktif filtre sayısı)
  - Giriş butonu (auth yoksa)

- **`SearchBar`** - Arama çubuğu
- **`SearchResultsInfo`** - Arama sonuç bilgisi
- **`ShareDialog`** - Paylaş dialog'u
  - Linki kopyala
  - Native share (mobilde)

- **`CreatePostDialog`** - Gönderi oluşturma dialog'u
  - Kategori seçimi
  - İçerik yazma
  - Resim yükleme
  - Anket oluşturma (kategori anket ise)

#### Profile Components
- **`ProfileHeader`** - Profil başlığı
  - Avatar
  - İsim
  - Şehir
  - Araç bilgisi

- **`BadgesSection`** - Rozetler bölümü
  - Yorum rozetleri
  - Gönderi rozetleri
  - İlerleme çubukları

- **`ProfileInfoSection`** - Profil bilgileri
  - E-posta
  - Telefon
  - Şehir (düzenlenebilir)
  - Araç bilgisi (düzenlenebilir)

- **`NotificationSettings`** - Bildirim ayarları
  - Tarayıcı bildirim izni
  - İzin durumu

- **`ThemeSelector`** - Tema seçici
  - Light tema
  - Dark tema
  - System tema

- **`LogoutButton`** - Çıkış butonu

#### Diğer Components
- **`PollCard`** - Anket kartı
  - Soru
  - Seçenekler
  - Oy verme
  - Sonuçlar (yüzde)

- **`BadgeDisplay`** - Rozet gösterimi
- **`BadgeProgressBar`** - Rozet ilerleme çubuğu
- **`BottomNav`** - Alt navigasyon (mobil)
- **`LandingHero`** - Landing hero bölümü
- **`LandingStats`** - Platform istatistikleri
- **`LandingTrends`** - Trend gösterimi

---

### 3. Hooks (Custom Hooks)

- **`use-profile`** - Profil yönetimi
  - Profil getirme
  - Şehir güncelleme
  - Araç bilgisi güncelleme

- **`use-badges`** - Rozet yönetimi
  - Rozet verilerini getirme

- **`use-notifications`** - Bildirim yönetimi
  - Bildirim izni kontrolü
  - İzin isteme

- **`use-locations`** - Lokasyon yönetimi
  - Şehir listesi
  - Marka listesi
  - Model listesi (marka bazlı)

- **`use-search`** - Arama yönetimi
  - Debounced arama
  - Arama temizleme

---

### 4. Features (Özellikler)

#### Gönderi Özellikleri
- ✅ 7 kategori desteği
- ✅ Çoklu resim yükleme
- ✅ Anket oluşturma
- ✅ Gönderi silme
- ✅ Paylaşma (link kopyalama, native share)
- ✅ Infinite scroll
- ✅ Filtreleme (kategori, şehir, marka, model)
- ✅ Arama (içerik, kullanıcı, lokasyon)
- ✅ URL bazlı filtreleme (shareable links)
- ✅ Trend gösterimi

#### Yorum Özellikleri
- ✅ Yorum ekleme
- ✅ Yorumlara cevap verme (nested)
- ✅ Yorum silme
- ✅ Yorum sayısı gösterimi

#### Anket Özellikleri
- ✅ Anket oluşturma
- ✅ Oy verme
- ✅ Sonuç görüntüleme (yüzde, toplam oy)
- ✅ Kullanıcı oy durumu takibi

#### Filtreleme ve Arama
- ✅ Kategori filtreleme
- ✅ Şehir filtreleme (81 il)
- ✅ Marka filtreleme
- ✅ Model filtreleme (marka bazlı)
- ✅ Metin araması (debounced)
- ✅ URL parametreleri ile paylaşılabilir filtreler
- ✅ Aktif filtre sayısı gösterimi

#### Bildirimler
- ✅ Anlık bildirimler (SSE)
- ✅ Bildirim listesi
- ✅ Okundu/okunmadı durumu
- ✅ Okunmamış bildirim sayısı
- ✅ Tarayıcı bildirim izni yönetimi
- ✅ Bildirim okundu işaretleme

#### Profil Özellikleri
- ✅ Profil görüntüleme
- ✅ Şehir düzenleme
- ✅ Araç bilgisi düzenleme (marka/model)
- ✅ Rozet görüntüleme
- ✅ Rozet ilerleme takibi
- ✅ Tema seçimi (light/dark/system)
- ✅ Bildirim ayarları

#### Rozet Sistemi
- ✅ Otomatik rozet kazanma
- ✅ Yorum rozetleri (5 seviye)
- ✅ Gönderi rozetleri (5 seviye)
- ✅ Rozet gösterimi (emoji + renk)
- ✅ Sonraki rozet ilerleme çubuğu

#### UI/UX Özellikleri
- ✅ Dark/Light/System tema
- ✅ Responsive tasarım
- ✅ Mobile-first yaklaşım
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications (Sonner)
- ✅ Drawer/Dialog components
- ✅ Bottom navigation (mobil)
- ✅ Infinite scroll
- ✅ Image gallery
- ✅ Poll visualization

#### SEO ve Performans
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Meta tags
- ✅ Open Graph tags
- ✅ Structured data (JSON-LD)
- ✅ Server-side rendering (SSR)
- ✅ Image optimization

---

### 5. Utilities (Yardımcı Fonksiyonlar)

- **`post-actions.ts`**
  - `getShareData()` - Paylaşma verilerini hazırlama
  - `handleDeletePost()` - Gönderi silme

- **`posts.ts`**
  - `formatDate()` - Tarih formatlama (relative time)
  - `copyToClipboard()` - Panoya kopyalama

---

### 6. Types (TypeScript Tipleri)

- **`posts.ts`**
  - `Post`, `Comment`, `Profile`, `Location`
  - `City`, `Brand`, `Model`
  - `TrendingBrand`, `TrendingCity`, `TrendingCategory`
  - `Poll`, `PollOption`

- **`profile.ts`**
  - `Profile`, `Badge`, `BadgeProgress`, `BadgeData`
  - `City`, `Brand`, `Model`

---

### 7. Constants (Sabitler)

- **`posts.ts`**
  - `CATEGORY_LABELS` - Kategori etiketleri
  - `CATEGORIES` - Kategori listesi
  - `BADGE_INFO` - Rozet bilgileri

---

## 🛠️ Teknik Özellikler

### Backend
- **Framework:** Node.js + Express
- **Veritabanı:** PostgreSQL
- **Authentication:** JWT
- **File Upload:** Cloudinary
- **Rate Limiting:** Express Rate Limit
- **CORS:** Enabled
- **Error Handling:** Custom error handler
- **Logging:** Morgan
- **Real-time:** SSE (Server-Sent Events)

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React 18+
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Notifications:** Sonner
- **State Management:** React Hooks
- **Rendering:** Server Components + Client Components

---

## 📊 Özet İstatistikler

- **Toplam Backend Modül:** 10
- **Toplam Frontend Sayfa:** 15+
- **Toplam Component:** 25+
- **Toplam Hook:** 5
- **Veritabanı Tablosu:** 11
- **API Endpoint:** 30+
- **Kategori Sayısı:** 7
- **Rozet Seviyesi:** 5 (her tip için)
- **Şehir Sayısı:** 81 (Türkiye)

---

## 🚀 Gelecek Özellikler (Planlanan)

### Yüksek Öncelik
1. ✅ Favorilere ekleme sistemi
2. ✅ Beğeni/reaksiyon sistemi
3. ✅ Servis değerlendirme sistemi
4. ✅ @mention sistemi
5. ✅ Kullanıcı takip sistemi

### Orta Öncelik
6. Yedek parça alım-satım sistemi
7. Uzman onay sistemi
8. Yakıt fiyatları
9. Video paylaşımı
10. Araç buluşmaları/etkinlikler

---

## 📝 Garaj Notları (Kişisel Araç Bakım Defteri)

### Özellikler
- ✅ Bakım kayıtları (servis, bakım, yedek parça, lastik, sigorta, vergiler, diğer)
- ✅ KM takibi
- ✅ Harcama takibi
- ✅ Servis yeri/kişi bilgisi
- ✅ Fotoğraf ekleme desteği
- ✅ İstatistikler (toplam harcama, son bakım, kategori bazlı harcamalar)
- ✅ Infinite scroll
- ✅ CRUD işlemleri (oluştur, oku, güncelle, sil)

### Backend
- **Tablo:** `garage_notes`
- **Service:** `GarageNoteService`
- **Controller:** `GarageNoteController`
- **Routes:** `/api/garage-notes`

### Frontend
- **Sayfa:** `/garage-notes`
- **Components:** `GarageNoteCard`, `GarageNoteDialog`
- **Hook:** `useGarageNotes`, `useGarageNotesStats`
- **Types:** `garage-notes.ts`

### Gelecek Özellikler (Garaj Notları)
- 📊 Detaylı istatistikler ve grafikler
- 🔔 Bakım hatırlatıcıları (KM veya tarih bazlı)
- 📸 Fotoğraf yükleme ve galeri
- 📅 Takvim görünümü
- 📈 KM bazlı harcama analizi

---

**Son Güncelleme:** 2024
**Versiyon:** 1.1
