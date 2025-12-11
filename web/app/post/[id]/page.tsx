import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import BackButton from "./back-button";
import ShareDialogWrapper from "./share-dialog-wrapper";
import CommentsSection from "./comments-section";
import ImageGallery from "./image-gallery";
import PollSection from "./poll-section";

interface Post {
  id: string;
  category: string;
  content: string;
  images?: Array<{ url: string; public_id: string }>;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    badges?: {
      comment: string | null;
      post: string | null;
    };
  };
  location: {
    city: string;
  };
  vehicle: {
    brand: string;
    model: string;
  } | null;
  poll?: {
    id: string;
    question: string;
    created_at: string;
    options: Array<{
      id: number;
      option_text: string;
      option_order: number;
      vote_count: number;
      percentage: number;
    }>;
    total_votes: number;
    user_vote: number | null;
    has_voted: boolean;
  } | null;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  soru: { label: "Soru", emoji: "❓", color: "bg-blue-100 text-blue-800" },
  yedek_parca: { label: "Yedek Parça", emoji: "🔧", color: "bg-purple-100 text-purple-800" },
  servis: { label: "Servis", emoji: "🛠️", color: "bg-orange-100 text-orange-800" },
  bakim: { label: "Bakım", emoji: "⚙️", color: "bg-green-100 text-green-800" },
  deneyim: { label: "Deneyim", emoji: "💬", color: "bg-pink-100 text-pink-800" },
  yardim: { label: "Yardım", emoji: "🤝", color: "bg-yellow-100 text-yellow-800" },
  anket: { label: "Anket", emoji: "📊", color: "bg-indigo-100 text-indigo-800" },
};

// Rozet bilgileri
const BADGE_INFO: Record<string, { name: string; emoji: string }> = {
  bronze: { name: "Bronz", emoji: "🥉" },
  silver: { name: "Gümüş", emoji: "🥈" },
  gold: { name: "Altın", emoji: "🥇" },
  platinum: { name: "Platin", emoji: "💎" },
  diamond: { name: "Elmas", emoji: "💠" },
};

const API_URL = process.env.BACKEND_URL || "http://localhost:1234";
const baseUrl = process.env.NEXT_PUBLIC_URL || "https://garajmuhabbet.com";

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

