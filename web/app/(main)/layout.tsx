"use client";

import { Suspense } from "react";
import BottomNav from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
