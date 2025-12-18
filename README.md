# 🚗 Garaj Muhabbet

**Türkiye'nin 81 ilinden araç sahiplerinin bir araya geldiği topluluk platformu**

Garaj Muhabbet, araç sahiplerinin sorular sorabileceği, deneyimlerini paylaşabileceği, birbirlerine yardımcı olabileceği ve araçlarıyla ilgili her konuda bilgi alışverişi yapabileceği modern bir topluluk platformudur.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack'i](#-teknoloji-stacki)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum](#-kurulum)
- [Çalıştırma](#-çalıştırma)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Veritabanı](#-veritabanı)
- [Katkıda Bulunma](#-katkıda-bulunma)

## ✨ Özellikler

### 🔐 Kimlik Doğrulama ve Kullanıcı Yönetimi
- ✅ Email ve telefon ile kayıt
- ✅ Email doğrulama (token sistemi)
- ✅ SMS ile telefon doğrulama
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Güvenli oturum yönetimi
- ✅ Kullanıcı banlama sistemi

### 📝 Gönderi Sistemi
- ✅ 7 farklı kategori (Soru, Yedek Parça, Servis, Bakım, Deneyim, Yardım, Anket)
- ✅ Çoklu resim yükleme (Cloudinary entegrasyonu)
- ✅ Gönderi oluşturma, düzenleme ve silme
- ✅ Gelişmiş filtreleme (şehir, marka, model, kategori)
- ✅ Metin tabanlı arama
- ✅ Infinite scroll ile sayfalama
- ✅ Trend analizi ve istatistikler
- ✅ Benzer gönderiler önerisi

### 💬 Yorum Sistemi
- ✅ Gönderilere yorum yapma
- ✅ Yorumlara cevap verme (iç içe yorumlar)
- ✅ Yorum silme
- ✅ Hiyerarşik yorum görüntüleme

### 📊 Anket Sistemi
- ✅ Gönderilerle birlikte anket oluşturma
- ✅ Çoklu seçenekli anketler
- ✅ Oy verme (her kullanıcı 1 kere)
- ✅ Anket sonuçlarını görüntüleme (yüzde ve toplam oy)
- ✅ Kullanıcı oy durumu takibi

### 🏆 Rozet Sistemi
- ✅ Otomatik rozet kazanma
- ✅ Yorum rozetleri (5 seviye: Bronz, Gümüş, Altın, Platin, Elmas)
- ✅ Gönderi rozetleri (5 seviye)
- ✅ Rozet ilerleme takibi
- ✅ Profilde rozet görüntüleme

### 🔔 Bildirim Sistemi
- ✅ Anlık bildirimler (Server-Sent Events - SSE)
- ✅ Yorum bildirimleri
- ✅ Okundu/okunmadı durumu takibi
- ✅ Tarayıcı bildirim desteği
- ✅ Okunmamış bildirim sayısı

### 📍 Lokasyon Servisi
- ✅ Türkiye'nin 81 ili
- ✅ İlçe bazlı filtreleme
- ✅ Araç markaları ve modelleri
- ✅ Şehir bazlı gönderi filtreleme

### 🛠️ Garaj Notları (Kişisel Bakım Defteri)
- ✅ Bakım kayıtları (servis, bakım, yedek parça, lastik, sigorta, vergiler)
- ✅ KM takibi
- ✅ Harcama takibi
- ✅ Fotoğraf ekleme
- ✅ İstatistikler ve analizler
- ✅ Kategori bazlı harcama takibi

### 🎨 Kullanıcı Arayüzü
- ✅ Modern ve responsive tasarım
- ✅ Dark/Light/System tema desteği
- ✅ Mobile-first yaklaşım
- ✅ PWA (Progressive Web App) desteği
- ✅ Infinite scroll
- ✅ Gelişmiş filtreleme arayüzü
- ✅ Resim galerisi
- ✅ Anket görselleştirme

### 🔍 SEO ve Performans
- ✅ Server-side rendering (SSR)
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Meta tags ve Open Graph
- ✅ Structured data (JSON-LD)
- ✅ Resim optimizasyonu

## 🛠️ Teknoloji Stack'i

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Veritabanı:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Cloudinary
- **Email:** Nodemailer
- **SMS:** NetGSM
- **Rate Limiting:** Express Rate Limit
- **Logging:** Winston + Morgan
- **Security:** Helmet, CORS

### Frontend
- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui
- **Notifications:** Sonner
- **State Management:** React Hooks
- **Animations:** Motion (Framer Motion)

## 📁 Proje Yapısı

```
platform-one/
├── server/                 # Backend (Node.js + Express)
│   ├── db/                # Veritabanı SQL dosyaları
│   │   ├── database.sql   # Ana veritabanı şeması
│   │   ├── migration-*.sql # Migration dosyaları
│   │   └── seed-*.sql     # Seed dosyaları
│   └── src/
│       ├── app.js         # Ana uygulama dosyası
│       ├── config/        # Yapılandırma dosyaları
│       ├── controller/    # Controller'lar
│       ├── service/       # Business logic
│       ├── routes/        # API route'ları
│       ├── middleware/    # Middleware'ler
│       ├── exceptions/    # Exception sınıfları
│       └── util/          # Yardımcı fonksiyonlar
│
└── web/                   # Frontend (Next.js)
    ├── app/               # Next.js App Router sayfaları
    │   ├── (main)/        # Ana sayfalar (feed, profile, vb.)
    │   ├── api/           # API route'ları
    │   └── ...            # Diğer sayfalar
    ├── components/        # React bileşenleri
    │   ├── ui/            # shadcn/ui bileşenleri
    │   ├── posts/         # Gönderi bileşenleri
    │   ├── profile/       # Profil bileşenleri
    │   └── ...
    ├── hooks/             # Custom React hooks
    ├── lib/               # Yardımcı kütüphaneler
    └── public/            # Statik dosyalar
```

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- PostgreSQL 12+
- npm veya yarn

### 1. Repository'yi Klonlayın

```bash
git clone <repository-url>
cd platform-one
```

### 2. Backend Kurulumu

```bash
cd server
npm install
```

### 3. Frontend Kurulumu

```bash
cd ../web
npm install
```

### 4. Veritabanı Kurulumu

PostgreSQL veritabanınızı oluşturun ve SQL dosyalarını çalıştırın:

```bash
# Veritabanı oluştur
createdb garajmuhabbet

# Ana şemayı yükle
psql garajmuhabbet < server/db/database.sql

# Migration'ları uygula (sırayla)
psql garajmuhabbet < server/db/migration-add-badges.sql
psql garajmuhabbet < server/db/migration-add-garage-notes.sql
psql garajmuhabbet < server/db/migration-add-images.sql
psql garajmuhabbet < server/db/migration-add-is-banned.sql
psql garajmuhabbet < server/db/migration-add-parent-comment-id.sql
psql garajmuhabbet < server/db/migration-add-polls.sql

# Seed verilerini yükle (opsiyonel)
psql garajmuhabbet < server/db/seed-cities.sql
psql garajmuhabbet < server/db/seed-cars.sql
psql garajmuhabbet < server/db/seed.sql
```

### 5. Environment Variables

#### Backend (.env)

`server/` dizininde `.env` dosyası oluşturun:

```env
# Server
PORT=1234
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=garajmuhabbet
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS (NetGSM)
NETGSM_USERNAME=your_username
NETGSM_PASSWORD=your_password
NETGSM_MSGHEADER=your_header
```

#### Frontend (.env.local)

`web/` dizininde `.env.local` dosyası oluşturun:

```env
# Backend API URL
BACKEND_URL=http://localhost:1234

# Public URL
NEXT_PUBLIC_URL=http://localhost:3000
```

## ▶️ Çalıştırma

### Development Modu

#### Backend'i Başlatın

```bash
cd server
npm run dev
```

Backend `http://localhost:1234` adresinde çalışacaktır.

#### Frontend'i Başlatın

Yeni bir terminal penceresinde:

```bash
cd web
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışacaktır.

### Production Modu

#### Backend

```bash
cd server
npm start
```

#### Frontend

```bash
cd web
npm run build
npm start
```

## 📚 API Dokümantasyonu

### Authentication Endpoints

- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/verify-email` - Email doğrulama
- `POST /api/auth/verify-phone` - Telefon doğrulama
- `POST /api/auth/resend-email-code` - Email kodu yeniden gönder
- `POST /api/auth/resend-phone-code` - Telefon kodu yeniden gönder
- `POST /api/auth/login` - Giriş yap
- `GET /api/auth/me` - Kullanıcı bilgisi
- `POST /api/auth/logout` - Çıkış yap

### Post Endpoints

- `GET /api/posts` - Gönderileri listele (filtreli)
- `GET /api/posts/my` - Kendi gönderilerim
- `GET /api/posts/trends` - Trend verileri
- `GET /api/posts/stats` - Platform istatistikleri
- `POST /api/posts` - Gönderi oluştur
- `GET /api/posts/:id` - Gönderi detayı
- `GET /api/posts/:id/related` - Benzer gönderiler
- `DELETE /api/posts/:id` - Gönderi sil

### Comment Endpoints

- `POST /api/posts/:postId/comments` - Yorum ekle
- `GET /api/posts/:postId/comments` - Yorumları listele
- `DELETE /api/comments/:id` - Yorum sil

### Poll Endpoints

- `POST /api/polls/:postId/vote` - Oy ver
- `GET /api/polls/:postId` - Anket detayı

### Badge Endpoints

- `GET /api/users/badges` - Kendi rozetlerim
- `GET /api/users/:userId/badges` - Kullanıcı rozetleri

### Notification Endpoints

- `GET /api/notifications` - Bildirimleri listele
- `GET /api/notifications/stream` - SSE stream (anlık bildirimler)
- `GET /api/notifications/unread-count` - Okunmamış sayısı
- `PUT /api/notifications/:id/read` - Okundu işaretle
- `PUT /api/notifications/read-all` - Tümünü okundu işaretle

### Location Endpoints

- `GET /api/locations/cities` - Şehirleri listele
- `GET /api/locations/districts/:cityId` - İlçeleri listele
- `GET /api/locations/brands` - Markaları listele
- `GET /api/locations/models/:brandId` - Modelleri listele

### Upload Endpoints

- `POST /api/upload/images` - Resim yükle

### Garage Notes Endpoints

- `GET /api/garage-notes` - Garaj notlarını listele
- `POST /api/garage-notes` - Garaj notu oluştur
- `PUT /api/garage-notes/:id` - Garaj notu güncelle
- `DELETE /api/garage-notes/:id` - Garaj notu sil
- `GET /api/garage-notes/stats` - Garaj notu istatistikleri

## 🗄️ Veritabanı

### Ana Tablolar

- `users` - Kullanıcılar
- `cities` - Şehirler (81 il)
- `brands` - Araç markaları
- `models` - Araç modelleri
- `posts` - Gönderiler
- `comments` - Yorumlar
- `notifications` - Bildirimler
- `user_badges` - Kullanıcı rozetleri
- `polls` - Anketler
- `poll_options` - Anket seçenekleri
- `poll_votes` - Anket oyları
- `garage_notes` - Garaj notları

### Migration Dosyaları

Veritabanı şeması migration dosyaları ile yönetilmektedir. Yeni özellikler için migration dosyaları oluşturulmalıdır.

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Kod Standartları

- Backend için ESLint kullanılmaktadır
- Prettier ile kod formatlama yapılmaktadır
- TypeScript strict mode aktif
- Commit mesajları açıklayıcı olmalıdır

## 📄 Lisans

Bu proje özel bir projedir. Tüm hakları saklıdır.

## 📞 İletişim

Sorularınız veya önerileriniz için:
- Website: [garajmuhabbet.com](https://garajmuhabbet.com)
- Email: [iletişim sayfasından](https://garajmuhabbet.com/contact)

---

**Garaj Muhabbet** - Türkiye'nin araç sahipleri topluluğu 🚗💬
