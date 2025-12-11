interface NotificationSettingsProps {
  notificationPermission: NotificationPermission | null;
  requestingPermission: boolean;
  onRequestPermission: () => void;
}

export default function NotificationSettings({
  notificationPermission,
  requestingPermission,
  onRequestPermission,
}: NotificationSettingsProps) {
  const isIOS = typeof window !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof window !== "undefined" && /Android/i.test(navigator.userAgent);
  const hasNotificationAPI = typeof window !== "undefined" && "Notification" in window;
  const hasServiceWorker = typeof window !== "undefined" && "serviceWorker" in navigator;
  
  // iOS'ta bildirimler için Service Worker gerekli (iOS 16.4+)
  // Android'de genellikle Notification API yeterlidir
  const isSupported = hasNotificationAPI && (!isIOS || hasServiceWorker);

  return (
    <div className="mb-8">
      <p className="text-xs text-muted-foreground mb-3">Bildirimler</p>
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-sm font-medium">Tarayıcı Bildirimleri</span>
          </div>
          {notificationPermission === "granted" && (
            <span className="text-xs text-green-600 font-medium">✓ Aktif</span>
          )}
          {notificationPermission === "denied" && (
            <span className="text-xs text-red-600 font-medium">✗ Reddedildi</span>
          )}
          {!isSupported && (
            <span className="text-xs text-muted-foreground font-medium">Desteklenmiyor</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {!isSupported
            ? isIOS
              ? "iOS'ta bildirimler iOS 16.4+ ve PWA (Ana Ekrana Ekle) gerektirir. Safari'de paylaş butonuna tıklayıp 'Ana Ekrana Ekle' seçeneğini kullanın. iOS Chrome, Safari'nin WebKit motorunu kullandığı için aynı kısıtlamalar geçerlidir."
              : isAndroid
                ? "Android tarayıcınız bildirimleri desteklemiyor. Chrome veya Firefox gibi modern bir tarayıcı kullanmanız önerilir. Android'de genellikle bildirimler sorunsuz çalışır."
                : "Tarayıcınız bildirimleri desteklemiyor. Lütfen modern bir tarayıcı kullanın."
            : notificationPermission === "granted"
              ? "Bildirim izni verildi. Yeni bildirimler tarayıcınızdan gösterilecek."
              : notificationPermission === "denied"
                ? "Bildirim izni reddedilmiş. Tarayıcı ayarlarından manuel olarak açabilirsiniz."
                : "Yeni bildirimler için tarayıcı bildirim izni verin."}
        </p>
        {isSupported && notificationPermission !== "granted" && (
          <button
            onClick={onRequestPermission}
            disabled={requestingPermission || notificationPermission === "denied"}
            className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              notificationPermission === "denied"
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {requestingPermission
              ? "İzin isteniyor..."
              : notificationPermission === "denied"
                ? "İzin Reddedildi (Ayarlardan Açın)"
                : "Bildirim İzni Ver"}
          </button>
        )}
      </div>
    </div>
  );
}
