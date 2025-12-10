"use client";

import Link from "next/link";
import SearchBar from "./search-bar";

interface PageHeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  unreadNotificationCount?: number;
  activeFilterCount: number;
  onFilterClick: () => void;
  showSignIn?: boolean;
}

export default function PageHeader({
  title,
  searchQuery,
  onSearchChange,
  onSearchClear,
  unreadNotificationCount = 0,
  activeFilterCount,
  onFilterClick,
  showSignIn = false,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-4">
        <div className="flex items-center justify-between h-12 gap-2">
          <span className="text-sm font-medium flex-shrink-0">{title}</span>
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onClear={onSearchClear}
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Bildirimler */}
            {!showSignIn && (
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
            )}

            {/* Giriş Yap - Auth yoksa */}
            {showSignIn && (
              <Link
                href="/sign-in"
                className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Giriş Yap
              </Link>
            )}

            {/* Filtreler */}
            <button
              onClick={onFilterClick}
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
  );
}
