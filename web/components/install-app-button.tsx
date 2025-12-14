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
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary hover:text-primary/80 hover:underline transition-colors touch-manipulation"
        >
          <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span className="whitespace-nowrap">Uygulamayı yükle</span>
        </button>

      {/* iOS Talimatları Dialog */}
      <AnimatePresence>
        {showIOSInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-background border border-border rounded-xl sm:rounded-lg shadow-xl p-4 sm:p-5 md:p-6 lg:p-8 max-w-[calc(100vw-1rem)] sm:max-w-md w-full relative max-h-[95vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 md:top-4 md:right-4 p-2 sm:p-1.5 md:p-1 rounded-full hover:bg-muted active:bg-muted transition-colors touch-manipulation"
                aria-label="Kapat"
              >
                <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-muted-foreground" />
              </button>

              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6 pr-8 sm:pr-6">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-center sm:text-left">
                    Uygulamayı Ana Ekrana Ekleyin
                  </h3>
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-start gap-2.5 sm:gap-3 bg-muted/30 rounded-lg p-2.5 sm:p-3">
                      <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold">
                        1
                      </span>
                      <p className="text-xs sm:text-sm md:text-base text-foreground leading-relaxed pt-0.5">
                        Safari menüsünden <span className="font-semibold">paylaş butonuna</span> (⬆️) tıklayın
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 sm:gap-3 bg-muted/30 rounded-lg p-2.5 sm:p-3">
                      <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold">
                        2
                      </span>
                      <p className="text-xs sm:text-sm md:text-base text-foreground leading-relaxed pt-0.5">
                        <span className="font-semibold">"Ana Ekrana Ekle"</span> seçeneğini seçin
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 sm:gap-3 bg-muted/30 rounded-lg p-2.5 sm:p-3">
                      <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold">
                        3
                      </span>
                      <p className="text-xs sm:text-sm md:text-base text-foreground leading-relaxed pt-0.5">
                        <span className="font-semibold">"Ekle"</span> butonuna tıklayın
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full px-4 py-3 sm:py-2.5 bg-primary text-primary-foreground rounded-lg sm:rounded-md text-sm sm:text-base font-semibold hover:bg-primary/90 active:bg-primary/80 transition-colors touch-manipulation shadow-sm"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-background border border-border rounded-xl sm:rounded-lg shadow-xl p-4 sm:p-5 md:p-6 lg:p-8 max-w-[calc(100vw-1rem)] sm:max-w-md w-full relative max-h-[95vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 md:top-4 md:right-4 p-2 sm:p-1.5 md:p-1 rounded-full hover:bg-muted active:bg-muted transition-colors touch-manipulation"
                aria-label="Kapat"
              >
                <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-muted-foreground" />
              </button>

              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6 pr-8 sm:pr-6">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-center sm:text-left">
                    Uygulamayı Ana Ekrana Ekleyin
                  </h3>
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-start gap-2.5 sm:gap-3 bg-muted/30 rounded-lg p-2.5 sm:p-3">
                      <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold">
                        1
                      </span>
                      <p className="text-xs sm:text-sm md:text-base text-foreground leading-relaxed pt-0.5">
                        Safari menüsünden <span className="font-semibold">paylaş butonuna</span> (⬆️) tıklayın
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 sm:gap-3 bg-muted/30 rounded-lg p-2.5 sm:p-3">
                      <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold">
                        2
                      </span>
                      <p className="text-xs sm:text-sm md:text-base text-foreground leading-relaxed pt-0.5">
                        <span className="font-semibold">"Ana Ekrana Ekle"</span> seçeneğini seçin
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 sm:gap-3 bg-muted/30 rounded-lg p-2.5 sm:p-3">
                      <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs sm:text-sm font-bold">
                        3
                      </span>
                      <p className="text-xs sm:text-sm md:text-base text-foreground leading-relaxed pt-0.5">
                        <span className="font-semibold">"Ekle"</span> butonuna tıklayın
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full px-4 py-3 sm:py-2.5 bg-primary text-primary-foreground rounded-lg sm:rounded-md text-sm sm:text-base font-semibold hover:bg-primary/90 active:bg-primary/80 transition-colors touch-manipulation shadow-sm"
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
