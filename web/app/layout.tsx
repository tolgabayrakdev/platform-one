import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://garajmuhabbet.com";
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Garaj Muhabbet - Araç Sahipleri Topluluğu",
  description: "Türkiye'nin 81 ilinden araç sahiplerinin bir araya geldiği topluluk platformu. Araçlarınız hakkında sorular sorun, deneyimlerinizi paylaşın, yardımlaşın.",
  keywords: [
    "araç forumu",
    "araç sahipleri topluluğu",
    "araç soru cevap",
    "araç yardımlaşma",
    "yedek parça soru",
    "araç servis tavsiye",
    "araç bakım önerileri",
    "Türkiye araç topluluğu",
    "81 il araç platformu",
    "araç muhabbet",
    "garaj muhabbet",
    "araç danışma platformu",
  ],
  authors: [{ name: "Garaj Muhabbet" }],
  creator: "Garaj Muhabbet",
  publisher: "Garaj Muhabbet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: baseUrl,
    siteName: "Garaj Muhabbet",
    title: "Garaj Muhabbet - Araç Sahipleri Topluluğu",
    description: "Türkiye'nin 81 ilinden araç sahiplerinin bir araya geldiği topluluk platformu. Araçlarınız hakkında sorular sorun, deneyimlerinizi paylaşın, yardımlaşın.",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Garaj Muhabbet - Araç Sahipleri Topluluğu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Garaj Muhabbet - Araç Sahipleri Topluluğu",
    description: "Türkiye'nin 81 ilinden araç sahiplerinin bir araya geldiği topluluk platformu.",
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
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
  alternates: {
    canonical: baseUrl,
  },
  category: "Automotive Community",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Garaj Muhabbet",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
