"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  comment_id: string | null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/sign-in");
          return;
        }
        throw new Error("Bildirimler yüklenemedi");
      }

      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      toast.error("Bildirimler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string, postId: string | null) {
    if (markingAsRead) return;

    setMarkingAsRead(notificationId);

    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Bildirim okundu olarak işaretlenemedi");
      }

      // State'i güncelle
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );

      // Post sayfasına yönlendir
      if (postId) {
        router.push(`/post/${postId}`);
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setMarkingAsRead(null);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PUT",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Bildirimler okundu olarak işaretlenemedi");
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("Tüm bildirimler okundu olarak işaretlendi");
    } catch (error) {
      toast.error("Bir hata oluştu");
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

    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <Link href="/feed" className="text-muted-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <span className="text-sm font-medium">Bildirimler</span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Tümünü okundu işaretle
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-muted-foreground text-center">Henüz bildirim yok</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id, notification.post_id)}
                className={`w-full px-4 py-4 text-left hover:bg-muted/30 transition-colors ${
                  !notification.is_read ? "bg-muted/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {notification.type === "comment" && (
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
