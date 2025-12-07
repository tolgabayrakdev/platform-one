import { Metadata } from "next";
import Link from "next/link";
import PostsList from "./posts-list";

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

export default async function Home() {
  const posts = await getLatestPosts();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Garaj Muhabbet</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="px-5 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-muted"
              >
                Giriş Yap
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero CTA */}
        <div className="mb-10 p-8 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">🚗</span>
            <h2 className="text-3xl font-bold">
              Sende Aramıza Katıl!
            </h2>
          </div>
          <p className="text-base text-foreground/90 mb-6 leading-relaxed">
            Türkiye'nin <span className="font-semibold text-primary">81 ilinden</span> araç sahiplerinin bir araya geldiği topluluk platformu. 
            Araçlarınız hakkında <span className="font-semibold text-primary">sorular sorun, deneyimlerinizi paylaşın, yardımlaşın</span>. 
            Yedek parça, servis, bakım ve araç konularında bilgi alışverişi yapın.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Ücretsiz Kayıt Ol
            </Link>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg border border-primary/30 bg-background hover:bg-primary/10"
            >
              Tüm Gönderileri Gör
            </Link>
          </div>
        </div>

        {/* Posts Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <h2 className="text-2xl font-bold">En Son Gönderiler</h2>
            </div>
            <Link
              href="/feed"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Tümünü Gör →
            </Link>
          </div>

          <PostsList initialPosts={posts} />

          {/* CTA - Daha fazla gönderi için */}
          {posts.length > 0 && (
            <div className="mt-8 p-8 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <p className="text-base font-medium mb-5 text-foreground/90">
                Daha fazla gönderi görmek ve topluluğa katılmak için kayıt olun
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Ücretsiz Kayıt Ol
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
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
