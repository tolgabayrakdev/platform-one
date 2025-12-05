import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import BackButton from "./back-button";

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
    neighborhood: string;
    district: string;
    city: string;
  };
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  kayip: { label: "Kayıp", emoji: "🔍", color: "bg-red-100 text-red-800" },
  yardim: { label: "Yardım", emoji: "🤝", color: "bg-blue-100 text-blue-800" },
  etkinlik: { label: "Etkinlik", emoji: "🎉", color: "bg-purple-100 text-purple-800" },
  ucretsiz: { label: "Ücretsiz", emoji: "🎁", color: "bg-green-100 text-green-800" },
  soru: { label: "Soru", emoji: "❓", color: "bg-yellow-100 text-yellow-800" },
};

const API_URL = process.env.BACKEND_URL || "http://localhost:1234";

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

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("access_token")?.value;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return { title: "İlan Bulunamadı | Mahalle" };
  }

  const category = CATEGORY_LABELS[post.category] || { label: post.category, emoji: "📌" };
  const title = `${category.emoji} ${category.label} - ${post.location.neighborhood} | Mahalle`;
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
  const post = await getPost(id);
  const loggedIn = await isAuthenticated();

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
          <span className="font-semibold">İlan</span>
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
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className={`text-xs px-2 py-0.5 rounded ${category.color}`}>
              {category.emoji} {category.label}
            </span>
            <span>·</span>
            <span>📍 {post.location.neighborhood}, {post.location.district}, {post.location.city}</span>
          </div>
        </article>

        {/* CTA - Giriş yapmamışlar için */}
        {!loggedIn && (
          <div className="px-4 py-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Bu mahallede neler oluyor görmek ister misin?
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
