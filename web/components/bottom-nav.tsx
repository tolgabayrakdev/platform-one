"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scope = searchParams.get("scope") || "my";

  const isActive = (path: string, checkScope?: string) => {
    if (checkScope) {
      return pathname === path && scope === checkScope;
    }
    return pathname === path;
  };

  // Yeni gönderi için mevcut scope'u koru
  const newPostHref = `/feed?scope=${scope}&new=true`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="max-w-xl mx-auto flex items-center justify-around h-14">
        {/* Feed - İlim */}
        <Link
          href="/feed?scope=my"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
            isActive("/feed", "my") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/feed", "my") ? 2.5 : 1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px]">İlim</span>
        </Link>

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

        {/* Yeni Gönderi */}
        <Link
          href={newPostHref}
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
