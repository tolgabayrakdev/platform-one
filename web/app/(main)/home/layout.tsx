import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://garajmuhabbet.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Ana Sayfa - Garaj Muhabbet | Kişisel Araç Gönderileri",
  description: "Kişisel araç gönderilerinizi görüntüleyin ve yönetin. Takip ettiğiniz marka ve modellere göre filtrelenmiş gönderiler. Araç topluluğunuzla bağlantıda kalın.",
  keywords: [
    "kişisel gönderiler",
    "araç gönderilerim",
    "takip ettiğim araçlar",
    "araç forumu",
    "araç topluluk",
    "garaj muhabbet",
    "araç paylaşımları",
    "araç soruları",
    "araç deneyimleri",
  ],
  authors: [{ name: "Garaj Muhabbet" }],
  creator: "Garaj Muhabbet",
  publisher: "Garaj Muhabbet",
  alternates: {
    canonical: `${baseUrl}/home`,
  },
  openGraph: {
    title: "Ana Sayfa - Garaj Muhabbet",
    description: "Kişisel araç gönderilerinizi görüntüleyin ve yönetin. Takip ettiğiniz marka ve modellere göre filtrelenmiş gönderiler.",
    type: "website",
    url: `${baseUrl}/home`,
    siteName: "Garaj Muhabbet",
    locale: "tr_TR",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Garaj Muhabbet - Ana Sayfa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ana Sayfa - Garaj Muhabbet",
    description: "Kişisel araç gönderilerinizi görüntüleyin ve yönetin.",
    images: [`${baseUrl}/og-image.jpg`],
  },
  robots: {
    index: false, // Kişisel sayfa olduğu için indexlenmemeli
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Automotive Community",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured Data (JSON-LD) - CollectionPage
  const collectionPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Ana Sayfa - Garaj Muhabbet",
    "description": "Kişisel araç gönderileri ve takip edilen içerikler",
    "url": `${baseUrl}/home`,
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
          "name": "Kişisel Gönderiler",
          "item": `${baseUrl}/home`,
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
