"use client";

import { useEffect, useState } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AddToHomeScreen() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // PWA zaten yüklü mü kontrol et
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }

    // iOS kontrolü
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // beforeinstallprompt event'i dinle (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Daha önce gösterilmiş mi kontrol et
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      
      if (!dismissed || dismissedTime < oneDayAgo) {
        // 3 saniye sonra göster (kullanıcı sayfayı görsün)
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    // iOS için kontrol - Safari'de manuel yükleme gerekli
    if (iOS) {
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      
      if (!dismissed || dismissedTime < oneDayAgo) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome için
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      // iOS için talimatları göster
      setShowPrompt(false);
      // iOS için özel bir dialog gösterebiliriz
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // PWA zaten yüklüyse veya prompt gösterilmemeliyse hiçbir şey gösterme
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
        >
          <div className="bg-background border border-border rounded-lg shadow-lg p-4 md:p-5 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Kapat"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="flex-shrink-0 mt-1">
                {isIOS ? (
                  <Smartphone className="w-6 h-6 text-primary" />
                ) : (
                  <Download className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base mb-1">
                  Uygulamayı Ana Ekrana Ekleyin
                </h3>
                {isIOS ? (
                  <>
                    <div className="text-xs md:text-sm text-muted-foreground space-y-1 mb-3">
                      <p>1. Safari menüsünden paylaş butonuna (⬆️) tıklayın</p>
                      <p>2. "Ana Ekrana Ekle" seçeneğini seçin</p>
                    </div>
                    <button
                      onClick={handleDismiss}
                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Anladım
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs md:text-sm text-muted-foreground mb-3">
                      Daha hızlı erişim için uygulamayı ana ekranınıza ekleyin
                    </p>
                    <button
                      onClick={handleInstallClick}
                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Ana Ekrana Ekle
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
