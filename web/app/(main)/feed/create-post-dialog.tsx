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
  { value: "soru", label: "Soru", emoji: "❓" },
  { value: "yedek_parca", label: "Yedek Parça", emoji: "🔧" },
  { value: "servis", label: "Servis", emoji: "🛠️" },
  { value: "bakim", label: "Bakım", emoji: "⚙️" },
  { value: "deneyim", label: "Deneyim", emoji: "💬" },
  { value: "yardim", label: "Yardım", emoji: "🤝" },
  { value: "anket", label: "Anket", emoji: "📊" },
];

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
}

interface ImageFile {
  file: File;
  preview: string;
  url?: string;
  public_id?: string;
}

export default function CreatePostDialog({ open, onClose, onCreated }: CreatePostDialogProps) {
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Anket seçenekleri
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const isPollCategory = category === "anket";

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
      setPollOptions(["", ""]);
      // Resim preview'larını temizle
      images.forEach((img) => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      setImages([]);
    }
  }, [open]);

  // Resim seçme
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const newFiles: ImageFile[] = [];
    const remainingSlots = 2 - images.length;

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newFiles.push({
          file,
          preview: URL.createObjectURL(file)
        });
      }
    }

    if (newFiles.length === 0) {
      toast.error("Lütfen geçerli bir resim dosyası seçin");
      return;
    }

    if (images.length + newFiles.length > 2) {
      toast.error("En fazla 2 resim ekleyebilirsiniz");
      return;
    }

    setImages([...images, ...newFiles]);
    e.target.value = ""; // Reset input
  }

  // Resim silme
  function handleRemoveImage(index: number) {
    const newImages = [...images];
    if (newImages[index].preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    newImages.splice(index, 1);
    setImages(newImages);
  }

  // Resimleri Cloudinary'ye yükle
  async function uploadImages(): Promise<Array<{ url: string; public_id: string }>> {
    if (images.length === 0) return [];

    setUploadingImages(true);
    try {
      const formData = new FormData();
      images.forEach((img) => {
        formData.append('images', img.file);
      });

      const res = await fetch("/api/upload/images", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Resimler yüklenemedi");
      }

      const data = await res.json();
      return data.images;
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!category) {
      toast.error("Lütfen kategori seçin");
      return;
    }

    // Anket değilse marka/model zorunlu
    if (category !== "anket") {
      if (!selectedBrand) {
        toast.error("Lütfen marka seçin");
        return;
      }

      if (!selectedModel) {
        toast.error("Lütfen model seçin");
        return;
      }
    }

    if (!content || content.trim().length < 10) {
      toast.error("Gönderi içeriği en az 10 karakter olmalıdır");
      return;
    }

    // Anket kategorisi ise seçenek kontrolü
    if (category === "anket") {
      const validOptions = pollOptions.filter(opt => opt.trim().length > 0);
      if (validOptions.length < 2) {
        toast.error("Anket için en az 2 seçenek gereklidir");
        return;
      }
    }

    setSaving(true);

    try {
      // Önce resimleri yükle (anket değilse)
      const uploadedImages = category !== "anket" ? await uploadImages() : [];

      // Onra gönderiyi oluştur
      const requestBody: Record<string, unknown> = {
        category,
        content: content.trim(),
        brandId: selectedBrand,
        modelId: selectedModel,
        images: uploadedImages
      };

      // Anket ise seçenekleri ekle
      if (category === "anket") {
        requestBody.pollOptions = pollOptions.filter(opt => opt.trim().length > 0);
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gönderi oluşturulamadı");
      }

      toast.success(category === "anket" ? "Anket paylaşıldı!" : "Gönderi paylaşıldı!");
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
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="pb-2 px-4">
          <DrawerTitle className="text-base">Yeni Gönderi</DrawerTitle>
        </DrawerHeader>

        <div className="mx-auto w-full max-w-md flex flex-col flex-1 min-h-0">
          {/* Form Container - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4">
            {/* Form */}
            <form onSubmit={handleSubmit} id="post-form" className="space-y-4 pb-4">
            {/* Kategori Seçimi */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground">Kategori</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat.value
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

            {/* Marka ve Model - Anket değilse */}
            {!isPollCategory && (
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
            )}

            {/* Anket Seçenekleri - Sadece anket kategorisinde */}
            {isPollCategory && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Seçenekler (2-5 arası)
                  </label>
                  <span className="text-xs text-muted-foreground">{pollOptions.filter(o => o.trim()).length}/5</span>
                </div>
                <div className="space-y-2">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[index] = e.target.value;
                          setPollOptions(newOptions);
                        }}
                        placeholder={`Seçenek ${index + 1}`}
                        maxLength={200}
                        className="flex-1 px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = pollOptions.filter((_, i) => i !== index);
                            setPollOptions(newOptions);
                          }}
                          className="px-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollOptions.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Seçenek Ekle
                  </button>
                )}
              </div>
            )}

            {/* Resim Yükleme - Anket değilse */}
            {!isPollCategory && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-muted-foreground">
                  Resimler (En fazla 2)
                </label>

                {/* Resim Önizlemeleri */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Resim Ekleme Butonu */}
                {images.length < 2 && (
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-input rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm text-muted-foreground">
                      {images.length === 0 ? "Resim Ekle" : "1 Resim Daha Ekle"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* İçerik */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-muted-foreground">İçerik</label>
                <span className={`text-xs font-medium ${content.length >= 500
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
                placeholder="Sorunuzu, deneyiminizi veya paylaşmak istediğiniz bilgiyi yazın..."
                rows={4}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 resize-none transition-colors ${content.length >= 500
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
            </form>
          </div>

          {/* Buttons - Fixed at bottom */}
          <div className="flex-shrink-0 flex gap-2 px-4 py-4 border-t border-border bg-background">
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
              disabled={
                saving ||
                uploadingImages ||
                !category ||
                content.trim().length < 10 ||
                (category !== "anket" && (!selectedBrand || !selectedModel)) ||
                (category === "anket" && pollOptions.filter(o => o.trim()).length < 2)
              }
              className="flex-1 h-10 rounded-lg text-sm"
              form="post-form"
            >
              {saving || uploadingImages ? "Paylaşılıyor..." : "Paylaş"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
