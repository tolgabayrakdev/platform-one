"use client";

import Link from "next/link";
import { Post, Profile } from "@/lib/types/posts";
import { CATEGORY_LABELS, BADGE_INFO } from "@/lib/constants/posts";
import { formatDate } from "@/lib/utils/posts";
import PollCard from "@/components/poll-card";

interface PostCardProps {
  post: Post;
  profile: Profile | null;
  isLast?: boolean;
  lastPostRef?: (node: HTMLElement | null) => void;
  deletingId?: string | null;
  onDelete?: (postId: string) => void;
  onShare?: (e: React.MouseEvent, post: Post) => void;
  onPollVote?: (postId: string, updatedPoll: any) => void;
}

export default function PostCard({
  post,
  profile,
  isLast = false,
  lastPostRef,
  deletingId = null,
  onDelete,
  onShare,
  onPollVote,
}: PostCardProps) {
  const category = CATEGORY_LABELS[post.category] || {
    label: post.category,
    emoji: "📌",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  };

  return (
    <article
      ref={isLast ? lastPostRef : null}
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
              {/* Rozetler */}
              {post.user.badges?.post && BADGE_INFO[post.user.badges.post] && (
                <span
                  title={`${BADGE_INFO[post.user.badges.post].name} Gönderi Rozeti`}
                  className="cursor-help text-sm"
                >
                  {BADGE_INFO[post.user.badges.post].emoji}
                </span>
              )}
              {post.user.badges?.comment && BADGE_INFO[post.user.badges.comment] && (
                <span
                  title={`${BADGE_INFO[post.user.badges.comment].name} Yorum Rozeti`}
                  className="cursor-help text-sm"
                >
                  {BADGE_INFO[post.user.badges.comment].emoji}
                </span>
              )}
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
              <div onClick={(e) => e.preventDefault()}>
                <PollCard
                  postId={post.id}
                  poll={post.poll}
                  isAuthenticated={!!profile}
                  onVote={(updatedPoll) => {
                    if (onPollVote) {
                      onPollVote(post.id, updatedPoll);
                    }
                  }}
                />
              </div>
            )}

            {/* Resimler */}
            {post.images && post.images.length > 0 && (
              <div className={`mb-2 grid gap-1.5 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
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

              <div className="flex items-center gap-3">
                {/* Paylaş */}
                {onShare && (
                  <button
                    onClick={(e) => onShare(e, post)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                )}

                {/* Sil (sadece kendi gönderileri) */}
                {post.user.id === profile?.id && onDelete && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(post.id);
                    }}
                    disabled={deletingId === post.id}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {deletingId === post.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
