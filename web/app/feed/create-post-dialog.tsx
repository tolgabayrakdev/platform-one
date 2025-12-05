"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CATEGORIES = [
  { value: "kayip", label: "Kayıp / Bulundu", emoji: "🔍" },
  { value: "yardim", label: "Yardım", emoji: "🤝" },
  { value: "etkinlik", label: "Etkinlik", emoji: "🎉" },
  { value: "ucretsiz", label: "Ücretsiz Eşya", emoji: "🎁" },
  { value: "soru", label: "Soru / Bilgi", emoji: "❓" },
];

export default function CreatePostDialog({ open, onClose, onCreated }: CreatePostDialogProps) {
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!category) {
      toast.error("Lütfen kategori seçin");
      return;
    }

    if (!content || content.trim().length < 10) {
      toast.error("İlan içeriği en az 10 karakter olmalıdır");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ category, content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "İlan oluşturulamadı");
      }

      toast.success("İlan paylaşıldı!");
      setCategory("");
      setContent("");
      onCreated();
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    setCategory("");
    setContent("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 bg-background border border-border rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Yeni İlan</h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Kategori Seçimi */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Kategori</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    category === cat.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-lg mr-2">{cat.emoji}</span>
                  <span className="text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* İçerik */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              İçerik
              <span className="text-muted-foreground font-normal ml-2">
                ({content.length}/500)
              </span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              placeholder="İlanınızı yazın..."
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving} className="flex-1">
              İptal
            </Button>
            <Button type="submit" disabled={saving || !category || content.trim().length < 10} className="flex-1">
              {saving ? "Paylaşılıyor..." : "Paylaş"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
