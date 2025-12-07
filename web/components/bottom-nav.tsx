"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") || "all";
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Auth kontrolü yap
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  const isActive = (path: string, checkScope?: string) => {
    if (checkScope) {
      return pathname === path && scope === checkScope;
    }
    return pathname === path;
  };


  // Auth state yüklenene kadar loading göster (flash'ı önlemek için)
  if (isAuthenticated === null) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="max-w-xl mx-auto flex items-center justify-around h-14">
          {/* Loading placeholder - navbar yüksekliğini korumak için */}
          <div className="flex flex-col items-center gap-0.5 px-3 py-1 opacity-0">
            <div className="w-6 h-6" />
            <span className="text-[10px]"> </span>
          </div>
        </div>
      </nav>
    );
  }

  if (!isAuthenticated) {
    // Auth olmayanlar için sadece Keşfet ve Giriş Yap
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="max-w-xl mx-auto flex items-center justify-around h-14">
          {/* Keşfet */}
          <Link
            href="/feed?scope=all"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              isActive("/feed", "all") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/feed", "all") ? 2.5 : 1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[10px]">Keşfet</span>
          </Link>

          {/* Giriş Yap */}
          <Link
            href="/sign-in"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              isActive("/sign-in") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/sign-in") ? 2.5 : 1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="text-[10px]">Giriş Yap</span>
          </Link>
        </div>
      </nav>
    );
  }

  // Auth olanlar için tam navigasyon
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="max-w-xl mx-auto flex items-center justify-around h-14">
        {/* Home - Anasayfa */}
        <Link
          href="/home"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
            isActive("/home") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/home") ? 2.5 : 1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px]">Anasayfa</span>
        </Link>

        {/* Keşfet */}
        <Link
          href="/feed"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
            isActive("/feed") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/feed") ? 2.5 : 1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px]">Keşfet</span>
        </Link>

        {/* Yeni Gönderi */}
        <Link
          href={isAuthenticated ? "/home?new=true" : "/sign-in"}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground"
        >
          <div className="w-10 h-10 -mt-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </Link>

        {/* Gönderilerim */}
        <Link
          href="/my-posts"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
            isActive("/my-posts") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/my-posts") ? 2.5 : 1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[10px]">Gönderilerim</span>
        </Link>

        {/* Profil */}
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
            isActive("/profile") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/profile") ? 2.5 : 1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px]">Profil</span>
        </Link>
      </div>
    </nav>
  );
}
