"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Location {
  city: string;
}

interface Vehicle {
  brand: string;
  model: string;
}

interface Post {
  id: string;
  category: string;
  content: string;
  created_at: string;
  images?: Array<{ url: string; public_id: string }>;
  comment_count?: number;
  user: User;
  location: Location;
  vehicle: Vehicle;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  satilik: { label: "Satılık", emoji: "💰", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  kiralik: { label: "Kiralık", emoji: "🔑", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  yedek_parca: { label: "Yedek Parça", emoji: "🔧", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  aksesuar: { label: "Aksesuar", emoji: "🎨", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  servis: { label: "Servis", emoji: "🛠️", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString("tr-TR");
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const params = new URLSearchParams();
        params.set("scope", "all");
        params.set("page", "1");
        params.set("limit", "10");

        const postsRes = await fetch(`/api/posts?${params.toString()}`, {
          credentials: "include",
        });

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || []);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">
                Araç Platformu
              </h1>
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
            Türkiye'nin her şehrinden araç sahiplerine ulaşabilir, konuşabilirsin. 
            <span className="font-semibold text-primary"> Araç alım-satım, kiralama, yedek parça ve servis</span> ihtiyaçlarınız için aktif bir topluluk.
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
        <div className="space-y-3">
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

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Henüz gönderi yok</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => {
                const category = CATEGORY_LABELS[post.category] || {
                  label: post.category,
                  emoji: "📌",
                  color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
                };

                return (
                  <article
                    key={post.id}
                    className="hover:bg-muted/30"
                  >
                    <Link href={`/post/${post.id}`} className="block px-4 py-4">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {post.user.first_name.charAt(0)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-sm">
                              {post.user.first_name} {post.user.last_name}
                            </span>
                            <span className="text-muted-foreground text-sm">·</span>
                            <span className="text-muted-foreground text-sm">{formatDate(post.created_at)}</span>
                          </div>
                          
                          {post.location && (
                            <p className="text-xs text-muted-foreground mb-2">
                              📍 {post.location.city}
                            </p>
                          )}
                          
                          {post.vehicle && (
                            <p className="text-xs text-muted-foreground mb-2">
                              🚗 {post.vehicle.brand} {post.vehicle.model}
                            </p>
                          )}

                          <p className="text-sm mb-2 whitespace-pre-wrap">{post.content}</p>

                          {/* Resimler */}
                          {post.images && post.images.length > 0 && (
                            <div className={`mb-2 grid gap-1.5 ${
                              post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                            }`}>
                              {post.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img.url}
                                  alt={`Gönderi resmi ${idx + 1}`}
                                  className="w-full h-48 object-cover rounded-lg border border-border"
                                />
                              ))}
                            </div>
                          )}

                          {/* Category + Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${category.color}`}>
                                {category.emoji} {category.label}
                              </span>
                              {post.comment_count !== undefined && post.comment_count > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  {post.comment_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

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
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Araç Platformu. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
