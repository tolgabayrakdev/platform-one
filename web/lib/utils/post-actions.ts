import { toast } from "sonner";
import { Post } from "@/lib/types/posts";
import { CATEGORY_LABELS } from "@/lib/constants/posts";
import { copyToClipboard } from "./posts";

export async function handleSharePost(e: React.MouseEvent, post: Post) {
  e.preventDefault();
  e.stopPropagation();

  const url = `${window.location.origin}/post/${post.id}`;
  const text = `${post.content.slice(0, 100)}${post.content.length > 100 ? "..." : ""}`;
  const category = CATEGORY_LABELS[post.category];
  const vehicle = post.vehicle ? ` - ${post.vehicle.brand} ${post.vehicle.model}` : "";
  const title = `${category?.emoji || ""} ${category?.label || "Gönderi"}${vehicle} | Garaj Muhabbet`;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        try {
          await copyToClipboard(url);
          toast.success("Link kopyalandı!");
        } catch {
          toast.error("Link kopyalanamadı");
        }
      }
    }
  } else {
    try {
      await copyToClipboard(url);
      toast.success("Link kopyalandı!");
    } catch {
      toast.error("Link kopyalanamadı");
    }
  }
}

export async function handleDeletePost(
  postId: string,
  posts: Post[],
  setPosts: (posts: Post[]) => void,
  setDeletingId: (id: string | null) => void
) {
  if (!confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;

  setDeletingId(postId);

  try {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Gönderi silinemedi");
    }

    setPosts(posts.filter((p) => p.id !== postId));
    toast.success("Gönderi silindi");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bir hata oluştu";
    toast.error(message);
  } finally {
    setDeletingId(null);
  }
}
