"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CATEGORIES = [
  { value: "satilik", label: "Satılık", emoji: "💰" },
  { value: "kiralik", label: "Kiralık", emoji: "🔑" },
  { value: "yedek_parca", label: "Yedek Parça", emoji: "🔧" },
  { value: "aksesuar", label: "Aksesuar", emoji: "🎨" },
  { value: "servis", label: "Servis", emoji: "🛠️" },
];

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
}

export default function CreatePostDialog({ open, onClose, onCreated }: CreatePostDialogProps) {
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);

  // Markaları yükle
  useEffect(() => {
    if (open) {
      async function fetchBrands() {
        try {
          const res = await fetch("/api/locations/brands");
          if (res.ok) {
            const data = await res.json();
            setBrands(data.brands);
          }
        } catch {
          // Hata yok say
        }
      }
      fetchBrands();
    }
  }, [open]);

  // Marka değiştiğinde modelleri yükle
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      setSelectedModel(null);
      return;
    }

    async function fetchModels() {
      try {
        const res = await fetch(`/api/locations/models/${selectedBrand}`);
        if (res.ok) {
          const data = await res.json();
          setModels(data.models);
        }
      } catch {
        // Hata yok say
      }
    }

    fetchModels();
    setSelectedModel(null);
  }, [selectedBrand]);

  // Drawer kapandığında formu temizle
  useEffect(() => {
    if (!open) {
      setCategory("");
      setContent("");
      setSelectedBrand(null);
      setSelectedModel(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!category) {
      toast.error("Lütfen kategori seçin");
      return;
    }

    if (!selectedBrand) {
      toast.error("Lütfen marka seçin");
      return;
    }

    if (!selectedModel) {
      toast.error("Lütfen model seçin");
      return;
    }

    if (!content || content.trim().length < 10) {
      toast.error("Gönderi içeriği en az 10 karakter olmalıdır");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          category, 
          content: content.trim(),
          brandId: selectedBrand,
          modelId: selectedModel
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gönderi oluşturulamadı");
      }

      toast.success("Gönderi paylaşıldı!");
      onCreated();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bir hata oluştu";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer 
      open={open} 
      onOpenChange={(isOpen) => !isOpen && !saving && onClose()}
      noBodyStyles
    >
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-base">Yeni Gönderi</DrawerTitle>
          </DrawerHeader>

        {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-4">
          {/* Kategori Seçimi */}
          <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground">Kategori</label>
              <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    category === cat.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                  }`}
                >
                    <span className="mr-1">{cat.emoji}</span>
                    {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Marka ve Model */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-muted-foreground">Araç</label>
            
            {/* Marka */}
            <select
              value={selectedBrand || ""}
              onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Marka seçin</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>

            {/* Model */}
            {selectedBrand && (
              <select
                value={selectedModel || ""}
                onChange={(e) => setSelectedModel(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Model seçin</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* İçerik */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground">İçerik</label>
                <span className={`text-xs font-medium ${
                  content.length >= 500 
                    ? "text-destructive" 
                    : content.length >= 450 
                      ? "text-yellow-600" 
                      : "text-muted-foreground"
                }`}>
                  {content.length}/500
                  {content.length >= 500 && " (limit)"}
              </span>
              </div>
            <textarea
              value={content}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 500) {
                    setContent(value);
                  }
                }}
                placeholder="Araç hakkında detayları yazın..."
              rows={4}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 resize-none transition-colors ${
                  content.length >= 500 
                    ? "border-destructive focus:ring-destructive" 
                    : "border-input focus:ring-ring"
                }`}
              />
              {content.length >= 450 && content.length < 500 && (
                <p className="text-xs text-yellow-600">⚠️ Karakter sınırına yaklaşıyorsunuz</p>
              )}
              {content.length >= 500 && (
                <p className="text-xs text-destructive">⛔ Maksimum 500 karakter girebilirsiniz</p>
              )}
          </div>

          {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="flex-1 h-10 rounded-lg text-sm"
              >
              İptal
            </Button>
              <Button
                type="submit"
                disabled={saving || !category || !selectedBrand || !selectedModel || content.trim().length < 10}
                className="flex-1 h-10 rounded-lg text-sm"
              >
              {saving ? "Paylaşılıyor..." : "Paylaş"}
            </Button>
          </div>
        </form>
      </div>
      </DrawerContent>
    </Drawer>
  );
}
