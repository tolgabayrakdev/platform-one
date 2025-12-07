import { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "İletişim | Garaj Muhabbet",
  description: "Garaj Muhabbet ile iletişime geçin. Sorularınız, önerileriniz veya destek ihtiyacınız için bizimle iletişime geçebilirsiniz. Size en kısa sürede dönüş yapacağız.",
  keywords: ["iletişim", "destek", "yardım", "garaj muhabbet iletişim", "araç platformu destek"],
  openGraph: {
    title: "İletişim | Garaj Muhabbet",
    description: "Sorularınız, önerileriniz veya destek ihtiyacınız için bizimle iletişime geçin.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "İletişim | Garaj Muhabbet",
    description: "Garaj Muhabbet ile iletişime geçin.",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center h-16">
            <h1 className="text-xl font-bold">İletişim</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Bizimle İletişime Geçin</h2>
            <p className="text-foreground/90 mb-6 leading-relaxed">
              Sorularınız, önerileriniz veya destek ihtiyacınız için bizimle iletişime geçebilirsiniz. 
              Size en kısa sürede dönüş yapacağız.
            </p>
          </section>

          <section>
            <ContactForm />
          </section>

          <section className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Diğer Bilgiler</h3>
            <div className="space-y-3 text-foreground/90">
              <p>
                <strong>Platform:</strong> Garaj Muhabbet
              </p>
              <p>
                <strong>Yıl:</strong> 2025
              </p>
              <p>
                Platform hakkında daha fazla bilgi için{" "}
                <Link href="/about" className="text-primary hover:underline">
                  Hakkımızda
                </Link>{" "}
                sayfasını ziyaret edebilirsiniz.
              </p>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
