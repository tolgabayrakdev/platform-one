import { Metadata } from "next";
import Link from "next/link";
import PostsList from "./posts-list";
import LandingHero from "@/components/landing-hero";
import LandingStats from "@/components/landing-stats";
import LandingTrends from "@/components/landing-trends";

export const metadata: Metadata = {
  title: "Garaj Muhabbet - Araç Sahipleri Topluluğu | Türkiye'nin 81 İlinden Araç Forumu",
  description: "Türkiye'nin 81 ilinden araç sahiplerinin bir araya geldiği topluluk platformu. Araçlarınız hakkında sorular sorun, deneyimlerinizi paylaşın, yardımlaşın. Yedek parça, servis, bakım ve araç konularında bilgi alışverişi yapın.",
  keywords: [
    "araç forumu",
    "araç sahipleri topluluğu",
    "araç soru cevap",
    "araç yardımlaşma",
    "yedek parça soru",
    "araç servis tavsiye",
    "araç bakım önerileri",
    "Türkiye araç topluluğu",
    "81 il araç platformu",
    "araç muhabbet",
    "garaj muhabbet",
    "araç danışma platformu"
  ],
  openGraph: {
    title: "Garaj Muhabbet - Araç Sahipleri Topluluğu",
    description: "Türkiye'nin 81 ilinden araç sahiplerinin bir araya geldiği topluluk. Araçlarınız hakkında sorular sorun, deneyimlerinizi paylaşın, yardımlaşın.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Garaj Muhabbet - Araç Sahipleri Topluluğu",
    description: "Türkiye'nin en büyük araç sahipleri topluluğu. Ücretsiz kayıt ol ve topluluğa katıl!",
  },
};

const API_URL = process.env.BACKEND_URL || "http://localhost:1234";

async function getLatestPosts() {
  try {
    const params = new URLSearchParams();
    params.set("scope", "all");
    params.set("page", "1");
    params.set("limit", "10");

    const res = await fetch(`${API_URL}/api/posts?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch {
    return [];
  }
}

async function getPlatformStats() {
  try {
    const res = await fetch(`${API_URL}/api/posts/stats`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { totalPosts: 0, totalUsers: 0, totalCities: 81, totalBrands: 0 };
    }
    return await res.json();
  } catch {
    return { totalPosts: 0, totalUsers: 0, totalCities: 81, totalBrands: 0 };
  }
}

async function getTrends() {
  try {
    const res = await fetch(`${API_URL}/api/posts/trends?global=true`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { brands: [], cities: [], categories: [] };
    }
    return await res.json();
  } catch {
    return { brands: [], cities: [], categories: [] };
  }
}

export default async function Home() {
  const [posts, stats, trends] = await Promise.all([
    getLatestPosts(),
    getPlatformStats(),
    getTrends(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <span className="text-xl md:text-2xl">🚗</span>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Garaj Muhabbet
              </h1>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href="/sign-in"
                className="px-3 py-1.5 md:px-5 md:py-2.5 text-xs md:text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <span className="hidden sm:inline">Giriş Yap</span>
                <span className="sm:hidden">Giriş</span>
              </Link>
              <Link
                href="/sign-up"
                className="px-3 py-1.5 md:px-5 md:py-2.5 text-xs md:text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 lg:py-12">
        {/* Hero Section */}
        <LandingHero />

        {/* Platform Stats */}
        <LandingStats
          totalPosts={stats.totalPosts}
          totalUsers={stats.totalUsers}
          totalCities={stats.totalCities}
          totalBrands={stats.totalBrands}
        />

        {/* Trends Section */}
        <LandingTrends
          brands={trends.brands || []}
          cities={trends.cities || []}
          categories={trends.categories || []}
        />

        {/* Posts Section */}
        <section className="max-w-3xl mx-auto space-y-3 mt-8 md:mt-12">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1 h-5 md:h-6 bg-primary rounded-full"></div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">En Son Gönderiler</h2>
            </div>
            <Link
              href="/feed"
              className="text-xs md:text-sm font-medium text-primary hover:text-primary/80"
            >
              <span className="hidden sm:inline">Tümünü Gör →</span>
              <span className="sm:hidden">Tümü →</span>
            </Link>
          </div>

          <PostsList initialPosts={posts} />

          {/* CTA - Daha fazla gönderi için */}
          {posts.length > 0 && (
            <div className="mt-6 md:mt-8 p-4 md:p-5 rounded-lg text-center border border-border/60">
              <p className="text-sm md:text-base font-medium mb-3 md:mb-4 text-foreground/90 px-2">
                Daha fazla gönderi görmek ve topluluğa katılmak için kayıt olun
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center px-5 md:px-6 py-2 md:py-2.5 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/85 transition-colors"
              >
                Ücretsiz Kayıt Ol
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 md:py-8 mt-12 md:mt-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">
                Hakkımızda
              </Link>
              <span>·</span>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                İletişim
              </Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Gizlilik Politikası
              </Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Kullanım Şartları
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Garaj Muhabbet. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
