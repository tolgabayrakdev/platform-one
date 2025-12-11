import { useState, useEffect, useCallback } from "react";

interface CityStats {
  id: number;
  name: string;
  post_count: number;
}

interface Post {
  id: string;
  category: string;
  content: string;
  images: Array<{ url: string; public_id: string }>;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
  location: {
    city: string;
  };
  vehicle: {
    brand: string;
    model: string;
  } | null;
}

export function useMapData() {
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCityStats();
  }, []);

  async function fetchCityStats() {
    try {
      setLoading(true);
      const res = await fetch("/api/locations/cities/stats");
      if (res.ok) {
        const data = await res.json();
        setCityStats(data.cities || []);
      } else {
        setError("Şehir istatistikleri yüklenemedi");
      }
    } catch {
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return {
    cityStats,
    loading,
    error,
    refetch: fetchCityStats,
  };
}

export function useCityPosts(cityId: number | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/locations/cities/${id}/posts?limit=10`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        setError("Gönderiler yüklenemedi");
        setPosts([]);
      }
    } catch {
      setError("Bir hata oluştu");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cityId) {
      fetchPosts(cityId);
    } else {
      setPosts([]);
    }
  }, [cityId, fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch: cityId ? () => fetchPosts(cityId) : () => {},
  };
}

