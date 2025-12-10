"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import { useGarageNotes, useGarageNotesStats } from "@/hooks/use-garage-notes";
import { GarageNote, CreateGarageNoteData, UpdateGarageNoteData } from "@/lib/types/garage-notes";
import GarageNoteCard from "@/components/garage-notes/garage-note-card";
import GarageNoteDialog from "@/components/garage-notes/garage-note-dialog";
import { Button } from "@/components/ui/button";
import ProfileBackButton from "@/components/ui/profile-back-button";

export default function GarageNotesPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const { notes, loading, hasMore, loadMore, createNote, updateNote, deleteNote } = useGarageNotes();
  const { stats, loading: statsLoading } = useGarageNotesStats();
  const [showDialog, setShowDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<GarageNote | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastNoteRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll
  const lastNoteElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

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
    } catch (error) {
      // Error handling zaten hook'ta yapılıyor
    }
  }

  async function handleDelete(id: string) {
    await deleteNote(id);
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
        <div className="max-w-xl mx-auto px-4 h-12 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ProfileBackButton />
            <h1 className="font-semibold text-base">Garaj Notları</h1>
          </div>
          <Button
            size="sm"
            onClick={() => setShowDialog(true)}
            className="h-8"
          >
            + Yeni Not
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto px-4 py-6">
        {/* İstatistikler */}
        {stats && !statsLoading && (
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Toplam Harcama</p>
              <p className="text-lg font-semibold">
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                  minimumFractionDigits: 0,
                }).format(stats.total_cost)}
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Toplam Kayıt</p>
              <p className="text-lg font-semibold">{stats.total_notes}</p>
            </div>
            {stats.last_maintenance && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Son Bakım</p>
                <p className="text-sm font-medium">{stats.last_maintenance.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(stats.last_maintenance.date).toLocaleDateString("tr-TR")}
                  {stats.last_maintenance.mileage && ` • ${stats.last_maintenance.mileage.toLocaleString("tr-TR")} km`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notlar Listesi */}
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-muted-foreground mb-4">Henüz garaj notu eklenmemiş</p>
            <Button onClick={() => setShowDialog(true)}>İlk Notunu Ekle</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note, index) => (
              <div
                key={note.id}
                ref={index === notes.length - 1 ? lastNoteElementRef : null}
              >
                <GarageNoteCard
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
            {hasMore && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
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
