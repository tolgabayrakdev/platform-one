"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          // Giriş yapmış, profil kontrolü yap
          const profileRes = await fetch("/api/users/profile", {
            credentials: "include",
          });

          if (profileRes.ok) {
            const data = await profileRes.json();
            if (data.profile?.neighborhood) {
              window.location.href = "/feed";
            } else {
              window.location.href = "/onboarding";
            }
          } else {
            window.location.href = "/feed";
          }
        } else {
          // Giriş yapmamış
          window.location.href = "/sign-in";
        }
      } catch {
        window.location.href = "/sign-in";
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

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

  return null;
}
