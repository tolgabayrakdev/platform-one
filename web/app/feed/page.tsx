"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CreatePostDialog from "./create-post-dialog";

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

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
  user: User;
  location: Location;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  neighborhood: {
    id: number;
    name: string;
    district: { id: number; name: string };
    city: { id: number; name: string };
  } | null;
}

interface City {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
}

interface Neighborhood {
  id: number;
  name: string;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  kayip: { label: "Kayıp / Bulundu", emoji: "🔍", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  yardim: { label: "Yardım", emoji: "🤝", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  etkinlik: { label: "Etkinlik", emoji: "🎉", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  ucretsiz: { label: "Ücretsiz Eşya", emoji: "🎁", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  soru: { label: "Soru / Bilgi", emoji: "❓", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
};

const CATEGORIES = [
  { value: "", label: "Tümü", emoji: "📋" },
  { value: "kayip", label: "Kayıp / Bulundu", emoji: "🔍" },
  { value: "yardim", label: "Yardım", emoji: "🤝" },
  { value: "etkinlik", label: "Etkinlik", emoji: "🎉" },
  { value: "ucretsiz", label: "Ücretsiz Eşya", emoji: "🎁" },
  { value: "soru", label: "Soru / Bilgi", emoji: "❓" },
];

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtreler - URL'den oku
  const [scope, setScope] = useState<"my" | "all">((searchParams.get("scope") as "my" | "all") || "my");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedCity, setSelectedCity] = useState<number | null>(
    searchParams.get("city") ? Number(searchParams.get("city")) : null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(
    searchParams.get("district") ? Number(searchParams.get("district")) : null
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<number | null>(
    searchParams.get("neighborhood") ? Number(searchParams.get("neighborhood")) : null
  );
  const [showFilters, setShowFilters] = useState(
    !!(searchParams.get("category") || searchParams.get("city"))
  );

  // Infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const initialLoadDone = useRef(false);

  // URL'i güncelle
  const updateURL = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.replace(`/feed?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Sayfa yüklendiğinde
  useEffect(() => {
    fetchProfile();
  }, []);

  // Filtre değiştiğinde URL'i güncelle ve ilanları yeniden al
  useEffect(() => {
    if (profile) {
      // URL'i güncelle
      updateURL({
        scope: scope !== "my" ? scope : null,
        category: selectedCategory || null,
        city: selectedCity?.toString() || null,
        district: selectedDistrict?.toString() || null,
        neighborhood: selectedNeighborhood?.toString() || null,
      });

      // İlanları yeniden al
      setPosts([]);
      setPage(1);
      setHasMore(true);
      fetchPosts(1, true);
    }
  }, [scope, selectedCategory, selectedCity, selectedDistrict, selectedNeighborhood, profile]);

  // Infinite scroll observer
  const lastPostRef = useCallback(
    (node: HTMLElement | null) => {
      if (loadingMore) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loadingMore, hasMore]
  );

  // Sayfa değiştiğinde daha fazla yükle
  useEffect(() => {
    if (page > 1 && profile) {
      fetchPosts(page, false);
    }
  }, [page]);

  async function fetchProfile() {
    try {
      const profileRes = await fetch("/api/users/profile", {
        credentials: "include",
      });

      if (!profileRes.ok) {
        window.location.href = "/sign-in";
        return;
      }

      const profileData = await profileRes.json();

      if (!profileData.profile?.neighborhood) {
        window.location.href = "/onboarding";
        return;
      }

      setProfile(profileData.profile);

      // İlleri al
      const citiesRes = await fetch("/api/locations/cities");
      if (citiesRes.ok) {
        const citiesData = await citiesRes.json();
        setCities(citiesData.cities);
      }

      // URL'den gelen city varsa ilçeleri yükle
      const urlCity = searchParams.get("city");
      if (urlCity) {
        const districtsRes = await fetch(`/api/locations/districts/${urlCity}`);
        if (districtsRes.ok) {
          const districtsData = await districtsRes.json();
          setDistricts(districtsData.districts);
        }

        // URL'den gelen district varsa mahalleleri yükle
        const urlDistrict = searchParams.get("district");
        if (urlDistrict) {
          const neighborhoodsRes = await fetch(`/api/locations/neighborhoods/${urlDistrict}`);
          if (neighborhoodsRes.ok) {
            const neighborhoodsData = await neighborhoodsRes.json();
            setNeighborhoods(neighborhoodsData.neighborhoods);
          }
        }
      }
    } catch {
      toast.error("Veriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPosts(pageNum: number = 1, reset: boolean = false) {
    if (reset) {
      setLoadingMore(false);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.set("scope", scope);
      params.set("page", pageNum.toString());
      params.set("limit", "20");

      if (selectedCategory) {
        params.set("category", selectedCategory);
      }

      if (scope === "all") {
        if (selectedNeighborhood) {
          params.set("neighborhoodId", selectedNeighborhood.toString());
        } else if (selectedDistrict) {
          params.set("districtId", selectedDistrict.toString());
        } else if (selectedCity) {
          params.set("cityId", selectedCity.toString());
        }
      }

      const postsRes = await fetch(`/api/posts?${params.toString()}`, {
        credentials: "include",
      });

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        
        if (reset) {
          setPosts(postsData.posts);
        } else {
          setPosts((prev) => [...prev, ...postsData.posts]);
        }

        // Daha fazla var mı kontrol et
        setHasMore(postsData.pagination.page < postsData.pagination.totalPages);
      }
    } catch {
      toast.error("İlanlar yüklenemedi");
    } finally {
      setLoadingMore(false);
    }
  }

  // İl değiştiğinde ilçeleri getir
  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setSelectedDistrict(null);
      setNeighborhoods([]);
      setSelectedNeighborhood(null);
      return;
    }

    async function fetchDistricts() {
      const res = await fetch(`/api/locations/districts/${selectedCity}`);
      if (res.ok) {
        const data = await res.json();
        setDistricts(data.districts);
      }
    }

    fetchDistricts();
    setSelectedDistrict(null);
    setNeighborhoods([]);
    setSelectedNeighborhood(null);
  }, [selectedCity]);

  // İlçe değiştiğinde mahalleleri getir
  useEffect(() => {
    if (!selectedDistrict) {
      setNeighborhoods([]);
      setSelectedNeighborhood(null);
      return;
    }

    async function fetchNeighborhoods() {
      const res = await fetch(`/api/locations/neighborhoods/${selectedDistrict}`);
      if (res.ok) {
        const data = await res.json();
        setNeighborhoods(data.neighborhoods);
      }
    }

    fetchNeighborhoods();
    setSelectedNeighborhood(null);
  }, [selectedDistrict]);

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

      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("İlan silindi");
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/sign-in";
    } catch {
      toast.error("Çıkış yapılamadı");
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
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString("tr-TR");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-xl mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-12">
            <span className="text-lg font-semibold">mahalle</span>
            <div className="flex items-center gap-2">
              <Link href="/my-posts" className="p-2 hover:bg-muted rounded-lg text-sm">
                İlanlarım
              </Link>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg text-sm ${showFilters ? 'bg-muted' : 'hover:bg-muted'}`}
              >
                Filtre
              </button>
              <button onClick={handleLogout} className="p-2 hover:bg-muted rounded-lg text-sm text-muted-foreground">
                Çıkış
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setScope("my")}
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                scope === "my"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              📍 {profile?.neighborhood?.name || "Mahallem"}
            </button>
            <button
              onClick={() => setScope("all")}
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                scope === "all"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              🌍 Keşfet
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="py-3 space-y-4 border-b border-border">
              {/* Kategori */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Kategori</p>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 text-sm rounded-lg border border-border bg-background cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    ▼
                  </div>
                </div>
              </div>

              {/* Lokasyon */}
              {scope === "all" && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Lokasyon</p>
                  <div className="space-y-2">
                    {/* İl */}
                    <div className="relative">
                      <select
                        value={selectedCity || ""}
                        onChange={(e) => setSelectedCity(e.target.value ? Number(e.target.value) : null)}
                        className="w-full appearance-none px-3 py-2.5 pr-8 text-sm rounded-lg border border-border bg-background cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none"
                      >
                        <option value="">🏙️ Tüm İller</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        ▼
                      </div>
                    </div>

                    {/* İlçe */}
                    {selectedCity && (
                      <div className="relative">
                        <select
                          value={selectedDistrict || ""}
                          onChange={(e) => setSelectedDistrict(e.target.value ? Number(e.target.value) : null)}
                          className="w-full appearance-none px-3 py-2.5 pr-8 text-sm rounded-lg border border-border bg-background cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none"
                        >
                          <option value="">🏘️ Tüm İlçeler</option>
                          {districts.map((district) => (
                            <option key={district.id} value={district.id}>{district.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                          ▼
                        </div>
                      </div>
                    )}

                    {/* Mahalle */}
                    {selectedDistrict && (
                      <div className="relative">
                        <select
                          value={selectedNeighborhood || ""}
                          onChange={(e) => setSelectedNeighborhood(e.target.value ? Number(e.target.value) : null)}
                          className="w-full appearance-none px-3 py-2.5 pr-8 text-sm rounded-lg border border-border bg-background cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none"
                        >
                          <option value="">📍 Tüm Mahalleler</option>
                          {neighborhoods.map((n) => (
                            <option key={n.id} value={n.id}>{n.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                          ▼
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Aktif Filtreler */}
              {(selectedCategory || selectedCity) && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                      {CATEGORIES.find(c => c.value === selectedCategory)?.emoji} {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                      <button onClick={() => setSelectedCategory("")} className="hover:text-primary/70">×</button>
                    </span>
                  )}
                  {selectedCity && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                      {cities.find(c => c.id === selectedCity)?.name}
                      {selectedDistrict && ` > ${districts.find(d => d.id === selectedDistrict)?.name}`}
                      {selectedNeighborhood && ` > ${neighborhoods.find(n => n.id === selectedNeighborhood)?.name}`}
                      <button onClick={() => { setSelectedCity(null); setSelectedDistrict(null); setSelectedNeighborhood(null); }} className="hover:text-primary/70">×</button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto pb-20">
        {/* Posts */}
        {posts.length === 0 && !loadingMore ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏘️</p>
            <p className="text-muted-foreground">Henüz ilan yok</p>
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
                        
                        {scope === "all" && post.location && (
                          <p className="text-xs text-muted-foreground mb-2">
                            📍 {post.location.neighborhood}, {post.location.district}
                          </p>
                        )}

                        <p className="text-sm mb-2 whitespace-pre-wrap">{post.content}</p>

                        {/* Category + Actions */}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-0.5 rounded ${category.color}`}>
                            {category.emoji} {category.label}
                          </span>
                          
                          {post.user.id === profile?.id && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(post.id);
                              }}
                              disabled={deletingId === post.id}
                              className="text-xs text-muted-foreground hover:text-destructive"
                            >
                              {deletingId === post.id ? "..." : "Sil"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
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
                Tüm ilanları gördünüz
              </p>
            )}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowCreateDialog(true)}
        className="fixed bottom-5 right-5 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl"
      >
        +
      </button>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={() => {
          setShowCreateDialog(false);
          setPosts([]);
          setPage(1);
          setHasMore(true);
          fetchPosts(1, true);
        }}
      />
    </div>
  );
}
