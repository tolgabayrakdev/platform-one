"use client";

import { useState } from "react";
import { GarageNote } from "@/lib/types/garage-notes";
import { GARAGE_NOTE_TYPE_LABELS } from "@/lib/types/garage-notes";
import { formatDate } from "@/lib/utils/posts";

interface GarageNoteCardProps {
  note: GarageNote;
  onEdit?: (note: GarageNote) => void;
  onDelete?: (id: string) => void;
}

export default function GarageNoteCard({ note, onEdit, onDelete }: GarageNoteCardProps) {
  const [deleting, setDeleting] = useState(false);
  const typeLabel = GARAGE_NOTE_TYPE_LABELS[note.type];

  function formatCurrency(amount: number | null) {
    if (!amount) return null;
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;

    setDeleting(true);
    try {
      await onDelete(note.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1">
          <span className={`text-xs px-2 py-0.5 rounded ${typeLabel.color}`}>
            {typeLabel.emoji} {typeLabel.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(note.date).toLocaleDateString("tr-TR")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(note)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-sm mb-1">{note.title}</h3>

      {note.description && (
        <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">{note.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {note.mileage !== null && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {note.mileage.toLocaleString("tr-TR")} km
          </span>
        )}
        {note.cost !== null && (
          <span className="flex items-center gap-1 font-medium text-foreground">
            💰 {formatCurrency(note.cost)}
          </span>
        )}
        {note.service_location && (
          <span className="flex items-center gap-1">
            📍 {note.service_location}
          </span>
        )}
      </div>

      {note.images && note.images.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {note.images.slice(0, 4).map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={`${note.title} - Resim ${idx + 1}`}
              className="w-full h-24 object-cover rounded border border-border"
            />
          ))}
        </div>
      )}
    </div>
  );
}
