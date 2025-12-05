"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Location {
  neighborhood: string;
  district: string;
  city: string;
}

interface Post {
  id: string;
  category: string;
  content: string;
  created_at: string;
  location: Location;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  kayip: { label: "Kayıp", emoji: "🔍", color: "bg-red-100 text-red-800" },
  yardim: { label: "Yardım", emoji: "🤝", color: "bg-blue-100 text-blue-800" },
  etkinlik: { label: "Etkinlik", emoji: "🎉", color: "bg-purple-100 text-purple-800" },
  ucretsiz: { label: "Ücretsiz", emoji: "🎁", color: "bg-green-100 text-green-800" },
  soru: { label: "Soru", emoji: "❓", color: "bg-yellow-100 text-yellow-800" },
};

export default function MyPostsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetchMyPosts(1, true);
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchMyPosts(page, false);
    }
  }, [page]);

  const lastPostRef = useCallback(
    (node: HTMLElement | null) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore]
  );

  async function fetchMyPosts(pageNum: number, reset: boolean) {
    if (!reset) setLoadingMore(true);

    try {
      const res = await fetch(`/api/posts/my?page=${pageNum}&limit=20`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/sign-in";
          return;
        }
        throw new Error("İlanlar yüklenemedi");
      }

      const data = await res.json();
      
      if (reset) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch {
      toast.error("İlanlar yüklenemedi");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;

    setDeletingId(postId);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "İlan silinemedi");
      }

      toast.success("İlan silindi");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "İlan silinemedi");
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Az önce";
    if (diffMins < 60) return `${diffMins} dk`;
    if (diffHours < 24) return `${diffHours} saat`;
    if (diffDays < 7) return `${diffDays} gün`;

    return date.toLocaleDateString("tr-TR");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
              ←
            </button>
            <span className="font-semibold">İlanlarım</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {posts.length} ilan
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-muted-foreground mb-4">Henüz ilan paylaşmadınız</p>
            <Link href="/feed" className="text-primary hover:underline">
              İlan Paylaş →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post, index) => {
              const category = CATEGORY_LABELS[post.category] || {
                label: post.category,
                emoji: "📌",
                color: "bg-gray-100 text-gray-800",
              };

              const isLast = index === posts.length - 1;

              return (
                <article
                  key={post.id}
                  ref={isLast ? lastPostRef : null}
                  className="hover:bg-muted/30"
                >
                  <div className="px-4 py-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${category.color}`}>
                        {category.emoji} {category.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(post.created_at)}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-sm whitespace-pre-wrap mb-2">{post.content}</p>

                    {/* Location */}
                    <p className="text-xs text-muted-foreground mb-3">
                      📍 {post.location.neighborhood}, {post.location.district}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 text-sm">
                      <Link href={`/post/${post.id}`} className="text-primary hover:underline">
                        Görüntüle
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        className="text-destructive hover:underline"
                      >
                        {deletingId === post.id ? "..." : "Sil"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Loading */}
            {loadingMore && (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* End */}
            {!hasMore && posts.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">
                Tüm ilanlarınızı gördünüz
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
