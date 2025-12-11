"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import { useGarageNotes, useGarageNotesStats } from "@/hooks/use-garage-notes";
import { GarageNote, CreateGarageNoteData, UpdateGarageNoteData } from "@/lib/types/garage-notes";
import GarageNoteCard from "@/components/garage-notes/garage-note-card";
import GarageNoteDialog from "@/components/garage-notes/garage-note-dialog";
import { Button } from "@/components/ui/button";
import ProfileBackButton from "@/components/ui/profile-back-button";
import Pagination from "@/components/ui/pagination";
import { exportGarageNotesToPDF } from "@/lib/utils/pdf-export";

export default function GarageNotesPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { notes, loading, totalPages, currentPage, goToPage, createNote, updateNote, deleteNote, refetch } = useGarageNotes({}, 20, true);
  const { stats, loading: statsLoading } = useGarageNotesStats();
  const [showDialog, setShowDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<GarageNote | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Auth kontrolü
  if (!profileLoading && !profile) {
    router.push("/sign-in");
    return null;
  }

  async function handleSubmit(data: CreateGarageNoteData | UpdateGarageNoteData): Promise<void> {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, data as UpdateGarageNoteData);
        setEditingNote(null);
      } else {
        await createNote(data as CreateGarageNoteData);
      }
      refetch();
    } catch (error) {
      // Error handling zaten hook'ta yapılıyor
    }
  }

  async function handleDelete(id: string) {
    await deleteNote(id);
    refetch();
  }

  async function handleExportPDF() {
    if (!notes.length) {
      toast.error("Export edilecek not bulunamadı");
      return;
    }

    setExportingPDF(true);
    try {
      // Tüm notları almak için API'den çek
      const res = await fetch("/api/garage-notes?page=1&limit=1000", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Notlar yüklenemedi");
      }

      const data = await res.json();
      const allNotes = data.notes || [];

      const profileName = profile 
        ? `${profile.first_name} ${profile.last_name}`.trim() || profile.email
        : undefined;

      exportGarageNotesToPDF(
        allNotes,
        stats,
        profileName
      );
    } catch (error: any) {
      toast.error(error.message || "PDF oluşturulamadı");
    } finally {
      setExportingPDF(false);
    }
  }

  function handleEdit(note: GarageNote) {
    setEditingNote(note);
    setShowDialog(true);
  }

  function handleCloseDialog() {
    setShowDialog(false);
    setEditingNote(null);
  }

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-xl mx-auto px-3 sm:px-4 h-14 sm:h-12 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <ProfileBackButton />
            <h1 className="font-semibold text-sm sm:text-base truncate">Garaj Notlarım</h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {notes.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="h-9 sm:h-8 text-xs px-2 sm:px-3 min-w-[44px] sm:min-w-0"
              >
                {exportingPDF ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin sm:mr-1" />
                    <span className="hidden sm:inline">Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-3 sm:h-3 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">PDF İndir</span>
                  </>
                )}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowDialog(true)}
              className="h-9 sm:h-8 px-3 sm:px-4 text-xs sm:text-sm min-w-[44px] sm:min-w-0"
            >
              <span className="hidden sm:inline">+ Yeni Not</span>
              <span className="sm:hidden">+</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* İstatistikler */}
        {stats && !statsLoading && (
          <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-3">
            <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Toplam Harcama</p>
              <p className="text-base sm:text-lg font-semibold break-words">
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                  minimumFractionDigits: 0,
                }).format(stats.total_cost)}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Toplam Kayıt</p>
              <p className="text-base sm:text-lg font-semibold">{stats.total_notes}</p>
            </div>
            {stats.last_maintenance && (
              <div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Son Bakım</p>
                <p className="text-sm font-medium break-words">{stats.last_maintenance.title}</p>
                <p className="text-xs text-muted-foreground mt-1 break-words">
                  {new Date(stats.last_maintenance.date).toLocaleDateString("tr-TR")}
                  {stats.last_maintenance.mileage && ` • ${stats.last_maintenance.mileage.toLocaleString("tr-TR")} km`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notlar Listesi */}
        {notes.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">Henüz garaj notu eklenmemiş</p>
            <Button onClick={() => setShowDialog(true)} className="h-10 sm:h-9">İlk Notunu Ekle</Button>
          </div>
        ) : (
          <>
            <div className="space-y-2 sm:space-y-3">
              {notes.map((note) => (
                <GarageNoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 sm:mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Dialog */}
      <GarageNoteDialog
        open={showDialog}
        onOpenChange={handleCloseDialog}
        note={editingNote}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
