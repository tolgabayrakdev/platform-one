"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";

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
    model: { id: number; name: string };
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchProfile();
    checkNotificationPermission();
  }, []);

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
    } catch {
      toast.error("Profil yüklenemedi");
    } finally {
      setLoading(false);
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
              🚗 {profile.vehicle.brand.name} {profile.vehicle.model.name}
            </p>
          )}
        </div>

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
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">İl</p>
            <p className="text-sm">
              {profile?.city
                ? profile.city.name
                : "Seçilmedi"}
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Araç</p>
            <p className="text-sm">
              {profile?.vehicle
                ? `${profile.vehicle.brand.name} ${profile.vehicle.model.name}`
                : "Seçilmedi"}
            </p>
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
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  notificationPermission === "denied"
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
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${
                  theme === "light"
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
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${
                  theme === "dark"
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
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${
                  theme === "system"
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
