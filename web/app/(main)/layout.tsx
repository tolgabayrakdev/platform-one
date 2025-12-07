"use client";

import { Suspense, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import BottomNav from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkOnboarding() {
      try {
        // Feed sayfası auth olmadan erişilebilir olmalı
        if (pathname === "/feed") {
          return; // Feed sayfasında onboarding kontrolü yapma
        }

        // Home sayfası auth gerektirir
        if (pathname === "/home") {
          // Home sayfası için auth kontrolü yapılacak (devam edecek)
        }

        // Auth kontrolü
        const authRes = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!authRes.ok) {
          // Ban kontrolü
          if (authRes.status === 403) {
            const data = await authRes.json().catch(() => ({}));
            if (data.message?.includes('kapatılmıştır') || data.message?.includes('kapatıldı')) {
              router.push("/sign-in");
              return;
            }
          }
          return; // Auth yoksa kontrol yapma
        }

        // Profile kontrolü - city ve vehicle seçilmiş mi?
        const profileRes = await fetch("/api/users/profile", {
          credentials: "include",
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();

          // Eğer city veya vehicle yoksa ve onboarding sayfasında değilsek yönlendir
          if (
            (!profileData.profile?.city || !profileData.profile?.vehicle) &&
            pathname !== "/onboarding"
          ) {
            router.push("/onboarding");
          }
        }
      } catch (error) {
        // Hata durumunda sessizce devam et
        console.error("Onboarding check error:", error);
      }
    }

    checkOnboarding();
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Content */}
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        {children}
      </Suspense>

      {/* Fixed Bottom Navigation - Tüm sayfalarda aynı */}
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
