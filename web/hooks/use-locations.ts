import { useState, useEffect, useCallback } from "react";
import { City, Brand, Model } from "@/lib/types/profile";

export function useLocations() {
  const [cities, setCities] = useState<City[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
    fetchBrands();
  }, []);

  async function fetchCities() {
    try {
      const res = await fetch("/api/locations/cities");
      if (res.ok) {
        const data = await res.json();
        setCities(data.cities || []);
      }
    } catch {
      // ignore
    }
  }

  async function fetchBrands() {
    try {
      const res = await fetch("/api/locations/brands");
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const fetchModels = useCallback(async (brandId: number) => {
    try {
      const res = await fetch(`/api/locations/models/${brandId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setModels(data.models);
      } else {
        setModels([]);
      }
    } catch {
      setModels([]);
    }
  }, []);

  const resetModels = useCallback(() => {
    setModels([]);
  }, []);

  return {
    cities,
    brands,
    models,
    loading,
    fetchModels,
    setModels: resetModels,
  };
}
