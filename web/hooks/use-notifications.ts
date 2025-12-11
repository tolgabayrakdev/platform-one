import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useNotifications() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [requestingPermission, setRequestingPermission] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  function checkNotificationPermission() {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    } else {
      // Mobil tarayıcılarda Notification API mevcut olmayabilir
      setNotificationPermission(null);
    }
  }

  function isIOS(): boolean {
    if (typeof window === "undefined") return false;
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function isAndroid(): boolean {
    if (typeof window === "undefined") return false;
    return /Android/i.test(navigator.userAgent);
  }

  function isNotificationSupported(): boolean {
    if (typeof window === "undefined") return false;
    
    // Notification API kontrolü
    if (!("Notification" in window)) return false;
    
    // iOS'ta bildirimler iOS 16.4+ ve Service Worker gerektirir
    // iOS Chrome aslında Safari WebKit kullanır, bu yüzden aynı kısıtlamalar geçerlidir
    if (isIOS()) {
      // iOS 16.4+ kontrolü (Service Worker desteği ile birlikte)
      if (!("serviceWorker" in navigator)) {
        return false;
      }
    }
    
    // Android'de genellikle Notification API yeterlidir
    // Chrome, Firefox ve diğer modern tarayıcılar destekler
    // Eski veya özel tarayıcılar desteklemeyebilir ama bu durumda
    // Notification API zaten mevcut olmayacaktır
    
    return true;
  }

  async function requestNotificationPermission() {
    if (!isNotificationSupported()) {
      // iOS için özel mesaj
      if (isIOS()) {
        toast.error("iOS'ta bildirimler iOS 16.4+ ve PWA (Ana Ekrana Ekle) gerektirir. Lütfen Safari'de sayfayı ana ekrana ekleyin.");
      } else if (isAndroid()) {
        // Android'de genellikle Chrome/Firefox destekler
        // Eğer desteklenmiyorsa muhtemelen eski veya özel bir tarayıcı
        toast.error("Tarayıcınız bildirimleri desteklemiyor. Chrome veya Firefox kullanmanız önerilir.");
      } else {
        toast.error("Tarayıcınız bildirimleri desteklemiyor");
      }
      return;
    }

    if (Notification.permission === "granted") {
      toast.success("Bildirim izni zaten verilmiş");
      return;
    }

    setRequestingPermission(true);

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        toast.success("Bildirim izni verildi! Artık bildirimler alacaksınız.");

        // Test bildirimi göster
        if (navigator.serviceWorker) {
          new Notification("Bildirimler Aktif", {
            body: "Artık yeni bildirimler alacaksınız!",
            icon: "/favicon.ico",
            badge: "/favicon.ico",
          });
        }
      } else if (permission === "denied") {
        toast.error("Bildirim izni reddedildi. Ayarlardan manuel olarak açabilirsiniz.");
      } else {
        toast.info("Bildirim izni verilmedi");
      }
    } catch (error) {
      toast.error("Bildirim izni alınamadı");
      console.error("Notification permission error:", error);
    } finally {
      setRequestingPermission(false);
    }
  }

  return {
    notificationPermission,
    requestingPermission,
    requestNotificationPermission,
  };
}
