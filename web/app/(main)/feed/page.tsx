"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import CreatePostDialog from "./create-post-dialog";

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

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  city: {
    id: number;
    name: string;
  } | null;
}

interface City {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  satilik: { label: "Satılık", emoji: "💰", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  kiralik: { label: "Kiralık", emoji: "🔑", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  yedek_parca: { label: "Yedek Parça", emoji: "🔧", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  aksesuar: { label: "Aksesuar", emoji: "🎨", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  servis: { label: "Servis", emoji: "🛠️", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
};

const CATEGORIES = [
  { value: "", label: "Tümü", emoji: "📋" },
  { value: "satilik", label: "Satılık", emoji: "💰" },
  { value: "kiralik", label: "Kiralık", emoji: "🔑" },
  { value: "yedek_parca", label: "Yedek Parça", emoji: "🔧" },
  { value: "aksesuar", label: "Aksesuar", emoji: "🎨" },
  { value: "servis", label: "Servis", emoji: "🛠️" },
];

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Filtreler - URL'den oku
  const urlScope = (searchParams.get("scope") as "my" | "all") || "my";
  const urlCategory = searchParams.get("category") || "";
  const urlCity = searchParams.get("city") ? Number(searchParams.get("city")) : null;
  const urlBrand = searchParams.get("brand") ? Number(searchParams.get("brand")) : null;
  const urlModel = searchParams.get("model") ? Number(searchParams.get("model")) : null;
  const urlNew = searchParams.get("new") === "true";

  const [scope, setScope] = useState<"my" | "all">(urlScope);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [cities, setCities] = useState<City[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedCity, setSelectedCity] = useState<number | null>(urlCity);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(urlBrand);
  const [selectedModel, setSelectedModel] = useState<number | null>(urlModel);
  const [showFilters, setShowFilters] = useState(false);

  // Infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetching, setFetching] = useState(false); // İlk yükleme için
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

  // URL değiştiğinde state'leri güncelle
  useEffect(() => {
    setScope(urlScope);
    setSelectedCategory(urlCategory);
    setSelectedCity(urlCity);
    setSelectedBrand(urlBrand);
    setSelectedModel(urlModel);
  }, [urlScope, urlCategory, urlCity, urlBrand, urlModel]);

  // URL'den ?new=true gelirse dialog aç
  useEffect(() => {
    if (urlNew) {
      setShowCreateDialog(true);
      // URL'den new parametresini kaldır
      const params = new URLSearchParams(searchParams.toString());
      params.delete("new");
      router.replace(`/feed?${params.toString()}`, { scroll: false });
    }
  }, [urlNew, router, searchParams]);

  // Sayfa yüklendiğinde
  useEffect(() => {
    fetchProfile();
  }, []);

  // Filtre değiştiğinde URL'i güncelle ve gönderileri yeniden al
  useEffect(() => {
    if (profile) {
      // URL'i güncelle
      updateURL({
        scope: scope !== "my" ? scope : null,
        category: selectedCategory || null,
        city: selectedCity?.toString() || null,
        brand: selectedBrand?.toString() || null,
        model: selectedModel?.toString() || null,
      });

      // Gönderileri yeniden al
      setPosts([]);
      setPage(1);
      setHasMore(true);
      fetchPosts(1, true);
    }
  }, [scope, selectedCategory, selectedCity, selectedBrand, selectedModel, profile]);

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

  async function fetchUnreadNotificationCount() {
    try {
      const res = await fetch("/api/notifications/unread-count", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadNotificationCount(data.unread_count || 0);
      }
    } catch {
      // Hata yok say
    }
  }

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

      if (!profileData.profile?.city) {
        window.location.href = "/onboarding";
        return;
      }

      setProfile(profileData.profile);
      
      // Bildirim sayısını al
      fetchUnreadNotificationCount();

      // İlleri al
      const citiesRes = await fetch("/api/locations/cities");
      if (citiesRes.ok) {
        const citiesData = await citiesRes.json();
        setCities(citiesData.cities);
      }

      // Markaları al
      const brandsRes = await fetch("/api/locations/brands");
      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData.brands);
      }

      // URL'den gelen brand varsa modelleri yükle
      const urlBrand = searchParams.get("brand");
      if (urlBrand) {
        const modelsRes = await fetch(`/api/locations/models/${urlBrand}`);
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          setModels(modelsData.models);
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
      setFetching(true);
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
        if (selectedCity) {
          params.set("cityId", selectedCity.toString());
        }
      }

      if (selectedModel) {
        params.set("modelId", selectedModel.toString());
      } else if (selectedBrand) {
        params.set("brandId", selectedBrand.toString());
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
      toast.error("Gönderiler yüklenemedi");
    } finally {
      setFetching(false);
      setLoadingMore(false);
    }
  }


  // SSE ile anlık bildirim al
  useEffect(() => {
    if (!profile) return;

    const eventSource = new EventSource("/api/notifications/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'unread_count') {
          setUnreadNotificationCount(data.count);
        } else if (data.type === 'new_notification') {
          setUnreadNotificationCount(data.unread_count);
          // İsteğe bağlı: Bildirim toast'ı göster
          // toast.info(data.notification.message);
        }
      } catch (error) {
        console.error('SSE parse error:', error);
      }
    };

    eventSource.onerror = () => {
      // EventSource otomatik olarak yeniden bağlanmaya çalışır
      // Bağlantı kapalıysa, useEffect dependency değiştiğinde yeniden bağlanır
    };

