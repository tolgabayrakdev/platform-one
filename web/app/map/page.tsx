"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Car, MessageCircle, Clock, Loader2, ExternalLink } from "lucide-react";
import { useMapData, useCityPosts } from "@/hooks/use-map-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { TurkeySvgMap } from "@/components/map/turkey-svg-map";

// Kategori renkleri
const CATEGORY_COLORS: Record<string, string> = {
  soru: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  yedek_parca: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  servis: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  bakim: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  deneyim: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  yardim: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  anket: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
};

const CATEGORY_LABELS: Record<string, string> = {
  soru: "Soru",
  yedek_parca: "Yedek Parça",
  servis: "Servis",
  bakim: "Bakım",
  deneyim: "Deneyim",
  yardim: "Yardım",
  anket: "Anket",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MapPage() {
  const { cityStats, loading, error } = useMapData();
  const [selectedCity, setSelectedCity] = useState<{ id: number; name: string } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { posts, loading: postsLoading } = useCityPosts(selectedCity?.id ?? null);

  const handleCityClick = (cityId: number, cityName: string) => {
    setSelectedCity({ id: cityId, name: cityName });
    setSheetOpen(true);
  };

  const handleSheetClose = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      setTimeout(() => setSelectedCity(null), 300);
    }
  };

  const totalPosts = cityStats.reduce((sum, city) => sum + city.post_count, 0);
  const citiesWithPosts = cityStats.filter((c) => c.post_count > 0).length;
  const avgPostsPerCity = totalPosts > 0 ? Math.round(totalPosts / Math.max(citiesWithPosts, 1)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Harita yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
        </motion.div>
      </div>
    );
  }

  const topCities = cityStats
    .filter((c) => c.post_count > 0)
    .sort((a, b) => b.post_count - a.post_count)
    .slice(0, 10);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Kompakt Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm z-40">
        <div className="px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <h1 className="text-base sm:text-lg font-bold text-foreground">İçerik Yoğunluğu Haritası</h1>
            </div>
            
            {/* İstatistikler - Yazı olarak */}
            <div className="hidden sm:flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
              <span><strong className="text-foreground">{totalPosts}</strong> gönderi</span>
              <span>•</span>
              <span><strong className="text-foreground">{citiesWithPosts}</strong> aktif şehir</span>
              <span>•</span>
              <span><strong className="text-foreground">81</strong> il</span>
              <span>•</span>
              <span>Ort: <strong className="text-foreground">{avgPostsPerCity}</strong></span>
            </div>
          </div>
          
          {/* Mobil İstatistikler */}
          <div className="sm:hidden flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{totalPosts}</strong> gönderi</span>
            <span>•</span>
            <span><strong className="text-foreground">{citiesWithPosts}</strong> şehir</span>
            <span>•</span>
            <span>Ort: <strong className="text-foreground">{avgPostsPerCity}</strong></span>
          </div>
        </div>
      </header>

      {/* En Aktif Şehirler - Kompakt */}
      {topCities.length > 0 && (
        <div className="border-b border-border bg-muted/30 px-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">🏆 En Aktif:</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {topCities.slice(0, 8).map((city, index) => (
                <button
                  key={city.id}
                  onClick={() => handleCityClick(city.id, city.name)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-background hover:bg-muted border border-border transition-colors text-left group whitespace-nowrap"
                >
                  <span className={`text-[10px] sm:text-xs font-bold ${
                    index === 0 ? "text-amber-500" :
                    index === 1 ? "text-gray-400" :
                    index === 2 ? "text-amber-700" :
                    "text-muted-foreground"
                  }`}>
                    {index + 1}.
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                    {city.name}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    ({city.post_count})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Harita - Tam Sayfa */}
      <div className="flex-1 relative overflow-hidden">
        <TurkeySvgMap
          cityStats={cityStats}
          onCityClick={handleCityClick}
          selectedCityId={selectedCity?.id}
          isSheetOpen={sheetOpen}
        />
      </div>

      {/* Şehir Detay Sheet */}
      <Sheet open={sheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto z-[1000]">
          <SheetHeader className="border-b border-border pb-4 px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <SheetTitle className="text-xl">{selectedCity?.name}</SheetTitle>
            </div>
            <SheetDescription>
              Bu şehirdeki son gönderiler
            </SheetDescription>
          </SheetHeader>

          <div className="py-4 px-4 sm:px-6 space-y-4">
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Bu şehirde henüz gönderi yok.</p>
                <Link href="/feed">
                  <Button variant="outline" className="mt-4">
                    İlk gönderiyi sen paylaş
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {posts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="block"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-muted/50 rounded-lg p-4 hover:bg-muted transition-colors group border border-border/50"
                    >
                      {/* Kategori ve Tarih */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[post.category] || "bg-muted text-muted-foreground"}`}>
                          {CATEGORY_LABELS[post.category] || post.category}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(post.created_at)}
                        </span>
                      </div>

                      {/* İçerik */}
                      <p className="text-sm text-foreground line-clamp-3 mb-3">
                        {post.content}
                      </p>

                      {/* Kullanıcı ve Araç */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {post.user.first_name} {post.user.last_name}
                        </span>
                        {post.vehicle && (
                          <span className="flex items-center gap-1">
                            <Car className="w-3 h-3" />
                            {post.vehicle.brand} {post.vehicle.model}
                          </span>
                        )}
                      </div>

                      {/* Hover indicator */}
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-end text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="flex items-center gap-1">
                          Görüntüle <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ))}

                {/* Tümünü Gör Butonu */}
                {posts.length > 0 && (
                  <Link href={`/feed?cityId=${selectedCity?.id}`}>
                    <Button variant="outline" className="w-full">
                      {selectedCity?.name} için tüm gönderileri gör
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