async function getPost(id: string, accessToken?: string): Promise<Post | null> {
  try {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Cookie'] = `access_token=${accessToken}`;
    }

    const res = await fetch(`${API_URL}/api/posts/${id}`, {
      cache: "no-store",
      headers,
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

// SEO için optimize edilmiş başlık oluştur
function generateSEOTitle(post: Post): string {
  const category = CATEGORY_LABELS[post.category] || { label: post.category, emoji: "📌" };
  const parts: string[] = [];

  // Kategori
  parts.push(category.label);

  // Araç bilgisi (varsa)
  if (post.vehicle) {
    parts.push(`${post.vehicle.brand} ${post.vehicle.model}`);
  }

  // Şehir (varsa)
  if (post.location?.city) {
    parts.push(post.location.city);
  }

  // Ana başlık oluştur
  const mainTitle = parts.join(" - ");
  const title = `${mainTitle} | Garaj Muhabbet`;

  // Maksimum 60 karakter (SEO best practice)
  return title.length > 60 ? `${mainTitle.slice(0, 55)}... | Garaj Muhabbet` : title;
}

// SEO için optimize edilmiş açıklama oluştur
function generateSEODescription(post: Post): string {
  const parts: string[] = [];
  
  // İçerikten ilk 120 karakter
  const contentPreview = post.content
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  parts.push(contentPreview);

  // Araç bilgisi ekle
  if (post.vehicle) {
    parts.push(`${post.vehicle.brand} ${post.vehicle.model} hakkında`);
  }

  // Şehir bilgisi ekle
  if (post.location?.city) {
    parts.push(`${post.location.city} şehrinden`);
  }

  // Kategori bilgisi ekle
  const category = CATEGORY_LABELS[post.category];
  if (category) {
    parts.push(`${category.label.toLowerCase()} gönderisi`);
  }

  const description = parts.join(" - ");

  // Maksimum 160 karakter (meta description best practice)
  return description.length > 160 ? description.slice(0, 157) + "..." : description;
}

// SEO anahtar kelimeleri oluştur
function generateKeywords(post: Post): string[] {
  const keywords: string[] = [];
  
  // Kategori
  const category = CATEGORY_LABELS[post.category];
  if (category) {
    keywords.push(category.label.toLowerCase());
    keywords.push(`${category.label.toLowerCase()} araç`);
  }

  // Araç bilgisi
  if (post.vehicle) {
    keywords.push(post.vehicle.brand.toLowerCase());
    keywords.push(post.vehicle.model.toLowerCase());
    keywords.push(`${post.vehicle.brand} ${post.vehicle.model}`);
    keywords.push(`${post.vehicle.brand} ${post.vehicle.model} ${category?.label.toLowerCase() || ""}`);
  }

  // Şehir
  if (post.location?.city) {
    keywords.push(post.location.city.toLowerCase());
    keywords.push(`${post.location.city} araç`);
    if (post.vehicle) {
      keywords.push(`${post.location.city} ${post.vehicle.brand} ${post.vehicle.model}`);
    }
  }

  // Genel anahtar kelimeler
  keywords.push("araç forumu", "araç topluluğu", "garaj muhabbet", "araç soru cevap");

  return [...new Set(keywords)]; // Duplicate'leri kaldır
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return { title: "Gönderi Bulunamadı | Garaj Muhabbet" };
  }

  const title = generateSEOTitle(post);
  const description = generateSEODescription(post);
  const keywords = generateKeywords(post);
  const url = `${baseUrl}/post/${id}`;
  
  // Open Graph görseli - post'ta resim varsa ilk resmi kullan, yoksa default
  const ogImage = post.images && post.images.length > 0 
    ? post.images[0].url 
    : `${baseUrl}/og-image.jpg`;

  const category = CATEGORY_LABELS[post.category] || { label: post.category, emoji: "📌" };

  return {
    title,
    description,
    keywords,
    authors: [{ name: `${post.user.first_name} ${post.user.last_name}` }],
    creator: `${post.user.first_name} ${post.user.last_name}`,
    publisher: "Garaj Muhabbet",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      siteName: "Garaj Muhabbet",
      locale: "tr_TR",
      publishedTime: post.created_at,
      modifiedTime: post.created_at,
      authors: [`${post.user.first_name} ${post.user.last_name}`],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.vehicle 
            ? `${post.vehicle.brand} ${post.vehicle.model} - ${category.label}` 
            : `${category.label} - Garaj Muhabbet`,
        },
      ],
      section: category.label,
      tags: keywords,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  const [post, relatedPosts, loggedIn] = await Promise.all([
    getPost(id, accessToken),
    getRelatedPosts(id),
    isAuthenticated()
  ]);

  if (!post) {
    notFound();
  }

  const category = CATEGORY_LABELS[post.category] || { label: post.category, emoji: "📌", color: "bg-gray-100 text-gray-800" };

  // Structured Data (JSON-LD) için veri hazırla
  const structuredData = {
    "@context": "https://schema.org",
    "@type": post.category === "soru" ? "QAPage" : "Article",
    "headline": generateSEOTitle(post).replace(" | Garaj Muhabbet", ""),
    "description": generateSEODescription(post),
    "image": post.images && post.images.length > 0 
      ? post.images.map(img => img.url)
      : [`${baseUrl}/og-image.jpg`],
    "datePublished": post.created_at,
    "dateModified": post.created_at,
    "author": {
      "@type": "Person",
      "name": `${post.user.first_name} ${post.user.last_name}`,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Garaj Muhabbet",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/og-image.jpg`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/post/${post.id}`,
    },
    ...(post.vehicle && {
      "about": {
        "@type": "Product",
        "name": `${post.vehicle.brand} ${post.vehicle.model}`,
        "brand": {
          "@type": "Brand",
          "name": post.vehicle.brand,
        },
        "model": post.vehicle.model,
      },
    }),
    ...(post.location?.city && {
      "contentLocation": {
        "@type": "City",
        "name": post.location.city,
      },
    }),
  };

  // Breadcrumbs structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": baseUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Gönderiler",
        "item": `${baseUrl}/feed`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": category.label,
        "item": `${baseUrl}/post/${post.id}`,
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center gap-3">
          <BackButton />
          <span className="font-semibold">Gönderi</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto">
        <article className="px-4 py-4" itemScope itemType="https://schema.org/Article">
          {/* Hidden h1 for SEO */}
          <h1 className="sr-only">
            {post.vehicle 
              ? `${category.label} - ${post.vehicle.brand} ${post.vehicle.model} - ${post.location.city}` 
              : `${category.label} - ${post.location.city}`}
          </h1>
          
          {/* User */}
          <div className="flex items-center gap-3 mb-4" itemProp="author" itemScope itemType="https://schema.org/Person">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {post.user.first_name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-sm flex items-center gap-2">
                <span itemProp="name">{post.user.first_name} {post.user.last_name}</span>
                {/* Rozetler */}
                {post.user.badges?.post && BADGE_INFO[post.user.badges.post] && (
                  <span title={`${BADGE_INFO[post.user.badges.post].name} Gönderi Rozeti`} className="cursor-help">
                    {BADGE_INFO[post.user.badges.post].emoji}
                  </span>
                )}
                {post.user.badges?.comment && BADGE_INFO[post.user.badges.comment] && (
                  <span title={`${BADGE_INFO[post.user.badges.comment].name} Yorum Rozeti`} className="cursor-help">
                    {BADGE_INFO[post.user.badges.comment].emoji}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>

          {/* Content */}
          <div itemProp="articleBody" className="mb-4">
            <p className="text-base whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Anket */}
          {post.category === "anket" && post.poll && (
            <PollSection
              postId={post.id}
              poll={post.poll}
              isAuthenticated={loggedIn}
            />
          )}

          {/* Resimler */}
          {post.images && post.images.length > 0 && (
            <ImageGallery images={post.images} />
          )}

          {/* Meta */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded ${category.color}`} itemProp="articleSection">
                {category.emoji} {category.label}
              </span>
              <time itemProp="datePublished" dateTime={post.created_at} className="text-xs">
                {formatDate(post.created_at)}
              </time>
            </div>
            {post.vehicle && (
              <div className="flex items-center gap-2" itemProp="about" itemScope itemType="https://schema.org/Product">
                <span>🚗 <span itemProp="name">{post.vehicle.brand} {post.vehicle.model}</span></span>
                <meta itemProp="brand" content={post.vehicle.brand} />
                <meta itemProp="model" content={post.vehicle.model} />
              </div>
            )}
            {post.location?.city && (
              <div className="flex items-center gap-2" itemProp="contentLocation" itemScope itemType="https://schema.org/City">
                <span>📍 <span itemProp="name">{post.location.city}</span></span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-3 border-t border-border">
            <ShareDialogWrapper
              postId={post.id}
              title={`${category.emoji} ${category.label}${post.vehicle ? ` - ${post.vehicle.brand} ${post.vehicle.model}` : ""} | Garaj Muhabbet`}
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
    </>
  );
}
