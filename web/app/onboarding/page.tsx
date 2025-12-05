"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface City {
  id: number;
  name: string;
}

interface District {
  id: number;
  name: string;
}

interface Neighborhood {
  id: number;
  name: string;
}

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<number | null>(null);

  // Sayfa yüklendiğinde auth kontrolü ve illeri getir
  useEffect(() => {
    async function init() {
      try {
        // Auth kontrolü
        const authRes = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!authRes.ok) {
          window.location.href = "/sign-in";
          return;
        }

        // Kullanıcının zaten mahallesi var mı?
        const profileRes = await fetch("/api/users/profile", {
          credentials: "include",
        });

        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.profile?.neighborhood) {
            // Mahalle zaten seçili, feed'e yönlendir
            window.location.href = "/feed";
            return;
          }
        }

        // İlleri getir
        const citiesRes = await fetch("/api/locations/cities");
        if (citiesRes.ok) {
          const data = await citiesRes.json();
          setCities(data.cities);
        }
      } catch {
        toast.error("Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // İl seçildiğinde ilçeleri getir
  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setSelectedDistrict(null);
      return;
    }

    async function fetchDistricts() {
      try {
        const res = await fetch(`/api/locations/districts/${selectedCity}`);
        if (res.ok) {
          const data = await res.json();
          setDistricts(data.districts);
        }
      } catch {
        toast.error("İlçeler yüklenemedi");
      }
    }

    fetchDistricts();
    setSelectedDistrict(null);
    setNeighborhoods([]);
    setSelectedNeighborhood(null);
  }, [selectedCity]);

  // İlçe seçildiğinde mahalleleri getir
  useEffect(() => {
    if (!selectedDistrict) {
      setNeighborhoods([]);
      setSelectedNeighborhood(null);
      return;
    }

    async function fetchNeighborhoods() {
      try {
        const res = await fetch(`/api/locations/neighborhoods/${selectedDistrict}`);
        if (res.ok) {
          const data = await res.json();
          setNeighborhoods(data.neighborhoods);
        }
      } catch {
        toast.error("Mahalleler yüklenemedi");
      }
    }

    fetchNeighborhoods();
    setSelectedNeighborhood(null);
  }, [selectedDistrict]);

  // Mahalle kaydet
  async function handleSubmit() {
    if (!selectedNeighborhood) {
      toast.error("Lütfen mahalle seçin");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/users/neighborhood", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ neighborhoodId: selectedNeighborhood }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Mahalle kaydedilemedi");
      }

      window.location.href = "/feed";
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  }

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="text-4xl mb-4">📍</div>
          <h1 className="text-2xl font-bold">Mahallenizi Seçin</h1>
          <p className="text-muted-foreground">
            Size en yakın ilanları gösterebilmemiz için mahallenizi seçin
          </p>
        </div>

        <div className="border border-border rounded-lg p-6 space-y-4 bg-background">
          {/* İl Seçimi */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">İl</label>
            <select
              value={selectedCity || ""}
              onChange={(e) => setSelectedCity(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">İl seçin</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* İlçe Seçimi */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">İlçe</label>
            <select
              value={selectedDistrict || ""}
              onChange={(e) => setSelectedDistrict(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedCity}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">İlçe seçin</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mahalle Seçimi */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Mahalle</label>
            <select
              value={selectedNeighborhood || ""}
              onChange={(e) => setSelectedNeighborhood(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedDistrict}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Mahalle seçin</option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood.id} value={neighborhood.id}>
                  {neighborhood.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedNeighborhood || saving}
            className="w-full mt-4"
          >
            {saving ? "Kaydediliyor..." : "Devam Et"}
          </Button>
        </div>
      </div>
    </div>
  );
}
