import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://garajmuhabbet.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/sign-in',
          '/sign-up',
          '/onboarding',
          '/notifications',
          '/profile',
          '/home',
          '/my-posts',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/sign-in',
          '/sign-up',
          '/onboarding',
          '/notifications',
          '/profile',
          '/home',
          '/my-posts',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
