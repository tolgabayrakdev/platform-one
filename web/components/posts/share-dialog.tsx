"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { copyToClipboard } from "@/lib/utils/posts";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  text: string;
}

export default function ShareDialog({ open, onOpenChange, url, title, text }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await copyToClipboard(url);
      setCopied(true);
      setTimeout(() => {
        onOpenChange(false);
        setCopied(false);
      }, 1500);
    } catch {
      toast.error("Link kopyalanamadı");
    }
  }

  async function handleNativeShare() {
    if (typeof window === "undefined" || !("share" in navigator)) {
      toast.error("Paylaşım desteklenmiyor");
      return;
    }

    try {
      await navigator.share({ title, text, url });
      onOpenChange(false);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error("Paylaşım başarısız");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Paylaş</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          {/* Kopyala */}
          <button
            onClick={handleCopy}
            disabled={copied}
            className={`flex items-center justify-center gap-2.5 p-3 rounded-lg border transition-all ${
              copied
                ? "border-green-500/50 bg-green-500/10"
                : "border-border hover:bg-muted"
            } disabled:opacity-100`}
          >
            {copied ? (
              <>
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-green-600">Kopyalandı</span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Linki Kopyala</span>
              </>
            )}
          </button>

          {/* Native Share (sadece mobilde) */}
          {typeof window !== "undefined" && "share" in navigator && (
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2.5 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Diğer Uygulamalarla Paylaş</span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
