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
    }
  }

  async function requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Tarayıcınız bildirimleri desteklemiyor");
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
