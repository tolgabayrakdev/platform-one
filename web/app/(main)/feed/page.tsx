"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import CreatePostDialog from "./create-post-dialog";
import { Post, Profile, City, Brand, Model, TrendingBrand, TrendingCity, TrendingCategory } from "@/lib/types/posts";
import { CATEGORY_LABELS } from "@/lib/constants/posts";
import { useSearch } from "@/hooks/use-search";
import PageHeader from "@/components/posts/page-header";
import FilterDrawer from "@/components/posts/filter-drawer";
import PostCard from "@/components/posts/post-card";
import SearchResultsInfo from "@/components/posts/search-results-info";
import { handleSharePost, handleDeletePost } from "@/lib/utils/post-actions";

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
  const urlCategory = searchParams.get("category") || "";
  const urlCity = searchParams.get("city") ? Number(searchParams.get("city")) : null;
  const urlBrand = searchParams.get("brand") ? Number(searchParams.get("brand")) : null;
  const urlModel = searchParams.get("model") ? Number(searchParams.get("model")) : null;
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [cities, setCities] = useState<City[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedCity, setSelectedCity] = useState<number | null>(urlCity);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(urlBrand);
  const [selectedModel, setSelectedModel] = useState<number | null>(urlModel);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search hook
  const urlSearch = searchParams.get("search") || "";
  const { searchQuery, debouncedSearchQuery, setSearchQuery, clearSearch } = useSearch(urlSearch);

  // Trendler
  const [trendingBrands, setTrendingBrands] = useState<TrendingBrand[]>([]);
  const [trendingCities, setTrendingCities] = useState<TrendingCity[]>([]);
  const [trendingCategories, setTrendingCategories] = useState<TrendingCategory[]>([]);

  // Infinite scroll
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetching, setFetching] = useState(false); // İlk yükleme için
  const [totalResults, setTotalResults] = useState<number | null>(null);
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
    setSelectedCategory(urlCategory);
    setSelectedCity(urlCity);
    setSelectedBrand(urlBrand);
    setSelectedModel(urlModel);
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [urlCategory, urlCity, urlBrand, urlModel, urlSearch]);

  // URL'den ?new=true gelirse dialog aç
  useEffect(() => {
    const urlNew = searchParams.get("new") === "true";
    if (urlNew) {
      setShowCreateDialog(true);
      // URL'den new parametresini kaldır
      const params = new URLSearchParams(searchParams.toString());
      params.delete("new");
      router.replace(`/feed?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams]);

  // Sayfa yüklendiğinde - profile ve postları paralel yükle
  useEffect(() => {
    fetchProfile();
    // Postları da hemen yükle (profile beklemeyi bekleme)
    fetchPosts(1, true);
    fetchTrends();
    initialLoadDone.current = true;
  }, []);

  async function fetchTrends() {
    try {
      // Feed sayfası global olduğu için global=true parametresi gönder
      const res = await fetch("/api/posts/trends?global=true", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setTrendingBrands(data.brands || []);
        setTrendingCities(data.cities || []);
        setTrendingCategories(data.categories || []);
      }
    } catch {
      // Hata yok say
    }
  }

  // Filtre değiştiğinde gönderileri yeniden al
  useEffect(() => {
    // İlk yüklemede çalışmasın (yukarıdaki useEffect zaten yüklüyor)
    if (!initialLoadDone.current) return;

    // URL'i güncelle (scope her zaman "all")
    updateURL({
      category: selectedCategory || null,
      city: selectedCity?.toString() || null,
      brand: selectedBrand?.toString() || null,
      model: selectedModel?.toString() || null,
      search: debouncedSearchQuery || null,
    });

    // Gönderileri yeniden al
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setTotalResults(null);
    fetchPosts(1, true);
  }, [selectedCategory, selectedCity, selectedBrand, selectedModel, debouncedSearchQuery]);

  // Infinite scroll observer (sadece auth olanlar için)
  const lastPostRef = useCallback(
    (node: HTMLElement | null) => {
      if (!profile || loadingMore) return; // Auth olmayanlar için infinite scroll yok

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
    [loadingMore, hasMore, profile]
  );

  // Sayfa değiştiğinde daha fazla yükle (sadece auth olanlar için)
  useEffect(() => {
    if (page > 1 && profile) {
      fetchPosts(page, false);
    }
  }, [page, profile]);

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
      // Profile fetch'i optional - auth olmayabilir
      const profileRes = await fetch("/api/users/profile", {
        credentials: "include",
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();

        if (profileData.profile) {
          const needsOnboarding = !profileData.profile.city;

          if (needsOnboarding) {
            router.replace("/onboarding");
            return;
          }

          setProfile(profileData.profile);

          // Bildirim sayısını al (sadece auth varsa)
          fetchUnreadNotificationCount();
        }
      }
      // Auth yoksa da devam et

      // İlleri al (her zaman)
      const citiesRes = await fetch("/api/locations/cities");
      if (citiesRes.ok) {
        const citiesData = await citiesRes.json();
        setCities(citiesData.cities);
      }

      // Markaları al (her zaman)
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
      // Hata olsa bile devam et
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
      // Feed sayfası her zaman "all" scope
      params.set("scope", "all");
      params.set("page", pageNum.toString());
      // Auth olmayan kullanıcılar için ilk yüklemede 50, auth olanlar için 20
      const limit = !profile && reset ? "50" : "20";
      params.set("limit", limit);

      if (selectedCategory) {
        params.set("category", selectedCategory);
      }

      if (selectedCity) {
        params.set("cityId", selectedCity.toString());
      }

      if (selectedModel) {
        params.set("modelId", selectedModel.toString());
      } else if (selectedBrand) {
        params.set("brandId", selectedBrand.toString());
      }

      if (debouncedSearchQuery) {
        params.set("search", debouncedSearchQuery);
      }

      const postsRes = await fetch(`/api/posts?${params.toString()}`, {
        credentials: "include",
      });

      if (postsRes.ok) {
        const postsData = await postsRes.json();

        if (reset) {
          // Duplicate'leri önlemek için unique ID'lere göre filtrele
          const uniquePosts = postsData.posts.filter((post: Post, index: number, self: Post[]) =>
            index === self.findIndex((p: Post) => p.id === post.id)
          );
          setPosts(uniquePosts);
        } else {
          // Yeni post'ları eklerken duplicate'leri önle
          setPosts((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const newPosts = postsData.posts.filter((post: Post) => !existingIds.has(post.id));
            return [...prev, ...newPosts];
          });
        }

        // Daha fazla var mı kontrol et
        setHasMore(postsData.pagination.page < postsData.pagination.totalPages);
        // Toplam sonuç sayısını kaydet
        if (reset) {
          setTotalResults(postsData.pagination.total);
        }
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

          // Tarayıcı bildirimi göster (izin varsa)
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              try {
                new Notification("Yeni Bildirim", {
                  body: data.notification?.message || "Yeni bir bildiriminiz var",
                  icon: "/favicon.ico",
                  badge: "/favicon.ico",
                  tag: data.notification?.id || "notification",
                  requireInteraction: false,
                });
              } catch (error) {
                console.error("Notification error:", error);
              }
            }
          }
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

  const handleDelete = useCallback((postId: string) => {
    handleDeletePost(postId, posts, setPosts, setDeletingId);
  }, [posts]);

  const handleShare = useCallback((e: React.MouseEvent, post: Post) => {
    handleSharePost(e, post);
  }, []);

  const handleSearchClear = useCallback(() => {
    clearSearch();
    setTotalResults(null);
  }, [clearSearch]);

  const activeFilterCount = [selectedCategory, selectedCity, selectedBrand, selectedModel].filter(Boolean).length;

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
      <PageHeader
        title="Keşfet"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={handleSearchClear}
        unreadNotificationCount={profile ? unreadNotificationCount : 0}
        activeFilterCount={activeFilterCount}
        onFilterClick={() => setShowFilters(true)}
        showSignIn={!profile}
      />

      <FilterDrawer
        open={showFilters}
        onOpenChange={setShowFilters}
        selectedCategory={selectedCategory}
        selectedCity={selectedCity}
        selectedBrand={selectedBrand}
        selectedModel={selectedModel}
        cities={cities}
        brands={brands}
        models={models}
        onCategoryChange={setSelectedCategory}
        onCityChange={setSelectedCity}
        onBrandChange={setSelectedBrand}
        onModelChange={setSelectedModel}
        onClearAll={() => {
          setSelectedCategory("");
          setSelectedCity(null);
          setSelectedBrand(null);
          setSelectedModel(null);
        }}
        showCityFilter={true}
      />

      {/* Content - LinkedIn tarzı 3 kolonlu layout */}
      <main className="max-w-7xl mx-auto pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:px-4">
          {/* Sol Sidebar - Trendler (Desktop'ta görünür) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-16 space-y-4">
              {!fetching && (trendingBrands.length > 0 || trendingCities.length > 0) && (
                <div className="bg-card border border-border rounded-lg p-4 h-fit">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span>🔥</span>
                    <span>Trendler</span>
                  </h3>

                  {/* Trend Markalar */}
                  {trendingBrands.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Popüler Markalar</p>
                      <div className="space-y-1.5">
                        {trendingBrands.map((brand) => (
                          <button
                            key={brand.id}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedBrand(brand.id);
                              setSelectedModel(null);
                              setSelectedCity(null);
                              setShowFilters(false);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors flex items-center justify-between"
                          >
                            <span>🚗 {brand.name}</span>
                            <span className="text-muted-foreground">{brand.post_count}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trend Şehirler */}
                  {trendingCities.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Popüler Şehirler</p>
                      <div className="space-y-1.5">
                        {trendingCities.map((city) => (
                          <button
                            key={city.id}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedCity(city.id);
                              setSelectedBrand(null);
                              setSelectedModel(null);
                              setShowFilters(false);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors flex items-center justify-between"
                          >
                            <span>📍 {city.name}</span>
                            <span className="text-muted-foreground">{city.post_count}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Ana İçerik - Postlar */}
          <div className="lg:col-span-6 w-full px-2 lg:px-0">
            {/* Mobilde Trendler - Horizontal Scroll */}
            <div className="lg:hidden mb-4 mt-4">
              {(trendingBrands.length > 0 || trendingCities.length > 0 || trendingCategories.length > 0) && (
                <div className="px-3 py-3 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">🔥 TREND</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2" style={{ WebkitOverflowScrolling: 'touch' as any, overscrollBehaviorX: 'contain' }}>
                    {trendingBrands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => {
                          setSelectedBrand(brand.id);
                          setSelectedModel(null);
                          setSelectedCity(null);
                          setShowFilters(false);
                        }}
                        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
                      >
                        🚗 {brand.name} ({brand.post_count})
                      </button>
                    ))}
                    {trendingCities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          setSelectedCity(city.id);
                          setSelectedBrand(null);
                          setSelectedModel(null);
                          setShowFilters(false);
                        }}
                        className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
                      >
                        📍 {city.name} ({city.post_count})
                      </button>
                    ))}
                    {trendingCategories.map((cat) => {
                      const categoryLabel = CATEGORY_LABELS[cat.category];
                      return (
                        <button
                          key={cat.category}
                          onClick={() => {
                            setSelectedCategory(cat.category);
                            setShowFilters(false);
                          }}
                          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-muted/80 transition-colors"
                        >
                          {categoryLabel?.emoji || "📌"} {categoryLabel?.label || cat.category} ({cat.post_count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <SearchResultsInfo
              searchQuery={debouncedSearchQuery}
              totalResults={totalResults}
              isFetching={fetching}
            />

            {/* Posts */}
            {fetching ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🏘️</p>
                <p className="text-muted-foreground">
                  {debouncedSearchQuery ? (
                    <>
                      <span className="font-medium">"{debouncedSearchQuery}"</span> için sonuç bulunamadı
                    </>
                  ) : (
                    "Henüz gönderi yok"
                  )}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {posts.map((post, index) => {
                  const isLast = index === posts.length - 1;
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      profile={profile}
                      isLast={isLast}
                      lastPostRef={lastPostRef}
                      deletingId={deletingId}
                      onDelete={handleDelete}
                      onShare={handleShare}
                      onPollVote={(postId, updatedPoll) => {
                        setPosts(prev => prev.map(p =>
                          p.id === postId ? { ...p, poll: updatedPoll } : p
                        ));
                      }}
                    />
                  );
                })}

                {/* Loading */}
                {loadingMore && (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* End */}
                {!hasMore && posts.length > 0 && profile && (
                  <p className="text-center text-sm text-muted-foreground py-6">
                    Tüm gönderileri gördünüz
                  </p>
                )}

                {/* Auth olmayanlar için kayıt ol mesajı */}
                {!profile && posts.length > 0 && (
                  <div className="mt-8 p-6 md:p-8 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 text-center">
                    <p className="text-base font-medium mb-4 text-foreground/90">
                      Daha fazlası için şimdi kayıt ol
                    </p>
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105"
                    >
                      Ücretsiz Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sağ Sidebar - Trendler (Desktop'ta görünür) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-16 space-y-4">
              {!fetching && trendingCategories.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4 h-fit">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span>🔥</span>
                    <span>Popüler Kategoriler</span>
                  </h3>
                  <div className="space-y-1.5">
                    {trendingCategories.map((cat) => {
                      const categoryLabel = CATEGORY_LABELS[cat.category];
                      return (
                        <button
                          key={cat.category}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedCategory(cat.category);
                            setShowFilters(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors flex items-center justify-between"
                        >
                          <span>{categoryLabel?.emoji || "📌"} {categoryLabel?.label || cat.category}</span>
                          <span className="text-muted-foreground">{cat.post_count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Create Post Dialog - Sadece auth varsa */}
      {profile && (
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
      )}
    </div>
  );
}
