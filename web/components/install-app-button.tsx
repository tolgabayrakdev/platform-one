"use client";

import { useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { motion, AnimatePresence } from "motion/react";

interface InstallAppButtonProps {
  variant?: "button" | "link";
}

export default function InstallAppButton({ variant = "button" }: InstallAppButtonProps) {
  const { isInstallable, isIOS, isStandalone, install } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // PWA zaten yüklüyse butonu gösterme
  if (isStandalone || !isInstallable) {
    return null;
  }

  const handleClick = async () => {
    if (isIOS) {
      // iOS için talimatları göster
      setShowIOSInstructions(true);
    } else {
      // Android/Chrome için yükleme başlat
      await install();
    }
  };

  // Link variant için kompakt görünüm
  if (variant === "link") {
    return (
      <>
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>Uygulamayı yükle</span>
        </button>

      {/* iOS Talimatları Dialog */}
      <AnimatePresence>
        {showIOSInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-background border border-border rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 mt-1">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-3">
                    Uygulamayı Ana Ekrana Ekleyin
                  </h3>
                  <div className="space-y-3 text-sm md:text-base text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <p>Safari menüsünden paylaş butonuna (⬆️) tıklayın</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <p>"Ana Ekrana Ekle" seçeneğini seçin</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <p>"Ekle" butonuna tıklayın</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Anladım
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
    );
  }

  // Button variant için büyük buton görünümü
  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-primary text-primary-foreground rounded-lg text-sm md:text-base font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-md"
      >
        <Download className="w-4 h-4 md:w-5 md:h-5" />
        <span>Uygulamayı Yükle</span>
      </button>

      {/* iOS Talimatları Dialog */}
      <AnimatePresence>
        {showIOSInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-background border border-border rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Kapat"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 mt-1">
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-3">
                    Uygulamayı Ana Ekrana Ekleyin
                  </h3>
                  <div className="space-y-3 text-sm md:text-base text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <p>Safari menüsünden paylaş butonuna (⬆️) tıklayın</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <p>"Ana Ekrana Ekle" seçeneğini seçin</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <p>"Ekle" butonuna tıklayın</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Anladım
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
