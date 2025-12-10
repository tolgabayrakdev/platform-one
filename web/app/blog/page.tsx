import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";
import BlogTagLink from "@/components/blog-tag-link";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://garajmuhabbet.com";

const POSTS_PER_PAGE = 12;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Blog - Garaj Muhabbet | Araç Bakımı, Yedek Parça ve Servis Rehberleri",
  description: "Araç bakımı, yedek parça seçimi, servis tavsiyeleri ve araç sahipleri için faydalı rehberler. Uzman ipuçları ve deneyimler.",
  keywords: [
    "araç blog",
    "araç bakımı rehberi",
    "yedek parça rehberi",
    "servis tavsiyeleri",
    "araç ipuçları",
    "otomobil bakımı",
    "araç rehberleri",
    "garaj muhabbet blog",
  ],
  authors: [{ name: "Garaj Muhabbet" }],
  creator: "Garaj Muhabbet",
  publisher: "Garaj Muhabbet",
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    title: "Blog - Garaj Muhabbet",
    description: "Araç sahipleri için rehberler, ipuçları ve deneyimler.",
    type: "website",
    url: `${baseUrl}/blog`,
    siteName: "Garaj Muhabbet",
    locale: "tr_TR",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Garaj Muhabbet Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Garaj Muhabbet",
    description: "Araç sahipleri için rehberler, ipuçları ve deneyimler.",
    images: [`${baseUrl}/og-image.jpg`],
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Pagination({
  currentPage,
  totalPages,
  tag,
}: {
  currentPage: number;
  totalPages: number;
  tag?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (page > 1) params.set("page", page.toString());
    const query = params.toString();
    return query ? `/blog?${query}` : "/blog";
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-12">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-4 py-2 rounded-lg border border-border hover:bg-muted"
        >
          Önceki
        </Link>
      )}

      {startPage > 1 && (
        <>
          <Link
            href={getPageUrl(1)}
            className={`px-4 py-2 rounded-lg border border-border ${
              1 === currentPage ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            1
          </Link>
          {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`px-4 py-2 rounded-lg border border-border ${
            page === currentPage
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          {page}
        </Link>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
          <Link
            href={getPageUrl(totalPages)}
            className={`px-4 py-2 rounded-lg border border-border ${
              totalPages === currentPage
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-4 py-2 rounded-lg border border-border hover:bg-muted"
        >
          Sonraki
        </Link>
      )}
    </nav>
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const allPosts = getAllPosts();
  const params = await searchParams;
  const selectedTag = params.tag;
  
  // Tag'e göre filtrele
  let filteredPosts = allPosts;
  if (selectedTag) {
    filteredPosts = allPosts.filter((post) =>
      post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
    );
  }
  
  const currentPage = Number(params.page) || 1;
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = filteredPosts.slice(startIndex, endIndex);

  // Structured Data - Blog Collection
  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Garaj Muhabbet Blog",
    "description": "Araç sahipleri için rehberler, ipuçları ve deneyimler",
    "url": `${baseUrl}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "Garaj Muhabbet",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/og-image.jpg`,
      },
    },
    "blogPost": allPosts.map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "url": `${baseUrl}/blog/${post.slug}`,
      "datePublished": post.date,
      "author": {
        "@type": "Person",
        "name": post.author,
      },
      "publisher": {
        "@type": "Organization",
        "name": "Garaj Muhabbet",
      },
    })),
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogStructuredData) }}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14 md:h-16">
              <Link href="/" className="flex items-center gap-2 md:gap-3">
                <Image
                  src="/Garajmuhabbet.png"
                  alt="Garaj Muhabbet Logo"
                  width={32}
                  height={32}
                  className="w-6 h-6 md:w-8 md:h-8"
                  priority
                />
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Garaj Muhabbet
                </span>
              </Link>
              <Link
                href="/feed"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Gönderilere Dön →
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          {/* Hero Section */}
          <div className="mb-12 md:mb-16 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Blog
            </h1>
            {selectedTag ? (
              <div className="space-y-4">
                <p className="text-lg md:text-xl text-muted-foreground">
                  Etiket: <span className="font-semibold text-foreground">#{selectedTag}</span>
                </p>
                <Link
                  href="/blog"
                  className="inline-block text-sm text-primary hover:underline"
                >
                  ← Tüm yazıları göster
                </Link>
              </div>
            ) : (
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Araç bakımı, yedek parça seçimi, servis tavsiyeleri ve araç sahipleri için faydalı rehberler
              </p>
            )}
          </div>

          {allPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground text-lg">Henüz blog yazısı yok.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="flex flex-col bg-card border border-border rounded-xl overflow-hidden"
                  >
                    <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
                      {/* Image */}
                      {post.image ? (
                        <div className="relative w-full h-48 md:h-56 overflow-hidden bg-muted">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-primary/30"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 flex flex-col p-5 md:p-6">
                        {/* Category & Date */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                            {post.category}
                          </span>
                          <time className="text-xs text-muted-foreground">
                            {formatDate(post.date)}
                          </time>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl md:text-2xl font-bold mb-3 line-clamp-2">
                          {post.title}
                        </h2>

                        {/* Description */}
                        <p className="text-sm md:text-base text-muted-foreground mb-4 line-clamp-3 flex-1">
                          {post.description}
                        </p>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <BlogTagLink key={tag} tag={tag} />
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Read More */}
                        <div className="flex items-center text-sm font-medium text-primary">
                          <span>Devamını Oku</span>
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              <Pagination currentPage={currentPage} totalPages={totalPages} tag={selectedTag} />
            </>
          )}
        </main>
      </div>
    </>
  );
}
