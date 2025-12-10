import { useState, useEffect } from "react";
import { BadgeData } from "@/lib/types/profile";

export function useBadges() {
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  async function fetchBadges() {
    try {
      const res = await fetch("/api/users/badges", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBadgeData(data);
      }
    } catch {
      // Hata yok say
    } finally {
      setLoading(false);
    }
  }

  return {
    badgeData,
    loading,
    refetch: fetchBadges,
  };
}
