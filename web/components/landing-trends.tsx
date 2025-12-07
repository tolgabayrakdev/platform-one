"use client";

import { motion } from "motion/react";
import Link from "next/link";

interface Trend {
  id?: number;
  name?: string;
  category?: string;
  post_count: number;
}

interface LandingTrendsProps {
  brands: Trend[];
  cities: Trend[];
  categories: Array<{ category: string; post_count: number }>;
}

export default function LandingTrends({ brands, cities, categories }: LandingTrendsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mb-12"
    >
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="w-1 h-6 md:h-8 bg-primary rounded-full"></div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">🔥 Popüler Trendler</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Popüler Markalar */}
        {brands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="p-4 md:p-6 rounded-xl bg-card border border-border"
          >
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
              <span>🚗</span>
              <span>Popüler Markalar</span>
            </h3>
            <div className="space-y-2">
              {brands.slice(0, 5).map((brand, index) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{brand.name}</span>
                  <span className="text-xs text-muted-foreground">{brand.post_count}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Popüler Şehirler */}
        {cities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-4 md:p-6 rounded-xl bg-card border border-border"
          >
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
              <span>📍</span>
              <span>Popüler Şehirler</span>
            </h3>
            <div className="space-y-2">
              {cities.slice(0, 5).map((city, index) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{city.name}</span>
                  <span className="text-xs text-muted-foreground">{city.post_count}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Popüler Kategoriler */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="p-4 md:p-6 rounded-xl bg-card border border-border"
          >
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
              <span>📌</span>
              <span>Popüler Kategoriler</span>
            </h3>
            <div className="space-y-2">
              {categories.slice(0, 5).map((cat, index) => {
                const categoryLabels: Record<string, { label: string; emoji: string }> = {
                  soru: { label: "Soru", emoji: "❓" },
                  yedek_parca: { label: "Yedek Parça", emoji: "🔧" },
                  servis: { label: "Servis", emoji: "🛠️" },
                  bakim: { label: "Bakım", emoji: "⚙️" },
                  deneyim: { label: "Deneyim", emoji: "💬" },
                  yardim: { label: "Yardım", emoji: "🤝" },
                };
                const category = categoryLabels[cat.category] || { label: cat.category, emoji: "📌" };
                return (
                  <motion.div
                    key={cat.category}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-medium">{category.emoji} {category.label}</span>
                    <span className="text-xs text-muted-foreground">{cat.post_count}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-6 text-center"
      >
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Tüm trendleri gör
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </motion.div>
    </motion.div>
  );
}
