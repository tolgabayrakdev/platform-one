"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export default function ExplorePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Çıkış yapılamadı');
      }

      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Kullanıcı bilgileri alınamadı');
        }

        const data = await response.json();
        setUser(data.user.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Kullanıcı bilgileri yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Hoş Geldiniz!</h1>
            <p className="text-muted-foreground">
              Hesap bilgileriniz aşağıda görüntülenmektedir.
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
          </Button>
        </div>

        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Ad Soyad</label>
            <p className="text-lg">{user.first_name} {user.last_name}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">E-posta</label>
            <p className="text-lg">{user.email}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">Telefon</label>
            <p className="text-lg">{user.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

