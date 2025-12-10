"use client";

import { useState } from "react";
import Link from "next/link";
import { useGarageNotes, useGarageNotesStats } from "@/hooks/use-garage-notes";
import GarageNoteCard from "@/components/garage-notes/garage-note-card";
import { Button } from "@/components/ui/button";

export default function GarageNotesSection() {
  const { notes, loading } = useGarageNotes({}, 3); // İlk 3 notu göster
  const { stats } = useGarageNotesStats();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="mb-8 p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-medium text-sm">Garaj Notlarım</span>
          </div>
        </div>
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const displayNotes = expanded ? notes : notes.slice(0, 3);
  const hasMore = notes.length > 3;

  return (
    <div className="mb-8 p-4 bg-muted/30 rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-medium text-sm">Garaj Notları</span>
          {stats && stats.total_notes > 0 && (
            <span className="text-xs text-muted-foreground">({stats.total_notes})</span>
          )}
        </div>
        <Link href="/profile/garage-notes">
          <Button size="sm" variant="ghost" className="h-7 text-xs">
            Tümünü Gör
          </Button>
        </Link>
      </div>

      {/* İstatistikler */}
      {stats && stats.total_notes > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 bg-background/50 rounded border border-border/50">
            <p className="text-[10px] text-muted-foreground mb-0.5">Toplam Harcama</p>
            <p className="text-xs font-semibold">
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
                minimumFractionDigits: 0,
              }).format(stats.total_cost)}
            </p>
          </div>
          {stats.last_maintenance && (
            <div className="p-2 bg-background/50 rounded border border-border/50">
              <p className="text-[10px] text-muted-foreground mb-0.5">Son Bakım</p>
              <p className="text-xs font-semibold truncate">{stats.last_maintenance.title}</p>
            </div>
          )}
        </div>
      )}

      {/* Notlar */}
      {notes.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-2xl mb-2">📝</p>
          <p className="text-xs text-muted-foreground mb-3">Henüz garaj notu eklenmemiş</p>
          <Link href="/profile/garage-notes">
            <Button size="sm" className="h-7 text-xs">
              İlk Notunu Ekle
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {displayNotes.map((note) => (
              <div key={note.id} className="scale-95">
                <GarageNoteCard note={note} />
              </div>
            ))}
          </div>
          {hasMore && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {notes.length - 3} not daha göster
            </button>
          )}
          {expanded && hasMore && (
            <button
              onClick={() => setExpanded(false)}
              className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Daha az göster
            </button>
          )}
        </>
      )}
    </div>
  );
}
