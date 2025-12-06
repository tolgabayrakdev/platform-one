"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface City {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
}

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cities, setCities] = useState<City[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);

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

        // Kullanıcının zaten ili ve aracı var mı?
        const profileRes = await fetch("/api/users/profile", {
          credentials: "include",
        });

        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.profile?.city && data.profile?.vehicle) {
            // İl ve araç zaten seçili, feed'e yönlendir
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

        // Markaları getir
        const brandsRes = await fetch("/api/locations/brands");
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          setBrands(data.brands);
        }
      } catch {
        toast.error("Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Marka değiştiğinde modelleri getir
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setSelectedModel(null);
      return;
    }

    async function fetchModels() {
      try {
        const res = await fetch(`/api/locations/models/${selectedBrand}`);
        if (res.ok) {
          const data = await res.json();
          setModels(data.models);
        }
      } catch {
        toast.error("Modeller yüklenemedi");
      }
    }

    fetchModels();
    setSelectedModel(null);
  }, [selectedBrand]);

  // İl ve araç kaydet
  async function handleSubmit() {
    if (!selectedCity) {
      toast.error("Lütfen il seçin");
      return;
    }

    if (!selectedBrand) {
      toast.error("Lütfen marka seçin");
      return;
    }

    if (!selectedModel) {
      toast.error("Lütfen model seçin");
      return;
    }

    setSaving(true);

    try {
      // İl kaydet
      const cityRes = await fetch("/api/users/city", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cityId: selectedCity }),
      });

      if (!cityRes.ok) {
        const data = await cityRes.json();
        throw new Error(data.message || "İl kaydedilemedi");
      }

      // Araç kaydet
      const vehicleRes = await fetch("/api/users/vehicle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ brandId: selectedBrand, modelId: selectedModel }),
      });

      if (!vehicleRes.ok) {
        const data = await vehicleRes.json();
        throw new Error(data.message || "Araç bilgisi kaydedilemedi");
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
          <div className="text-4xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold">Profilinizi Tamamlayın</h1>
          <p className="text-muted-foreground">
            İlinizi ve aracınızı seçin
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

          {/* Marka Seçimi */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Marka</label>
            <select
              value={selectedBrand || ""}
              onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Marka seçin</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Seçimi */}
          {selectedBrand && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Model</label>
              <select
                value={selectedModel || ""}
                onChange={(e) => setSelectedModel(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Model seçin</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedCity || !selectedBrand || !selectedModel || saving}
            className="w-full mt-4"
          >
            {saving ? "Kaydediliyor..." : "Devam Et"}
          </Button>
        </div>
      </div>
    </div>
  );
}
