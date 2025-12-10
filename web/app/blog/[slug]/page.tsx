import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://garajmuhabbet.com";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Yazısı Bulunamadı | Garaj Muhabbet",
    };
  }

  const title = `${post.title} | Garaj Muhabbet Blog`;
  const url = `${baseUrl}/blog/${slug}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description: post.description,
    keywords: [
      ...post.tags,
      "araç blog",
      "garaj muhabbet",
      post.category.toLowerCase(),
    ],
    authors: [{ name: post.author }],
    creator: post.author,
    publisher: "Garaj Muhabbet",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: post.description,
      type: "article",
      url,
      siteName: "Garaj Muhabbet",
      locale: "tr_TR",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: post.image || `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.description,
      images: [post.image || `${baseUrl}/og-image.jpg`],
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts (same category, exclude current post)
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  // If not enough related posts, get any other posts
  if (relatedPosts.length < 3) {
    const otherPosts = allPosts
      .filter((p) => p.slug !== slug && !relatedPosts.find((rp) => rp.slug === p.slug))
      .slice(0, 3 - relatedPosts.length);
    relatedPosts.push(...otherPosts);
  }

  // Structured Data - BlogPosting
  const blogPostStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "image": post.image || `${baseUrl}/og-image.jpg`,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author,
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
      "@id": `${baseUrl}/blog/${slug}`,
    },
    "articleSection": post.category,
    "keywords": post.tags.join(", "),
  };

  // Breadcrumb Structured Data
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
        "name": "Blog",
        "item": `${baseUrl}/blog`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `${baseUrl}/blog/${slug}`,
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
                href="/blog"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Blog'a Dön
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <article itemScope itemType="https://schema.org/BlogPosting">
            {/* Breadcrumb */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Ana Sayfa
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>/</li>
                <li className="text-foreground">{post.category}</li>
              </ol>
            </nav>

            {/* Header */}
            <header className="mb-8 md:mb-12">
              {/* Category */}
              <div className="mb-4">
                <span className="inline-block text-sm font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
                itemProp="headline"
              >
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span itemProp="author" itemScope itemType="https://schema.org/Person">
                    <span itemProp="name">{post.author}</span>
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <time dateTime={post.date} itemProp="datePublished">
                    {formatDate(post.date)}
                  </time>
                </div>
              </div>

              {/* Featured Image */}
              {post.image && (
                <div className="w-full h-64 md:h-96 lg:h-[500px] bg-muted rounded-xl overflow-hidden mb-8 shadow-lg">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={1200}
                    height={630}
                    className="w-full h-full object-cover"
                    itemProp="image"
                    priority
                  />
                </div>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${tag}`}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {/* Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none mb-12 prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-7 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-primary prose-blockquote:text-muted-foreground"
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* CTA Section */}
            <div className="my-12 p-6 md:p-8 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  Topluluğumuza Katılın!
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Bu yazıyı beğendiyseniz, binlerce araç sahibiyle birlikte deneyimlerinizi paylaşın.
                </p>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90"
                >
                  Ücretsiz Kayıt Ol
                </Link>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-16 pt-12 border-t border-border">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">İlgili Yazılar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.slug}
                      href={`/blog/${relatedPost.slug}`}
                      className="block"
                    >
                      <article className="h-full bg-card border border-border rounded-lg overflow-hidden">
                        {relatedPost.image && (
                          <div className="relative w-full h-40 overflow-hidden bg-muted">
                            <Image
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                              {relatedPost.category}
                            </span>
                            <time className="text-xs text-muted-foreground">
                              {formatDate(relatedPost.date)}
                            </time>
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relatedPost.description}
                          </p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Footer Navigation */}
            <footer className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center justify-center">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Tüm Blog Yazıları
                </Link>
              </div>
            </footer>
          </article>
        </main>
      </div>
    </>
  );
}
