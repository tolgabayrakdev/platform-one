"use client";

import { useRouter } from "next/navigation";

export default function BlogTagLink({ tag }: { tag: string }) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <button
      onClick={handleClick}
      className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
    >
      #{tag}
    </button>
  );
}
