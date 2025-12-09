import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://garajmuhabbet.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Tüm Gönderiler - Garaj Muhabbet | Araç Forumu ve Topluluk",
  description: "Türkiye'nin 81 ilinden araç sahiplerinin paylaştığı tüm gönderiler. Sorular, deneyimler, servis tavsiyeleri, yedek parça bilgileri ve daha fazlası. Marka, model ve şehre göre filtreleyin.",
  keywords: [
    "araç gönderileri",
    "araç forumu",
    "araç soruları",
    "araç deneyimleri",
    "araç servis tavsiyeleri",
    "yedek parça bilgileri",
    "araç bakım önerileri",
    "araç topluluk",
    "garaj muhabbet gönderiler",
    "araç paylaşımları",
    "Türkiye araç forumu",
    "81 il araç topluluğu",
  ],
  authors: [{ name: "Garaj Muhabbet" }],
  creator: "Garaj Muhabbet",
  publisher: "Garaj Muhabbet",
  alternates: {
    canonical: `${baseUrl}/feed`,
  },
  openGraph: {
    title: "Tüm Gönderiler - Garaj Muhabbet",
    description: "Araç sahiplerinin paylaştığı sorular, deneyimler ve tavsiyeler. Marka, model ve şehre göre filtreleyin.",
    type: "website",
    url: `${baseUrl}/feed`,
    siteName: "Garaj Muhabbet",
    locale: "tr_TR",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Garaj Muhabbet - Tüm Gönderiler",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tüm Gönderiler - Garaj Muhabbet",
    description: "Araç sahiplerinin paylaştığı sorular, deneyimler ve tavsiyeler.",
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
  category: "Automotive Community",
};

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured Data (JSON-LD) - CollectionPage
  const collectionPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Tüm Gönderiler - Garaj Muhabbet",
    "description": "Araç sahiplerinin paylaştığı tüm gönderiler, sorular, deneyimler ve tavsiyeler",
    "url": `${baseUrl}/feed`,
    "breadcrumb": {
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
          "name": "Tüm Gönderiler",
          "item": `${baseUrl}/feed`,
        },
      ],
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageStructuredData) }}
      />
      {children}
    </>
  );
}
