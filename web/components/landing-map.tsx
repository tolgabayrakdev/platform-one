"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

// Harita component'ini dinamik olarak yükle (client-side only)
const TurkeySvgMap = dynamic(() => import("@/components/map/turkey-svg-map").then(mod => ({ default: mod.TurkeySvgMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted/30 rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Harita yükleniyor...</span>
      </div>
    </div>
  ),
});

interface CityStats {
  id: number;
  name: string;
  post_count: number;
}

interface LandingMapProps {
  cityStats: CityStats[];
}

export default function LandingMap({ cityStats }: LandingMapProps) {
  const handleCityClick = () => {
    // Landing sayfasında tıklama yapıldığında /map sayfasına yönlendir
    window.location.href = "/map";
  };

  // cityStats'ın array olduğundan emin ol
  const safeCityStats = Array.isArray(cityStats) ? cityStats : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-1 h-6 md:h-8 bg-primary rounded-full"></div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            İçerik Yoğunluğu Haritası
          </h2>
        </div>
        <Link
          href="/map"
          className="flex items-center gap-1 md:gap-2 text-sm md:text-base font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <span className="hidden sm:inline">Detaylı Görüntüle</span>
          <span className="sm:hidden">Detay</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-border/50">
        <div className="h-[300px] sm:h-[400px] md:h-[500px] relative z-0">
          <TurkeySvgMap
            cityStats={safeCityStats}
            onCityClick={handleCityClick}
            selectedCityId={null}
            isSheetOpen={false}
          />
        </div>
        
        {/* Overlay gradient - alt kısımda */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none z-10" />
        
        {/* Açıklama */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-20">
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Türkiye'nin 81 ilindeki gönderi yoğunluğunu görüntüleyin. Bir şehre tıklayarak o şehirdeki son gönderileri keşfedin.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

