import { MetadataRoute } from 'next';

const API_URL = process.env.BACKEND_URL || 'http://localhost:1234';
const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://garajmuhabbet.com';

async function getLatestPosts() {
  try {
    const params = new URLSearchParams();
    params.set('scope', 'all');
    params.set('page', '1');
    params.set('limit', '1000'); // Son 1000 gönderiyi al

    const res = await fetch(`${API_URL}/api/posts?${params.toString()}`, {
      next: { revalidate: 3600 }, // 1 saat cache
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
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
  ];

  // Dinamik gönderi sayfaları
  const posts = await getLatestPosts();
  const postPages: MetadataRoute.Sitemap = posts.map((post: { id: string; created_at: string }) => ({
    url: `${baseUrl}/post/${post.id}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...postPages];
}
