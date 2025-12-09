"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const [cities, setCities] = useState<City[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | "other" | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | "other" | null>(null);
  const [acceptedRules, setAcceptedRules] = useState(false);

  // Window size'ı al (confetti için)
  useEffect(() => {
    function updateSize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Geri sayım efekti
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Geri sayım bitti, feed'e yönlendir
      router.push("/feed");
    }
  }, [countdown, router]);

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
          if (data.profile?.city) {
            // İl seçiliyse onboarding tamamlandı kabul et
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
    if (!selectedBrand || selectedBrand === "other") {
      setModels([]);
      setSelectedModel(selectedBrand === "other" ? "other" : null);
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

    if (selectedBrand === null) {
      toast.error("Lütfen marka seçin (listede yok ise ilgili seçeneği kullanın)");
      return;
    }

    if (selectedBrand !== "other" && selectedModel === null) {
      toast.error("Lütfen model seçin veya 'Model listede yok' seçeneğini kullanın");
      return;
    }

    if (!acceptedRules) {
      toast.error("Lütfen topluluk kurallarını kabul edin");
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
        body: JSON.stringify({
          brandId: selectedBrand === "other" ? null : selectedBrand,
          modelId: selectedModel === "other" ? null : selectedModel,
        }),
      });

      if (!vehicleRes.ok) {
        const data = await vehicleRes.json();
        throw new Error(data.message || "Araç bilgisi kaydedilemedi");
      }

      // Başarılı! Confetti göster ve geri sayım başlat
      setShowSuccess(true);
      setCountdown(3);
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
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

  // Başarı ekranı
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
        {windowSize.width > 0 && windowSize.height > 0 && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
          />
        )}
        <div className="text-center space-y-6 z-10">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold">Hazırsınız!</h1>
          {countdown !== null && countdown > 0 && (
            <div className="space-y-2">
              <p className="text-muted-foreground">Ana sayfaya yönlendiriliyorsunuz...</p>
              <div className="text-6xl font-bold text-primary animate-pulse">
                {countdown}
              </div>
            </div>
          )}
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
              value={selectedBrand === "other" ? "other" : selectedBrand || ""}
              onChange={(e) =>
                setSelectedBrand(e.target.value === "other" ? "other" : e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Marka seçin</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
              <option value="other">Markam listede yok</option>
            </select>
          </div>

          {/* Model Seçimi */}
          {selectedBrand && selectedBrand !== "other" && (
          <div className="space-y-2">
              <label className="block text-sm font-medium">Model</label>
            <select
                value={selectedModel === "other" ? "other" : selectedModel || ""}
                onChange={(e) =>
                  setSelectedModel(e.target.value === "other" ? "other" : e.target.value ? Number(e.target.value) : null)
                }
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
                <option value="">Model seçin</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                </option>
              ))}
                <option value="other">Modelim listede yok</option>
            </select>
          </div>
          )}

          {/* Topluluk Kuralları */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Topluluk Kuralları</h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Lütfen aşağıdaki kuralları okuyun ve kabul edin:</p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>İnceltici, cinsel içerik paylaşmak yasaktır</li>
                  <li>Argo, küfür ve hakaret içeren içerikler paylaşılamaz</li>
                  <li>Topluluk kurallarına uymayan içerikler silinir ve hesap kapatılabilir</li>
                  <li>Saygılı ve yapıcı bir dil kullanılmalıdır</li>
                </ul>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedRules}
                  onChange={(e) => setAcceptedRules(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                />
                <span className="text-sm text-foreground group-hover:text-foreground/80">
                  Topluluk kurallarını okudum ve kabul ediyorum. Kurallara uymadığım takdirde hesabımın kapatılabileceğini biliyorum.
                </span>
              </label>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedCity || !selectedBrand || !selectedModel || !acceptedRules || saving}
            className="w-full mt-4"
          >
            {saving ? "Kaydediliyor..." : "Devam Et"}
          </Button>
        </div>
      </div>
    </div>
  );
}
