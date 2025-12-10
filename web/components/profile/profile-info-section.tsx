import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Profile, City, Brand, Model } from "@/lib/types/profile";

interface ProfileInfoSectionProps {
  profile: Profile | null;
  cities: City[];
  brands: Brand[];
  models: Model[];
  onCityUpdate: (cityId: number) => Promise<boolean>;
  onVehicleUpdate: (brandId: number | null, modelId: number | null) => Promise<boolean>;
  onModelsFetch: (brandId: number) => void;
  onModelsReset: () => void;
}

export default function ProfileInfoSection({
  profile,
  cities,
  brands,
  models,
  onCityUpdate,
  onVehicleUpdate,
  onModelsFetch,
  onModelsReset,
}: ProfileInfoSectionProps) {
  const [selectedCity, setSelectedCity] = useState<number | "">("");
  const [selectedBrand, setSelectedBrand] = useState<number | "other" | "">("");
  const [selectedModel, setSelectedModel] = useState<number | "other" | "">("");
  const [savingCity, setSavingCity] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [cityEditMode, setCityEditMode] = useState(false);
  const [vehicleEditMode, setVehicleEditMode] = useState(false);
  const prevBrandRef = useRef<number | "other" | "">("");

  // Profile değiştiğinde state'leri güncelle
  useEffect(() => {
    if (profile?.city?.id) {
      setSelectedCity(profile.city.id);
    }
    if (profile?.vehicle?.brand?.id) {
      setSelectedBrand(profile.vehicle.brand.id);
    }
    if (profile?.vehicle?.model?.id) {
      setSelectedModel(profile.vehicle.model.id);
    }
  }, [profile]);

  // Marka değiştiğinde modelleri getir
  useEffect(() => {
    // İlk render'da veya aynı marka tekrar seçildiyse çalışmasın
    if (selectedBrand === prevBrandRef.current) {
      return;
    }

    prevBrandRef.current = selectedBrand;

    if (selectedBrand && selectedBrand !== "other") {
      onModelsFetch(selectedBrand);
      setSelectedModel("");
    } else {
      onModelsReset();
      if (selectedBrand === "other") {
        setSelectedModel("other");
      } else {
        setSelectedModel("");
      }
    }
  }, [selectedBrand, onModelsFetch, onModelsReset]);

  async function handleSaveCity() {
    if (!selectedCity) {
      toast.error("Lütfen şehir seçin");
      return;
    }
    setSavingCity(true);
    const success = await onCityUpdate(selectedCity);
    if (success) {
      setCityEditMode(false);
    }
    setSavingCity(false);
  }

  async function handleSaveVehicle() {
    const brandPayload = selectedBrand && selectedBrand !== "other" ? selectedBrand : null;
    const modelPayload = selectedModel && selectedModel !== "other" ? selectedModel : null;

    if (!brandPayload && selectedBrand !== "other") {
      toast.error("Lütfen marka seçin veya 'Listede yok' seçeneğini kullanın");
      return;
    }

    if (brandPayload && !modelPayload && selectedModel !== "other") {
      toast.error("Lütfen model seçin veya 'Model listede yok' seçeneğini kullanın");
      return;
    }

    setSavingVehicle(true);
    const success = await onVehicleUpdate(brandPayload, modelPayload);
    if (success) {
      setVehicleEditMode(false);
    }
    setSavingVehicle(false);
  }

  function handleCancelCity() {
    if (profile?.city?.id) {
      setSelectedCity(profile.city.id);
    } else {
      setSelectedCity("");
    }
    setCityEditMode(false);
  }

  function handleCancelVehicle() {
    if (profile?.vehicle?.brand?.id) {
      setSelectedBrand(profile.vehicle.brand.id);
      setSelectedModel(profile.vehicle.model?.id || "");
    } else {
      setSelectedBrand("");
      setSelectedModel("");
    }
    setVehicleEditMode(false);
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">E-posta</p>
        <p className="text-sm">{profile?.email}</p>
      </div>
      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Telefon</p>
        <p className="text-sm">{profile?.phone || "Belirtilmemiş"}</p>
      </div>
      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">İl</p>
            <p className="text-sm">
              {profile?.city ? profile.city.name : "Seçilmedi"}
            </p>
          </div>
          {!cityEditMode ? (
            <Button size="sm" variant="outline" onClick={() => setCityEditMode(true)}>
              Düzenle
            </Button>
          ) : (
            <div className="flex gap-2 items-center">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(Number(e.target.value))}
                className="text-sm border border-input rounded-md px-2 py-1 bg-background"
              >
                <option value="">Şehir seç</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={handleSaveCity} disabled={savingCity || !selectedCity}>
                {savingCity ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelCity}>
                İptal
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Araç</p>
            <p className="text-sm">
              {profile?.vehicle
                ? `${profile.vehicle.brand.name}${profile.vehicle.model ? ` ${profile.vehicle.model.name}` : ""}`
                : "Seçilmedi"}
            </p>
          </div>
          {!vehicleEditMode ? (
            <Button size="sm" variant="outline" onClick={() => setVehicleEditMode(true)}>
              Düzenle
            </Button>
          ) : (
            <div className="flex flex-col gap-2 items-end w-full max-w-xs">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value === "other" ? "other" : Number(e.target.value))}
                className="text-sm border border-input rounded-md px-2 py-1 bg-background w-full"
              >
                <option value="">Marka seç</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
                <option value="other">Markam listede yok</option>
              </select>

              {selectedBrand && selectedBrand !== "other" && (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value === "other" ? "other" : Number(e.target.value))}
                  className="text-sm border border-input rounded-md px-2 py-1 bg-background w-full"
                >
                  <option value="">Model seç</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                  <option value="other">Modelim listede yok</option>
                </select>
              )}

              {selectedBrand === "other" && (
                <p className="text-xs text-muted-foreground text-right">
                  Marka listede yok seçildi (model belirtmek zorunda değilsiniz)
                </p>
              )}

              <div className="flex gap-2 w-full">
                <Button
                  size="sm"
                  onClick={handleSaveVehicle}
                  disabled={savingVehicle || !selectedBrand}
                  className="flex-1"
                >
                  {savingVehicle ? "Kaydediliyor..." : "Kaydet"}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelVehicle}>
                  İptal
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
