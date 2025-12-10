import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

const API_URL = process.env.BACKEND_URL || 'http://localhost:1234';
const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://garajmuhabbet.com';

async function getLatestPosts() {
  try {
    // Tüm gönderileri almak için birden fazla sayfa çek
    const allPosts: any[] = [];
    let page = 1;
    const limit = 1000;
    let hasMore = true;

    while (hasMore && page <= 10) { // Maksimum 10 sayfa (10,000 gönderi)
      const params = new URLSearchParams();
      params.set('scope', 'all');
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const res = await fetch(`${API_URL}/api/posts?${params.toString()}`, {
        next: { revalidate: 3600 }, // 1 saat cache
      });

      if (!res.ok) break;
      
      const data = await res.json();
      const posts = data.posts || [];
      
      if (posts.length === 0) {
        hasMore = false;
      } else {
        allPosts.push(...posts);
        hasMore = data.pagination && data.pagination.page < data.pagination.totalPages;
        page++;
      }
    }

    return allPosts;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dinamik gönderi sayfaları
  const posts = await getLatestPosts();
  const postPages: MetadataRoute.Sitemap = posts.map((post: { id: string; created_at: string; category?: string }) => {
    // Kategoriye göre priority belirle
    let priority = 0.7;
    if (post.category === 'soru') priority = 0.9; // Sorular daha önemli (SEO için)
    else if (post.category === 'deneyim') priority = 0.8;
    else if (post.category === 'servis' || post.category === 'bakim') priority = 0.85;

    return {
      url: `${baseUrl}/post/${post.id}`,
      lastModified: new Date(post.created_at),
      changeFrequency: 'daily' as const,
      priority,
    };
  });

  // Blog yazıları
  const blogPosts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...postPages, ...blogPages];
}
