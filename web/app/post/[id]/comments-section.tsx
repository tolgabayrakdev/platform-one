"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string;
  isAuthenticated: boolean;
  postOwnerId?: string;
}

interface CommentItemProps {
  comment: Comment;
  depth: number;
  isAuthenticated: boolean;
  currentUserId: string | null;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: Record<string, string>;
  setReplyContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleReply: (commentId: string) => void;
  handleDelete: (commentId: string) => void;
  submittingReply: string | null;
  deletingId: string | null;
  formatDate: (dateStr: string) => string;
  setShowAllRepliesDialog?: (data: { commentId: string; replies: Comment[] } | null) => void;
}

// Recursive Comment Component
function CommentItem({
  comment,
  depth,
  isAuthenticated,
  currentUserId,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleReply,
  handleDelete,
  submittingReply,
  deletingId,
  formatDate,
  setShowAllRepliesDialog
}: CommentItemProps) {
  const isReply = depth > 0;
  const avatarSize = isReply ? "w-6 h-6" : "w-8 h-8";
  const textSize = isReply ? "text-xs" : "text-sm";
  const nameSize = isReply ? "text-xs" : "text-sm";
  const dateSize = isReply ? "text-[10px]" : "text-xs";
  const buttonSize = isReply ? "text-[10px]" : "text-xs";
  
  // Tüm reply'leri düz bir array'e çevir (recursive)
  function flattenReplies(replies: Comment[]): Comment[] {
    const result: Comment[] = [];
    replies.forEach((reply) => {
      result.push(reply);
      if (reply.replies && reply.replies.length > 0) {
        result.push(...flattenReplies(reply.replies));
      }
    });
    return result;
  }

  const allReplies = comment.replies ? flattenReplies(comment.replies) : [];
  const showMoreButton = allReplies.length > 3 && depth === 0;
  const visibleReplies = showMoreButton ? allReplies.slice(0, 3) : allReplies;
  const hiddenCount = allReplies.length - 3;

  return (
    <div className="space-y-2">
      {/* Ana Yorum */}
      <div className="flex gap-3">
        <div className={`${avatarSize} rounded-full bg-muted flex items-center justify-center ${isReply ? "text-[10px]" : "text-xs"} font-medium shrink-0`}>
          {comment.user.first_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`${nameSize} font-medium`}>
              {comment.user.first_name} {comment.user.last_name}
            </span>
            <span className={`${dateSize} text-muted-foreground`}>
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className={`${textSize} whitespace-pre-wrap`}>{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            {isAuthenticated && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className={`${buttonSize} text-primary hover:underline`}
              >
                {replyingTo === comment.id ? "İptal" : "Cevap Ver"}
              </button>
            )}
            {currentUserId === comment.user.id && (
              <button
                onClick={() => handleDelete(comment.id)}
                disabled={deletingId === comment.id}
                className={`${buttonSize} text-destructive hover:underline`}
              >
                {deletingId === comment.id ? "Siliniyor..." : "Sil"}
              </button>
            )}
          </div>
          
          {/* Cevap Formu */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <div className="flex gap-2">
                <textarea
                  value={replyContent[comment.id] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 500) {
                      setReplyContent((prev) => ({ ...prev, [comment.id]: value }));
                    }
                  }}
                  placeholder="Cevabınızı yazın..."
                  rows={2}
                  className={`flex-1 px-3 py-2 ${textSize} border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none`}
                />
                <button
                  onClick={() => handleReply(comment.id)}
                  disabled={submittingReply === comment.id || !replyContent[comment.id]?.trim() || (replyContent[comment.id]?.trim().length || 0) < 3}
                  className={`px-3 py-2 bg-primary text-primary-foreground ${textSize} rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-fit`}
                >
                  {submittingReply === comment.id ? "..." : "Gönder"}
                </button>
              </div>
              {replyContent[comment.id] && (
                <p className={`${dateSize} text-muted-foreground mt-1`}>
                  {(replyContent[comment.id] || "").length}/500
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reply'ler - Düz alt alta */}
      {visibleReplies.length > 0 && (
        <div className="ml-11 space-y-2">
          {visibleReplies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                {reply.user.first_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {reply.user.first_name} {reply.user.last_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(reply.created_at)}
                  </span>
                </div>
                <p className="text-xs whitespace-pre-wrap">{reply.content}</p>
                <div className="flex items-center gap-3 mt-1">
                  {isAuthenticated && (
                    <button
                      onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                      className="text-[10px] text-primary hover:underline"
                    >
                      {replyingTo === reply.id ? "İptal" : "Cevap Ver"}
                    </button>
                  )}
                  {currentUserId === reply.user.id && (
                    <button
                      onClick={() => handleDelete(reply.id)}
                      disabled={deletingId === reply.id}
                      className="text-[10px] text-destructive hover:underline"
                    >
                      {deletingId === reply.id ? "Siliniyor..." : "Sil"}
                    </button>
                  )}
                </div>
                
                {/* Reply'ye cevap formu */}
                {replyingTo === reply.id && (
                  <div className="mt-2">
                    <div className="flex gap-2">
                      <textarea
                        value={replyContent[reply.id] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 500) {
                            setReplyContent((prev) => ({ ...prev, [reply.id]: value }));
                          }
                        }}
                        placeholder="Cevabınızı yazın..."
                        rows={2}
                        className="flex-1 px-3 py-2 text-xs border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      />
                      <button
                        onClick={() => handleReply(reply.id)}
                        disabled={submittingReply === reply.id || !replyContent[reply.id]?.trim() || (replyContent[reply.id]?.trim().length || 0) < 3}
                        className="px-3 py-2 bg-primary text-primary-foreground text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed h-fit"
                      >
                        {submittingReply === reply.id ? "..." : "Gönder"}
                      </button>
                    </div>
                    {replyContent[reply.id] && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {(replyContent[reply.id] || "").length}/500
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* "Tümünü göster" butonu */}
          {showMoreButton && setShowAllRepliesDialog && (
            <button
              onClick={() => setShowAllRepliesDialog({ commentId: comment.id, replies: allReplies })}
              className="text-xs text-primary hover:underline font-medium"
            >
              {hiddenCount} yanıt daha göster
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CommentsSection({ postId, isAuthenticated, postOwnerId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [showAllRepliesDialog, setShowAllRepliesDialog] = useState<{ commentId: string; replies: Comment[] } | null>(null);
  const [showAllCommentsDialog, setShowAllCommentsDialog] = useState(false);

  useEffect(() => {
    fetchComments();
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, [postId, isAuthenticated]);

  // Bildirim sayısını güncellemek için window event listener
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateNotificationCount = () => {
      // Feed sayfasındaki bildirim sayısını güncelle
      window.dispatchEvent(new CustomEvent('updateNotificationCount'));
    };

    window.addEventListener('notificationRead', updateNotificationCount);
    return () => window.removeEventListener('notificationRead', updateNotificationCount);
  }, [isAuthenticated]);

  async function fetchCurrentUser() {
    try {
      const res = await fetch("/api/users/profile", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data.profile?.id || null);
      }
    } catch {
      // Hata yok say
    }
  }

  async function fetchComments() {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        
        // Tüm yorumları ve reply'leri düzleştir ve bildirimleri okundu olarak işaretle
        if (isAuthenticated) {
          const allCommentIds: string[] = [];
          function collectCommentIds(commentList: Comment[]) {
            commentList.forEach((comment) => {
              allCommentIds.push(comment.id);
              if (comment.replies && comment.replies.length > 0) {
                collectCommentIds(comment.replies);
              }
            });
          }
          collectCommentIds(data.comments || []);
          
          // Her yorum için bildirimi okundu olarak işaretle
          allCommentIds.forEach((commentId) => {
            markNotificationAsRead(commentId);
          });
        }
      }
    } catch {
      toast.error("Yorumlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function markNotificationAsRead(commentId: string) {
    try {
      const res = await fetch(`/api/notifications/comment/${commentId}/read`, {
        method: "PUT",
        credentials: "include",
      });
      
      if (res.ok) {
        // Bildirim sayısını güncelle
        window.dispatchEvent(new CustomEvent('notificationRead'));
      }
    } catch {
      // Hata yok say
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!newComment.trim() || newComment.trim().length < 3) {
      toast.error("Yorum en az 3 karakter olmalıdır");
      return;
    }

    if (newComment.length > 500) {
      toast.error("Yorum en fazla 500 karakter olabilir");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Yorum eklenemedi");
      }

      const data = await res.json();
      // Yeni yorumu ekle (replies array'i ile)
      setComments([...comments, { ...data.comment, replies: [] }]);
      setNewComment("");
      toast.success("Yorum eklendi");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bir hata oluştu";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;

    setDeletingId(commentId);

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Yorum silinemedi");
      }

      // Recursive olarak yorumu veya reply'yi sil
      function removeComment(comments: Comment[], idToRemove: string): Comment[] {
        return comments
          .filter((comment) => comment.id !== idToRemove)
          .map((comment) => {
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: removeComment(comment.replies, idToRemove)
              };
            }
            return comment;
          });
      }
      
      setComments((prev) => removeComment(prev, commentId));
      toast.success("Yorum silindi");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bir hata oluştu";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReply(commentId: string) {
    const content = replyContent[commentId]?.trim();
    if (!content || content.length < 3) {
      toast.error("Cevap en az 3 karakter olmalıdır");
      return;
    }

    if (content.length > 500) {
      toast.error("Cevap en fazla 500 karakter olabilir");
      return;
    }

    setSubmittingReply(commentId);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: content,
          parent_comment_id: commentId
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Cevap eklenemedi");
      }

      const data = await res.json();
      
      // Recursive olarak reply'yi ekle
      function addReplyToComment(comments: Comment[], parentId: string, newReply: Comment): Comment[] {
        return comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), { ...newReply, replies: [] }]
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies, parentId, newReply)
            };
          }
          return comment;
        });
      }
      
      setComments((prev) => addReplyToComment(prev, commentId, data.comment));

      setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
      setReplyingTo(null);
      toast.success("Cevap eklendi");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bir hata oluştu";
      toast.error(message);
    } finally {
      setSubmittingReply(null);
    }
  }

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

    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Recursive olarak yorum sayısını hesapla
  function countComments(commentList: Comment[]): number {
    return commentList.reduce((total, comment) => {
      return total + 1 + (comment.replies ? countComments(comment.replies) : 0);
    }, 0);
  }

  const totalCommentCount = countComments(comments);

  if (loading) {
    return (
      <div className="px-4 py-6 border-t border-border">
        <div className="flex justify-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="px-4 py-6 border-t border-border">
      <h2 className="text-sm font-semibold mb-4">
        💬 Yorumlar {totalCommentCount > 0 && `(${totalCommentCount})`}
      </h2>

      {/* Yorum Ekleme Formu */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setNewComment(value);
                }
              }}
              placeholder="Yorumunuzu yazın..."
              rows={2}
              className="flex-1 px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim() || newComment.trim().length < 3}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "..." : "Gönder"}
            </button>
          </div>
          {newComment.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {newComment.length}/500
            </p>
          )}
        </form>
      )}

      {/* Yorumlar Listesi */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Henüz yorum yok. İlk yorumu siz yapın!
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {comments.slice(0, 3).map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                isAuthenticated={isAuthenticated}
                currentUserId={currentUserId}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                handleReply={handleReply}
                handleDelete={handleDelete}
                submittingReply={submittingReply}
                deletingId={deletingId}
                formatDate={formatDate}
                setShowAllRepliesDialog={setShowAllRepliesDialog}
              />
            ))}
          </div>
          
          {/* Tüm Yorumları Göster Butonu */}
          {comments.length > 3 && (
            <button
              onClick={() => setShowAllCommentsDialog(true)}
              className="mt-4 text-sm text-primary hover:underline font-medium"
            >
              {comments.length - 3} yorum daha göster
            </button>
          )}
        </>
      )}

      {/* Tüm Reply'leri Göster Dialog */}
      {showAllRepliesDialog && (
        <Dialog open={!!showAllRepliesDialog} onOpenChange={() => setShowAllRepliesDialog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tüm Yanıtlar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {showAllRepliesDialog.replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                    {reply.user.first_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {reply.user.first_name} {reply.user.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                    {currentUserId === reply.user.id && (
                      <button
                        onClick={() => {
                          handleDelete(reply.id);
                          if (showAllRepliesDialog.replies.length === 1) {
                            setShowAllRepliesDialog(null);
                          }
                        }}
                        disabled={deletingId === reply.id}
                        className="text-xs text-destructive hover:underline mt-1"
                      >
                        {deletingId === reply.id ? "Siliniyor..." : "Sil"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Tüm Yorumları Göster Dialog */}
      {showAllCommentsDialog && (
        <Dialog open={showAllCommentsDialog} onOpenChange={setShowAllCommentsDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tüm Yorumlar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  isAuthenticated={isAuthenticated}
                  currentUserId={currentUserId}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleReply={handleReply}
                  handleDelete={handleDelete}
                  submittingReply={submittingReply}
                  deletingId={deletingId}
                  formatDate={formatDate}
                  setShowAllRepliesDialog={setShowAllRepliesDialog}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
