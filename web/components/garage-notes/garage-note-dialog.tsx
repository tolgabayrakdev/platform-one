"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GarageNote, CreateGarageNoteData, UpdateGarageNoteData, GARAGE_NOTE_TYPES } from "@/lib/types/garage-notes";

interface GarageNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: GarageNote | null;
  onSubmit: (data: CreateGarageNoteData | UpdateGarageNoteData) => Promise<void>;
}

export default function GarageNoteDialog({ open, onOpenChange, note, onSubmit }: GarageNoteDialogProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: "servis" as GarageNote["type"],
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    mileage: "",
    cost: "",
    service_location: "",
  });

  useEffect(() => {
    if (note) {
      setFormData({
        type: note.type,
        title: note.title,
        description: note.description || "",
        date: note.date.split("T")[0],
        mileage: note.mileage?.toString() || "",
        cost: note.cost?.toString() || "",
        service_location: note.service_location || "",
      });
    } else {
      setFormData({
        type: "servis",
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        mileage: "",
        cost: "",
        service_location: "",
      });
    }
  }, [note, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const data: CreateGarageNoteData | UpdateGarageNoteData = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        date: formData.date,
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        service_location: formData.service_location.trim() || undefined,
      };

      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      // Error toast zaten hook'ta gösteriliyor
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note ? "Garaj Notunu Düzenle" : "Yeni Garaj Notu"}</DialogTitle>
          <DialogDescription>Araç bakım kaydınızı ekleyin veya düzenleyin</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tip */}
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium">
              Tip
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as GarageNote["type"] })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              {GARAGE_NOTE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Başlık */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Başlık <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Örn: Periyodik Bakım"
              required
              minLength={3}
            />
          </div>

          {/* Tarih */}
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium">
              Tarih <span className="text-destructive">*</span>
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* KM ve Tutar - Yan yana */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="mileage" className="block text-sm font-medium">
                KM
              </label>
              <input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cost" className="block text-sm font-medium">
                Tutar (₺)
              </label>
              <input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          {/* Servis Yeri */}
          <div className="space-y-2">
            <label htmlFor="service_location" className="block text-sm font-medium">
              Servis Yeri/Kişi
            </label>
            <input
              id="service_location"
              type="text"
              value={formData.service_location}
              onChange={(e) => setFormData({ ...formData, service_location: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Örn: Oto Servis XYZ"
            />
          </div>

          {/* Açıklama */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Açıklama
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Detaylı bilgiler, notlar..."
            />
          </div>

          {/* Butonlar */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Kaydediliyor..." : note ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
