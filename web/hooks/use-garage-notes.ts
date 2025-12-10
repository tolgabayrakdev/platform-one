import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { GarageNote, GarageNoteStats, CreateGarageNoteData, UpdateGarageNoteData } from "@/lib/types/garage-notes";

interface UseGarageNotesFilters {
  type?: string;
  startDate?: string;
  endDate?: string;
}

export function useGarageNotes(filters: UseGarageNotesFilters = {}, initialLimit: number = 20, usePagination: boolean = false) {
  const [notes, setNotes] = useState<GarageNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalNotes, setTotalNotes] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotes = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("limit", initialLimit.toString());

      if (filters.type) {
        params.set("type", filters.type);
      }
      if (filters.startDate) {
        params.set("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.set("endDate", filters.endDate);
      }

      const res = await fetch(`/api/garage-notes?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Garaj notları yüklenemedi");
      }

      const data = await res.json();

      if (usePagination || reset) {
        // Pagination modunda veya reset durumunda, notları direkt set et
        setNotes(data.notes || []);
      } else {
        // Infinite scroll modunda, mevcut notlara ekle
        setNotes((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newNotes = (data.notes || []).filter((note: GarageNote) => !existingIds.has(note.id));
          return [...prev, ...newNotes];
        });
      }

      setHasMore(data.pagination.page < data.pagination.totalPages);
      setTotalNotes(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error("Garaj notları yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.startDate, filters.endDate, initialLimit, usePagination]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchNotes(1, true);
  }, [filters.type, filters.startDate, filters.endDate, fetchNotes]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || usePagination) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotes(nextPage, false);
  }, [page, hasMore, loading, usePagination, fetchNotes]);

  const goToPage = useCallback((pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages || loading) return;
    setPage(pageNum);
    fetchNotes(pageNum, true);
  }, [totalPages, loading, fetchNotes]);

  const createNote = useCallback(async (data: CreateGarageNoteData) => {
    try {
      const res = await fetch("/api/garage-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Garaj notu oluşturulamadı");
      }

      const result = await res.json();
      toast.success("Garaj notu eklendi");
      
      // Listeyi yenile
      setPage(1);
      fetchNotes(1, true);
      
      return result.note;
    } catch (error: any) {
      toast.error(error.message || "Garaj notu oluşturulamadı");
      throw error;
    }
  }, [fetchNotes]);

  const updateNote = useCallback(async (id: string, data: UpdateGarageNoteData) => {
    try {
      const res = await fetch(`/api/garage-notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Garaj notu güncellenemedi");
      }

      const result = await res.json();
      toast.success("Garaj notu güncellendi");
      
      // Güncellenen notu listede güncelle
      setNotes((prev) => prev.map((note) => (note.id === id ? result.note : note)));
      
      return result.note;
    } catch (error: any) {
      toast.error(error.message || "Garaj notu güncellenemedi");
      throw error;
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/garage-notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Garaj notu silinemedi");
      }

      toast.success("Garaj notu silindi");
      
      // Notu listeden kaldır
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (error: any) {
      toast.error(error.message || "Garaj notu silinemedi");
      throw error;
    }
  }, []);

  return {
    notes,
    loading,
    hasMore,
    totalNotes,
    totalPages,
    currentPage: page,
    loadMore,
    goToPage,
    createNote,
    updateNote,
    deleteNote,
    refetch: () => fetchNotes(1, true),
  };
}

export function useGarageNotesStats() {
  const [stats, setStats] = useState<GarageNoteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/garage-notes/stats", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Hata yok say
    } finally {
      setLoading(false);
    }
  }

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
}
