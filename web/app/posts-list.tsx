"use client";

import Link from "next/link";
import PollCard from "@/components/poll-card";

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Location {
  city: string;
}

interface Vehicle {
  brand: string;
  model: string;
}

interface PollOption {
  id: number;
  option_text: string;
  option_order: number;
  vote_count: number;
  percentage: number;
}

interface Poll {
  id: string;
  question: string;
  created_at: string;
  options: PollOption[];
  total_votes: number;
  user_vote: number | null;
  has_voted: boolean;
}

interface Post {
  id: string;
  category: string;
  content: string;
  created_at: string;
  images?: Array<{ url: string; public_id: string }>;
  comment_count?: number;
  user: User;
  location: Location;
  vehicle: Vehicle | null;
  poll?: Poll | null;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  soru: { label: "Soru", emoji: "❓", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  yedek_parca: { label: "Yedek Parça", emoji: "🔧", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  servis: { label: "Servis", emoji: "🛠️", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  bakim: { label: "Bakım", emoji: "⚙️", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  deneyim: { label: "Deneyim", emoji: "💬", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  yardim: { label: "Yardım", emoji: "🤝", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  anket: { label: "Anket", emoji: "📊", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString("tr-TR");
}

export default function PostsList({ initialPosts }: { initialPosts: Post[] }) {
  if (initialPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Henüz gönderi yok</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {initialPosts.map((post) => {
        const category = CATEGORY_LABELS[post.category] || {
          label: post.category,
          emoji: "📌",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        };

        return (
          <article
            key={post.id}
            className="hover:bg-muted/30"
          >
            <Link href={`/post/${post.id}`} className="block px-4 py-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {post.user.first_name.charAt(0)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">
                      {post.user.first_name} {post.user.last_name}
                    </span>
                    <span className="text-muted-foreground text-sm">·</span>
                    <span className="text-muted-foreground text-sm">{formatDate(post.created_at)}</span>
                  </div>
                  
                  {post.location && (
                    <p className="text-xs text-muted-foreground mb-2">
                      📍 {post.location.city}
                    </p>
                  )}
                  
                  {post.vehicle && (
                    <p className="text-xs text-muted-foreground mb-2">
                      🚗 {post.vehicle.brand} {post.vehicle.model}
                    </p>
                  )}

                  <p className="text-sm mb-2 whitespace-pre-wrap">{post.content}</p>

                  {/* Anket */}
                  {post.category === "anket" && post.poll && (
                    <div onClick={(e) => e.preventDefault()} className="mb-2">
                      <PollCard
                        postId={post.id}
                        poll={post.poll}
                        isAuthenticated={false}
                      />
                    </div>
                  )}

                  {/* Resimler */}
                  {post.images && post.images.length > 0 && (
                    <div className={`mb-2 grid gap-1.5 ${
                      post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                    }`}>
                      {post.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Gönderi resmi ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-border"
                        />
                      ))}
                    </div>
                  )}

                  {/* Category + Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${category.color}`}>
                        {category.emoji} {category.label}
                      </span>
                      {post.comment_count !== undefined && post.comment_count > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post.comment_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