    return () => {
      eventSource.close();
    };
  }, [profile]);

  // Sayfa görünür olduğunda bildirim sayısını güncelle (fallback)
  useEffect(() => {
    if (!profile) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUnreadNotificationCount();
      }
    };

    const handleNotificationRead = () => {
      fetchUnreadNotificationCount();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("notificationRead", handleNotificationRead);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("notificationRead", handleNotificationRead);
    };
  }, [profile]);

  // Marka değiştiğinde modelleri getir
  const prevBrandRef = useRef<number | null>(null);
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setSelectedModel(null);
      prevBrandRef.current = null;
      return;
    }

    async function fetchModels() {
      const res = await fetch(`/api/locations/models/${selectedBrand}`);
      if (res.ok) {
        const data = await res.json();
        setModels(data.models);
      }
    }

    fetchModels();
    
    // Sadece kullanıcı marka değiştirdiyse sıfırla (ilk yükleme değilse)
    if (prevBrandRef.current !== null && prevBrandRef.current !== selectedBrand) {
      setSelectedModel(null);
    }
    prevBrandRef.current = selectedBrand;
  }, [selectedBrand]);

  async function handleDelete(postId: string) {
    if (!confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;

    setDeletingId(postId);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gönderi silinemedi");
      }

      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("Gönderi silindi");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bir hata oluştu";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleShare(e: React.MouseEvent, post: Post) {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/post/${post.id}`;
    const text = `${post.content.slice(0, 100)}${post.content.length > 100 ? "..." : ""}`;
    const category = CATEGORY_LABELS[post.category];
    const vehicle = post.vehicle ? ` - ${post.vehicle.brand} ${post.vehicle.model}` : "";
    const title = `${category?.emoji || ""} ${category?.label || "Gönderi"}${vehicle} | Araç Platformu`;

    // Web Share API destekleniyorsa
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        // Kullanıcı paylaşımı iptal ettiyse sessizce geç
        if ((err as Error).name !== "AbortError") {
          // Fallback: Kopyala
          await copyToClipboard(url);
        }
      }
    } else {
      // Fallback: Kopyala
      await copyToClipboard(url);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link kopyalandı!");
    } catch {
      toast.error("Link kopyalanamadı");
    }
  }

  async function handleLogout() {
    if (!confirm("Çıkış yapmak istediğinize emin misiniz?")) return;
    
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

  const activeFilterCount = [selectedCategory, selectedCity, selectedBrand, selectedModel].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimal */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <span className="text-sm font-medium">
              {scope === "my" ? (profile?.city?.name || "Anasayfa") : "Keşfet"}
              </span>
            <div className="flex items-center gap-2">
              {/* Bildirimler */}
              <Link
                href="/notifications"
                className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] bg-primary text-primary-foreground rounded-full">
                    {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                  </span>
                )}
              </Link>
              
              {/* Filtreler */}
              <button
                onClick={() => setShowFilters(true)}
                className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] bg-primary text-primary-foreground rounded-full">
                    {activeFilterCount > 9 ? "9+" : activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Drawer */}
      <Drawer open={showFilters} onOpenChange={setShowFilters} noBodyStyles>
        <DrawerContent className="max-h-[70vh]">
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-base">Filtreler</DrawerTitle>
            </DrawerHeader>

            <div className="px-4 pb-6 space-y-5">
              {/* Kategori */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Kategori</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      !selectedCategory ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    Tümü
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedCategory === cat.value ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <span className="mr-1">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Konum (sadece Keşfet modunda) */}
                {scope === "all" && (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-muted-foreground">Konum</label>
                  
                  {/* İl */}
                  <select
                    value={selectedCity || ""}
                    onChange={(e) => setSelectedCity(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Tüm İller</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Marka ve Model */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground">Araç</label>
                
                {/* Marka */}
                <select
                  value={selectedBrand || ""}
                  onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Tüm Markalar</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>

                {/* Model */}
                {selectedBrand && (
                  <select
                    value={selectedModel || ""}
                    onChange={(e) => setSelectedModel(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Tüm Modeller</option>
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Aktif filtreler özeti */}
              {activeFilterCount > 0 && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{activeFilterCount} filtre aktif</span>
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setSelectedCity(null);
                        setSelectedBrand(null);
                        setSelectedModel(null);
                      }}
                      className="text-xs text-destructive hover:underline"
                    >
                      Tümünü Temizle
                    </button>
                  </div>
                </div>
              )}

              {/* Uygula butonu */}
              <Button
                onClick={() => setShowFilters(false)}
                className="w-full h-10 rounded-lg"
              >
                Uygula
              </Button>
            </div>
        </div>
        </DrawerContent>
      </Drawer>

      {/* Content */}
      <main className="max-w-xl mx-auto pb-24">
        {/* Posts */}
        {fetching ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏘️</p>
            <p className="text-muted-foreground">Henüz gönderi yok</p>
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
                          
                          <div className="flex items-center gap-3">
                            {/* Paylaş */}
                            <button
                              onClick={(e) => handleShare(e, post)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                            </button>
                            
                            {/* Sil (sadece kendi gönderileri) */}
                            {post.user.id === profile?.id && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(post.id);
                              }}
                              disabled={deletingId === post.id}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                {deletingId === post.id ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                            </button>
                          )}
                          </div>
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
                Tüm gönderileri gördünüz
              </p>
            )}
          </div>
        )}
      </main>

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
