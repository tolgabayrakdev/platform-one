"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface Image {
  url: string;
  public_id: string;
}

interface ImageGalleryProps {
  images: Image[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Resimler Grid */}
      <div className={`mb-4 grid gap-2 ${
        images.length === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}>
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className="relative w-full h-64 group cursor-pointer"
          >
            <img
              src={img.url}
              alt={`Gönderi resmi ${idx + 1}`}
              className="w-full h-full object-cover rounded-lg border border-border transition-transform group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors" />
          </button>
        ))}
      </div>

      {/* Modal - Büyük Önizleme */}
      <Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none" showCloseButton={false}>
          <DialogTitle className="sr-only">
            Resim Önizleme - {selectedImage !== null ? `${selectedImage + 1} / ${images.length}` : ''}
          </DialogTitle>
          {selectedImage !== null && (
            <div className="relative">
              <img
                src={images[selectedImage].url}
                alt={`Gönderi resmi ${selectedImage + 1}`}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
              
              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/50 text-white text-sm rounded-full">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
