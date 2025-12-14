# PWA (Progressive Web App) Uygulama Dokümantasyonu

Bu dokümantasyon, Garaj Muhabbet web uygulamasına eklenen PWA (Progressive Web App) özelliklerini ve "Ana Ekrana Ekle" fonksiyonelliğini açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Eklenen Dosyalar](#eklenen-dosyalar)
3. [Yapılandırma](#yapılandırma)
4. [Bileşenler](#bileşenler)
5. [Kullanım](#kullanım)
6. [Özellikler](#özellikler)
7. [Platform Desteği](#platform-desteği)

---

## 🎯 Genel Bakış

Uygulama, kullanıcıların web uygulamasını mobil cihazlarının ana ekranına eklemesine olanak tanıyan PWA özellikleri ile donatılmıştır. Bu özellik şu sayfalarda mevcuttur:

- **Landing Sayfası** (`/`)
- **Giriş Yap Sayfası** (`/sign-in`)
- **Kayıt Ol Sayfası** (`/sign-up`)

---

## 📁 Eklenen Dosyalar

### 1. Manifest Dosyası
**Dosya:** `/web/public/manifest.json`

PWA manifest dosyası, uygulamanın meta bilgilerini, icon'larını ve yükleme ayarlarını içerir.

**Özellikler:**
- Uygulama adı ve kısa adı
- Açıklama
- Başlangıç URL'i
- Görüntüleme modu (standalone)
- Tema renkleri
- Icon tanımlamaları

### 2. PWA Install Hook
**Dosya:** `/web/hooks/use-pwa-install.ts`

PWA yükleme mantığını yöneten custom React hook'u.

**Fonksiyonlar:**
- `isInstallable`: Uygulamanın yüklenebilir olup olmadığını kontrol eder
- `isIOS`: iOS cihaz kontrolü
- `isStandalone`: PWA'nın zaten yüklü olup olmadığını kontrol eder
- `install()`: Yükleme işlemini başlatır

### 3. Install App Button Bileşeni
**Dosya:** `/web/components/install-app-button.tsx`

Ana yükleme butonu bileşeni. İki farklı görünüm modu destekler:

- **Button Variant**: Büyük, görünür buton (varsayılan)
- **Link Variant**: Kompakt link görünümü

**Özellikler:**
- Android/Chrome: Otomatik yükleme
- iOS/Safari: Adım adım talimat dialog'u
- Responsive tasarım
- Animasyonlu dialog'lar

### 4. Add to Home Screen Bileşeni
**Dosya:** `/web/components/add-to-home-screen.tsx`

Otomatik olarak görünen yükleme uyarısı bileşeni. Kullanıcı sayfaya geldiğinde 3 saniye sonra otomatik olarak gösterilir.

**Özellikler:**
- Otomatik gösterim (3 saniye gecikme ile)
- 24 saatlik "tekrar gösterme" kontrolü
- Kapatılabilir
- Platform bazlı mesajlaşma

---

## ⚙️ Yapılandırma

### Root Layout Güncellemesi
**Dosya:** `/web/app/layout.tsx`

Root layout'a PWA manifest linki ve Apple Web App meta tag'leri eklendi:

```typescript
export const metadata: Metadata = {
  // ... diğer metadata
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Garaj Muhabbet",
  },
};
```

### Sayfa Güncellemeleri

#### Landing Sayfası
**Dosya:** `/web/app/page.tsx`

- Header'a `InstallAppButton` (link variant) eklendi
- Sayfa altına `AddToHomeScreen` bileşeni eklendi

#### Sign-in Sayfası
**Dosya:** `/web/app/sign-in/page.tsx`

- Formun üstüne `InstallAppButton` (link variant) eklendi
- Sayfa altına `AddToHomeScreen` bileşeni eklendi

#### Sign-up Sayfası
**Dosya:** `/web/app/sign-up/page.tsx`

- Formun üstüne `InstallAppButton` (link variant) eklendi
- Sayfa altına `AddToHomeScreen` bileşeni eklendi

---

## 🧩 Bileşenler

### InstallAppButton

**Kullanım:**
```tsx
import InstallAppButton from "@/components/install-app-button";

// Button variant (varsayılan)
<InstallAppButton />

// Link variant (kompakt)
<InstallAppButton variant="link" />
```

**Props:**
- `variant?: "button" | "link"` - Görünüm tipi (varsayılan: "button")

**Davranış:**
- PWA zaten yüklüyse görünmez
- Android/Chrome: Tıklayınca direkt yükleme başlar
- iOS: Tıklayınca talimat dialog'u açılır

### AddToHomeScreen

**Kullanım:**
```tsx
import AddToHomeScreen from "@/components/add-to-home-screen";

<AddToHomeScreen />
```

**Davranış:**
- Sayfa yüklendikten 3 saniye sonra otomatik gösterilir
- Kullanıcı reddederse 24 saat boyunca tekrar gösterilmez
- PWA zaten yüklüyse gösterilmez
- Kapatılabilir (X butonu)

### usePWAInstall Hook

**Kullanım:**
```tsx
import { usePWAInstall } from "@/hooks/use-pwa-install";

function MyComponent() {
  const { isInstallable, isIOS, isStandalone, install } = usePWAInstall();
  
  // ...
}
```

**Dönen Değerler:**
- `isInstallable: boolean` - Yüklenebilir mi?
- `isIOS: boolean` - iOS cihaz mı?
- `isStandalone: boolean` - Zaten yüklü mü?
- `install(): Promise<boolean>` - Yükleme fonksiyonu

---

## 📱 Kullanım

### Landing Sayfası

Header'da sağ üstte, "Giriş Yap" butonunun yanında kompakt link olarak görünür.

### Sign-in / Sign-up Sayfaları

Formun hemen üstünde, başlık ve açıklamanın altında, ortalanmış kompakt link olarak görünür.

### Otomatik Uyarı

Tüm sayfalarda, kullanıcı sayfaya geldiğinde 3 saniye sonra otomatik olarak bir uyarı gösterilir (eğer daha önce reddedilmemişse).

---

## ✨ Özellikler

### Platform Desteği

#### Android / Chrome
- ✅ Otomatik yükleme butonu
- ✅ Tek tıkla yükleme
- ✅ Native yükleme dialog'u

#### iOS / Safari
- ✅ Manuel yükleme talimatları
- ✅ Adım adım rehberlik
- ✅ Görsel talimat dialog'u

### Kullanıcı Deneyimi

1. **Akıllı Gösterim**
   - PWA zaten yüklüyse butonlar görünmez
   - Kullanıcı reddederse 24 saat boyunca tekrar gösterilmez
   - Otomatik uyarı 3 saniye gecikme ile gösterilir

2. **Responsive Tasarım**
   - Mobil ve masaüstü uyumlu
   - Kompakt link görünümü
   - Büyük buton görünümü

3. **Animasyonlar**
   - Smooth geçişler
   - Dialog animasyonları
   - Hover efektleri

---

## 🔧 Teknik Detaylar

### Manifest.json Yapılandırması

```json
{
  "name": "Garaj Muhabbet - Araç Sahipleri Topluluğu",
  "short_name": "Garaj Muhabbet",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "icons": [...]
}
```

### Service Worker

Şu anda service worker kullanılmıyor, ancak gelecekte eklenebilir. Manifest dosyası ve yükleme özellikleri çalışmak için service worker gerektirmez.

### Browser API'leri

- `beforeinstallprompt` event (Android/Chrome)
- `window.matchMedia("(display-mode: standalone)")` (Yükleme kontrolü)
- `localStorage` (Kullanıcı tercihleri)

---

## 📊 Platform Desteği

| Platform | Yükleme | Otomatik Uyarı | Talimatlar |
|----------|---------|----------------|------------|
| Android Chrome | ✅ | ✅ | ❌ |
| iOS Safari | ❌ | ✅ | ✅ |
| Desktop Chrome | ✅ | ✅ | ❌ |
| Desktop Safari | ❌ | ✅ | ✅ |
| Edge | ✅ | ✅ | ❌ |
| Firefox | ⚠️ | ⚠️ | ❌ |

**Açıklamalar:**
- ✅ Tam destek
- ⚠️ Kısmi destek
- ❌ Desteklenmiyor

---

## 🚀 Gelecek Geliştirmeler

1. **Service Worker Ekleme**
   - Offline desteği
   - Cache stratejileri
   - Push notification desteği

2. **Gelişmiş Icon Seti**
   - Farklı boyutlarda icon'lar
   - Maskable icon'lar
   - Splash screen görselleri

3. **Analytics Entegrasyonu**
   - Yükleme oranları
   - Platform bazlı istatistikler
   - Kullanıcı davranış analizi

---

## 📝 Notlar

- Manifest dosyası `/public` klasöründe olmalıdır
- Icon dosyaları `/public` klasöründe referans edilir
- Tüm bileşenler client-side rendering gerektirir (`"use client"`)
- iOS'ta manuel yükleme gereklidir (Safari kısıtlamaları)
- Android'de otomatik yükleme Chrome tarayıcısında çalışır

---

## 🐛 Bilinen Sorunlar

1. **iOS Safari**: Otomatik yükleme desteklenmiyor, kullanıcı manuel olarak eklemelidir
2. **Firefox**: PWA desteği sınırlıdır
3. **Desktop**: Bazı tarayıcılarda yükleme özelliği görünmeyebilir

---

## 📞 Destek

Sorularınız veya önerileriniz için lütfen proje yöneticisi ile iletişime geçin.

---

**Son Güncelleme:** 2025-01-11
**Versiyon:** 1.0.0
