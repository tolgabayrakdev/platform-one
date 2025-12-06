import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import BackButton from "./back-button";
import ShareButton from "./share-button";
import CommentsSection from "./comments-section";

interface Post {
  id: string;
  category: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
  location: {
    city: string;
  };
  vehicle: {
    brand: string;
    model: string;
  };
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  satilik: { label: "Satılık", emoji: "💰", color: "bg-green-100 text-green-800" },
  kiralik: { label: "Kiralık", emoji: "🔑", color: "bg-blue-100 text-blue-800" },
  yedek_parca: { label: "Yedek Parça", emoji: "🔧", color: "bg-purple-100 text-purple-800" },
  aksesuar: { label: "Aksesuar", emoji: "🎨", color: "bg-pink-100 text-pink-800" },
  servis: { label: "Servis", emoji: "🛠️", color: "bg-orange-100 text-orange-800" },
};

const API_URL = process.env.BACKEND_URL || "http://localhost:1234";

interface RelatedPost {
  id: string;
  category: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/api/posts/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post;
  } catch {
    return null;
  }
}

async function getRelatedPosts(id: string): Promise<RelatedPost[]> {
  try {
    const res = await fetch(`${API_URL}/api/posts/${id}/related?limit=3`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch {
    return [];
  }
}

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("access_token")?.value;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return { title: "Gönderi Bulunamadı | Araç Platformu" };
  }

  const category = CATEGORY_LABELS[post.category] || { label: post.category, emoji: "📌" };
  const vehicle = post.vehicle ? `${post.vehicle.brand} ${post.vehicle.model}` : "";
  const title = `${category.emoji} ${category.label}${vehicle ? ` - ${vehicle}` : ""} | Araç Platformu`;
  const description = post.content.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.created_at,
      authors: [`${post.user.first_name} ${post.user.last_name}`],
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, relatedPosts, loggedIn] = await Promise.all([
    getPost(id),
    getRelatedPosts(id),
    isAuthenticated()
  ]);

  if (!post) {
    notFound();
  }

  const category = CATEGORY_LABELS[post.category] || { label: post.category, emoji: "📌", color: "bg-gray-100 text-gray-800" };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-xl mx-auto px-4 h-12 flex items-center gap-3">
          <BackButton />
          <span className="font-semibold">Gönderi</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto">
        <article className="px-4 py-4">
          {/* User */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {post.user.first_name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-sm">
                {post.user.first_name} {post.user.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>

          {/* Content */}
          <p className="text-base whitespace-pre-wrap mb-4">{post.content}</p>

          {/* Meta */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded ${category.color}`}>
                {category.emoji} {category.label}
              </span>
            </div>
            {post.vehicle && (
              <div className="flex items-center gap-2">
                <span>🚗 {post.vehicle.brand} {post.vehicle.model}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span>📍 {post.location.city}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-3 border-t border-border">
            <ShareButton 
              postId={post.id}
              title={`${category.emoji} ${category.label}${post.vehicle ? ` - ${post.vehicle.brand} ${post.vehicle.model}` : ""} | Araç Platformu`}
              text={post.content.slice(0, 100) + (post.content.length > 100 ? "..." : "")}
            />
          </div>
        </article>

        {/* Yorumlar */}
        <CommentsSection postId={post.id} isAuthenticated={loggedIn} postOwnerId={post.user.id} />

        {/* Benzer Araçlar - Benzer Gönderiler */}
        {relatedPosts.length > 0 && (
          <section className="px-4 py-6 border-t border-border">
            <h2 className="text-sm font-semibold mb-4">🚗 Benzer Araçlar</h2>
            <div className="space-y-3">
              {relatedPosts.map((relatedPost) => {
                const relatedCategory = CATEGORY_LABELS[relatedPost.category] || { label: relatedPost.category, emoji: "📌", color: "bg-gray-100 text-gray-800" };
                return (
                  <Link
                    key={relatedPost.id}
                    href={`/post/${relatedPost.id}`}
                    className="block p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                        {relatedPost.user.first_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {relatedPost.user.first_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(relatedPost.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.content}
                        </p>
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${relatedCategory.color}`}>
                          {relatedCategory.emoji} {relatedCategory.label}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA - Giriş yapmamışlar için */}
        {!loggedIn && (
          <div className="px-4 py-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Araç gönderilerini görmek ve gönderi paylaşmak ister misin?
            </p>
            <Link
              href="/sign-up"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg"
            >
              Katıl
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
