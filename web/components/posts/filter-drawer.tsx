"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CATEGORIES } from "@/lib/constants/posts";
import { City, Brand, Model } from "@/lib/types/posts";

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string;
  selectedCity: number | null;
  selectedBrand: number | null;
  selectedModel: number | null;
  cities?: City[];
  brands: Brand[];
  models: Model[];
  onCategoryChange: (category: string) => void;
  onCityChange: (city: number | null) => void;
  onBrandChange: (brand: number | null) => void;
  onModelChange: (model: number | null) => void;
  onClearAll: () => void;
  showCityFilter?: boolean;
}

export default function FilterDrawer({
  open,
  onOpenChange,
  selectedCategory,
  selectedCity,
  selectedBrand,
  selectedModel,
  cities = [],
  brands,
  models,
  onCategoryChange,
  onCityChange,
  onBrandChange,
  onModelChange,
  onClearAll,
  showCityFilter = false,
}: FilterDrawerProps) {
  const activeFilterCount = [
    selectedCategory,
    selectedCity,
    selectedBrand,
    selectedModel,
  ].filter(Boolean).length;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} noBodyStyles>
      <DrawerContent className="max-h-[70vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-base">Filtreler</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-5">
            {/* Kategori */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Kategori</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => onCategoryChange("")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    !selectedCategory
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  Tümü
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => onCategoryChange(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat.value
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

            {/* Konum - Sadece feed sayfasında */}
            {showCityFilter && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground">Konum</label>
                <select
                  value={selectedCity || ""}
                  onChange={(e) => onCityChange(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Tüm İller</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Marka ve Model */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Araç</label>

              {/* Marka */}
              <select
                value={selectedBrand || ""}
                onChange={(e) => onBrandChange(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Tüm Markalar</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>

              {/* Model */}
              {selectedBrand && (
                <select
                  value={selectedModel || ""}
                  onChange={(e) => onModelChange(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Tüm Modeller</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Aktif filtreler özeti */}
            {activeFilterCount > 0 && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{activeFilterCount} filtre aktif</span>
                  <button
                    onClick={onClearAll}
                    className="text-xs text-destructive hover:underline"
                  >
                    Tümünü Temizle
                  </button>
                </div>
              </div>
            )}

            {/* Uygula butonu */}
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full h-10 rounded-lg"
            >
              Uygula
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
