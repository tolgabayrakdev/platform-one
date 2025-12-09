"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { BadgeDisplay, BadgeProgressBar } from "@/components/badges";
import { Button } from "@/components/ui/button";

interface Badge {
  level: string;
  name: string;
  emoji: string;
  color: string;
  earned_at?: string;
}

interface BadgeProgress {
  level: string;
  name: string;
  emoji: string;
  threshold: number;
  current: number;
  remaining: number;
  progress: number;
}

interface BadgeData {
  stats: { commentCount: number; postCount: number };
  badges: { comment: Badge[]; post: Badge[] };
  highest: { comment: Badge | null; post: Badge | null };
  next: { comment: BadgeProgress | null; post: BadgeProgress | null };
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: {
    id: number;
    name: string;
  } | null;
  vehicle: {
    brand: { id: number; name: string };
    model: { id: number; name: string } | null;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([]);
  const [models, setModels] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedCity, setSelectedCity] = useState<number | "">("");
  const [selectedBrand, setSelectedBrand] = useState<number | "other" | "">("");
  const [selectedModel, setSelectedModel] = useState<number | "other" | "">("");
  const [savingCity, setSavingCity] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [cityEditMode, setCityEditMode] = useState(false);
  const [vehicleEditMode, setVehicleEditMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchBadges();
    checkNotificationPermission();
    fetchCities();
    fetchBrands();
  }, []);

  // Marka değiştiğinde modelleri getir
  useEffect(() => {
    async function fetchModels(brandId: number) {
      try {
        const res = await fetch(`/api/locations/models/${brandId}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setModels(data.models);
        } else {
          setModels([]);
        }
      } catch {
        setModels([]);
      }
    }

    if (selectedBrand && selectedBrand !== "other") {
      fetchModels(selectedBrand);
      setSelectedModel("");
    } else {
      setModels([]);
      // Eğer marka listede yok seçildiyse model de listede yok olabilir
      if (selectedBrand === "other") {
        setSelectedModel("other");
      } else {
        setSelectedModel("");
      }
    }
  }, [selectedBrand]);

  async function fetchBadges() {
    try {
      const res = await fetch("/api/users/badges", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBadgeData(data);
      }
    } catch {
      // Hata yok say
    }
  }

  function checkNotificationPermission() {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }

  async function requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Tarayıcınız bildirimleri desteklemiyor");
      return;
    }

    if (Notification.permission === "granted") {
      toast.success("Bildirim izni zaten verilmiş");
      return;
    }

    setRequestingPermission(true);

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        toast.success("Bildirim izni verildi! Artık bildirimler alacaksınız.");

        // Test bildirimi göster
        if (navigator.serviceWorker) {
          // Service Worker ile push notification için hazırlık
          // Şimdilik basit browser notification göster
          new Notification("Bildirimler Aktif", {
            body: "Artık yeni bildirimler alacaksınız!",
            icon: "/favicon.ico",
            badge: "/favicon.ico",
          });
        }
      } else if (permission === "denied") {
        toast.error("Bildirim izni reddedildi. Ayarlardan manuel olarak açabilirsiniz.");
      } else {
        toast.info("Bildirim izni verilmedi");
      }
    } catch (error) {
      toast.error("Bildirim izni alınamadı");
      console.error("Notification permission error:", error);
    } finally {
      setRequestingPermission(false);
    }
  }

  async function fetchProfile() {
    try {
      const res = await fetch("/api/users/profile", {
        credentials: "include",
      });

      if (!res.ok) {
        router.push("/sign-in");
        return;
      }

      const data = await res.json();
      setProfile(data.profile);
      if (data.profile?.city?.id) {
        setSelectedCity(data.profile.city.id);
      }
      if (data.profile?.vehicle?.brand?.id) {
        setSelectedBrand(data.profile.vehicle.brand.id);
      }
      if (data.profile?.vehicle?.model?.id) {
        setSelectedModel(data.profile.vehicle.model.id);
      }
    } catch {
      toast.error("Profil yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCities() {
    try {
      const res = await fetch("/api/locations/cities");
      if (res.ok) {
        const data = await res.json();
        setCities(data.cities || []);
      }
    } catch {
      // ignore
    }
  }

  async function fetchBrands() {
    try {
      const res = await fetch("/api/locations/brands");
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } catch {
      // ignore
    }
  }

  async function handleSaveCity() {
    if (!selectedCity) {
      toast.error("Lütfen şehir seçin");
      return;
    }
    setSavingCity(true);
    try {
      const res = await fetch("/api/users/city", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cityId: selectedCity }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "İl güncellenemedi");
      }
      toast.success("İl güncellendi");
      fetchProfile();
      setCityEditMode(false);
    } catch (error: any) {
      toast.error(error.message || "İl güncellenemedi");
    } finally {
      setSavingCity(false);
    }
  }

  async function handleSaveVehicle() {
    const brandPayload = selectedBrand && selectedBrand !== "other" ? selectedBrand : null;
    const modelPayload =
      selectedModel && selectedModel !== "other" ? selectedModel : null;

    if (!brandPayload && selectedBrand !== "other") {
      toast.error("Lütfen marka seçin veya 'Listede yok' seçeneğini kullanın");
      return;
    }

    if (brandPayload && !modelPayload && selectedModel !== "other") {
      toast.error("Lütfen model seçin veya 'Model listede yok' seçeneğini kullanın");
      return;
    }

    setSavingVehicle(true);
    try {
      const res = await fetch("/api/users/vehicle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brandId: brandPayload,
          modelId: modelPayload,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Araç bilgisi güncellenemedi");
      }
      toast.success("Araç bilgisi güncellendi");
      fetchProfile();
      setVehicleEditMode(false);
    } catch (error: any) {
      toast.error(error.message || "Araç bilgisi güncellenemedi");
    } finally {
      setSavingVehicle(false);
    }
  }

  async function handleLogout() {
    if (!confirm("Çıkış yapmak istediğinize emin misiniz?")) return;

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/sign-in");
    } catch {
      toast.error("Çıkış yapılamadı");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-xl mx-auto px-4 h-12 flex items-center">
          <span className="font-semibold">Profil</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto px-4 py-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-semibold mb-3">
            {profile?.first_name?.charAt(0)}
          </div>
          <h1 className="text-xl font-semibold">
            {profile?.first_name} {profile?.last_name}
          </h1>
          {profile?.city && (
            <p className="text-sm text-muted-foreground mt-1">
              📍 {profile.city.name}
            </p>
          )}
          {profile?.vehicle && (
            <p className="text-sm text-muted-foreground mt-1">
              🚗 {profile.vehicle.brand.name}
              {profile.vehicle.model ? ` ${profile.vehicle.model.name}` : ""}
            </p>
          )}
        </div>

        {/* Rozetler */}
        {badgeData && (
          <div className="mb-8">
            <p className="text-xs text-muted-foreground mb-3">Rozetlerim</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Yorum Rozetleri */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💬</span>
                  <div>
                    <p className="text-xs font-medium">Yorum</p>
                    <p className="text-[10px] text-muted-foreground">{badgeData.stats.commentCount} yorum</p>
                  </div>
                </div>
                <BadgeDisplay type="comment" badges={badgeData.badges.comment} />
                <div className="mt-3 pt-3 border-t border-border">
                  <BadgeProgressBar type="comment" progress={badgeData.next?.comment || null} />
                </div>
              </div>

              {/* Gönderi Rozetleri */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📝</span>
                  <div>
                    <p className="text-xs font-medium">Gönderi</p>
                    <p className="text-[10px] text-muted-foreground">{badgeData.stats.postCount} gönderi</p>
                  </div>
                </div>
                <BadgeDisplay type="post" badges={badgeData.badges.post} />
                <div className="mt-3 pt-3 border-t border-border">
                  <BadgeProgressBar type="post" progress={badgeData.next?.post || null} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="space-y-4 mb-8">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">E-posta</p>
            <p className="text-sm">{profile?.email}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Telefon</p>
            <p className="text-sm">{profile?.phone || "Belirtilmemiş"}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">İl</p>
                <p className="text-sm">
                  {profile?.city ? profile.city.name : "Seçilmedi"}
                </p>
              </div>
              {!cityEditMode ? (
                <Button size="sm" variant="outline" onClick={() => setCityEditMode(true)}>
                  Düzenle
                </Button>
              ) : (
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(Number(e.target.value))}
                    className="text-sm border border-input rounded-md px-2 py-1 bg-background"
                  >
                    <option value="">Şehir seç</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" onClick={handleSaveCity} disabled={savingCity || !selectedCity}>
                    {savingCity ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (profile?.city?.id) {
                        setSelectedCity(profile.city.id);
                      } else {
                        setSelectedCity("");
                      }
                      setCityEditMode(false);
                    }}
                  >
                    İptal
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Araç</p>
                <p className="text-sm">
                  {profile?.vehicle
                    ? `${profile.vehicle.brand.name}${profile.vehicle.model ? ` ${profile.vehicle.model.name}` : ""}`
                    : "Seçilmedi"}
                </p>
              </div>
              {!vehicleEditMode ? (
                <Button size="sm" variant="outline" onClick={() => setVehicleEditMode(true)}>
                  Düzenle
                </Button>
              ) : (
                <div className="flex flex-col gap-2 items-end w-full max-w-xs">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value === "other" ? "other" : Number(e.target.value))}
                    className="text-sm border border-input rounded-md px-2 py-1 bg-background w-full"
                  >
                    <option value="">Marka seç</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                    <option value="other">Markam listede yok</option>
                  </select>

                  {selectedBrand && selectedBrand !== "other" && (
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value === "other" ? "other" : Number(e.target.value))}
                      className="text-sm border border-input rounded-md px-2 py-1 bg-background w-full"
                    >
                      <option value="">Model seç</option>
                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                      <option value="other">Modelim listede yok</option>
                    </select>
                  )}

                  {selectedBrand === "other" && (
                    <p className="text-xs text-muted-foreground text-right">
                      Marka listede yok seçildi (model belirtmek zorunda değilsiniz)
                    </p>
                  )}

                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      onClick={handleSaveVehicle}
                      disabled={savingVehicle || !selectedBrand}
                      className="flex-1"
                    >
                      {savingVehicle ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (profile?.vehicle?.brand?.id) {
                          setSelectedBrand(profile.vehicle.brand.id);
                          setSelectedModel(profile.vehicle.model?.id || "");
                        } else {
                          setSelectedBrand("");
                          setSelectedModel("");
                        }
                        setVehicleEditMode(false);
                      }}
                    >
                      İptal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bildirim İzni */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground mb-3">Bildirimler</p>
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-sm font-medium">Tarayıcı Bildirimleri</span>
              </div>
              {notificationPermission === "granted" && (
                <span className="text-xs text-green-600 font-medium">✓ Aktif</span>
              )}
              {notificationPermission === "denied" && (
                <span className="text-xs text-red-600 font-medium">✗ Reddedildi</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {notificationPermission === "granted"
                ? "Bildirim izni verildi. Yeni bildirimler tarayıcınızdan gösterilecek."
                : notificationPermission === "denied"
                  ? "Bildirim izni reddedilmiş. Tarayıcı ayarlarından manuel olarak açabilirsiniz."
                  : "Yeni bildirimler için tarayıcı bildirim izni verin."}
            </p>
            {notificationPermission !== "granted" && (
              <button
                onClick={requestNotificationPermission}
                disabled={requestingPermission || notificationPermission === "denied"}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${notificationPermission === "denied"
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
              >
                {requestingPermission
                  ? "İzin isteniyor..."
                  : notificationPermission === "denied"
                    ? "İzin Reddedildi (Ayarlardan Açın)"
                    : "Bildirim İzni Ver"}
              </button>
            )}
          </div>
        </div>

        {/* Tema Seçimi */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground mb-3">Tema</p>
          {mounted && (
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${theme === "light"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-sm">Açık</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${theme === "dark"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-sm">Koyu</span>
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${theme === "system"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Sistem</span>
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleLogout}
            className="w-full py-3 text-sm text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/5"
          >
            Çıkış Yap
          </button>
        </div>
      </main>
    </div>
  );
}
