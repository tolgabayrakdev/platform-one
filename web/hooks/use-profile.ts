import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Profile } from "@/lib/types/profile";

export function useProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/users/profile", {
        credentials: "include",
      });

      if (!res.ok) {
        router.push("/sign-in");
        return;
      }

      const data = await res.json();
      setProfile(data.profile);
    } catch {
      toast.error("Profil yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function updateCity(cityId: number) {
    try {
      const res = await fetch("/api/users/city", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cityId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "İl güncellenemedi");
      }
      toast.success("İl güncellendi");
      fetchProfile();
      return true;
    } catch (error: any) {
      toast.error(error.message || "İl güncellenemedi");
      return false;
    }
  }

  async function updateVehicle(brandId: number | null, modelId: number | null) {
    try {
      const res = await fetch("/api/users/vehicle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          brandId,
          modelId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Araç bilgisi güncellenemedi");
      }
      toast.success("Araç bilgisi güncellendi");
      fetchProfile();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Araç bilgisi güncellenemedi");
      return false;
    }
  }

  return {
    profile,
    loading,
    refetch: fetchProfile,
    updateCity,
    updateVehicle,
  };
}
