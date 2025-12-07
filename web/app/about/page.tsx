import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkımızda | Garaj Muhabbet",
  description: "Garaj Muhabbet, Türkiye'nin 81 ilinden araç sahiplerinin bir araya gelip araçları hakkında sorular sorduğu, deneyimlerini paylaştığı ve birbirlerine danışabildiği özel bir topluluk platformudur. Yedek parça, servis, bakım ve araç konularında yardımlaşma.",
  keywords: ["araç forumu", "araç sahipleri topluluğu", "araç soru cevap", "araç yardımlaşma", "yedek parça soru", "araç servis tavsiye", "81 il araç platformu", "Türkiye araç topluluğu"],
  openGraph: {
    title: "Hakkımızda | Garaj Muhabbet",
    description: "Türkiye'nin 81 ilinden araç sahiplerinin bir araya geldiği topluluk. Araçlar hakkında sorular sorun, deneyimlerinizi paylaşın, yardımlaşın.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hakkımızda | Garaj Muhabbet",
    description: "Türkiye'nin en büyük araç sahipleri topluluğu.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center h-16">
            <h1 className="text-xl font-bold">Hakkımızda</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Garaj Muhabbet Nedir?</h2>
            <p className="text-foreground/90 mb-4 leading-relaxed">
              Garaj Muhabbet, <span className="font-semibold">Türkiye'nin 81 ilinden</span> araç sahiplerinin bir araya gelip 
              araçları hakkında <span className="font-semibold">sorular sorduğu, deneyimlerini paylaştığı</span> ve 
              birbirlerine <span className="font-semibold">danışabildiği</span> özel bir topluluk platformudur.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              Sahibinden.com gibi bir ilan sitesi değil, alım-satım platformu değil. 
              <span className="font-semibold"> Araçlarınız hakkında sorular sorabileceğiniz, deneyimlerinizi paylaşabileceğiniz ve 
              yedek parça, servis, bakım gibi konularda yardımlaşabileceğiniz</span> bir topluluk platformudur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Hedefimiz</h2>
            <p className="text-foreground/90 mb-4 leading-relaxed">
              Türkiye'de araç sahiplerinin kendi araçlarıyla ilgili diğer insanlara danışabileceği, 
              sorular sorabileceği ve yardımlaşabileceği özel bir platform yoktu. 
              Sahibinden.com gibi ilan siteleri var, ama <span className="font-semibold">soru-cevap, deneyim paylaşımı ve yardımlaşma</span> odaklı bir platform yoktu. 
              Biz bu boşluğu doldurmak için yola çıktık.
            </p>
            <p className="text-foreground/90 mb-4 leading-relaxed">
              Amacımız, araç sahiplerinin:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Deneyimlerini paylaşabileceği</li>
              <li>Birbirlerine danışabileceği</li>
              <li>Yardımlaşabileceği</li>
              <li>Güvenilir bilgiye ulaşabileceği</li>
              <li>Araçlarıyla ilgili her konuda destek alabileceği</li>
            </ul>
            <p className="text-foreground/90 mt-4 leading-relaxed">
              bir topluluk oluşturmaktır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Ne Sunuyoruz?</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">❓ Soru Sorma ve Danışma</h3>
                <p className="text-foreground/90">
                  Araçlarınız hakkında sorularınızı sorun, Türkiye'nin 81 ilinden araç sahiplerinden tavsiye alın.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">💬 Deneyim Paylaşımı</h3>
                <p className="text-foreground/90">
                  Araçlarınızla ilgili deneyimlerinizi paylaşın, başkalarına yardımcı olun.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">🔧 Yedek Parça Tavsiyeleri</h3>
                <p className="text-foreground/90">
                  Yedek parça konusunda sorular sorun, nereden bulabileceğinizi öğrenin, deneyimleri dinleyin.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">🛠️ Servis ve Bakım Önerileri</h3>
                <p className="text-foreground/90">
                  Güvenilir servis önerileri alın, bakım konusunda deneyimleri okuyun ve paylaşın.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">🤝 Yardımlaşma Topluluğu</h3>
                <p className="text-foreground/90">
                  Türkiye'nin 81 ilinden araç sahiplerinin bir araya geldiği, birbirine destek olduğu aktif bir topluluk.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Vizyonumuz</h2>
            <p className="text-foreground/90 leading-relaxed">
              <span className="font-semibold">Türkiye'nin 81 ilinden</span> araç sahiplerinin bir araya geldiği, 
              araçları hakkında sorular sorduğu, birbirine destek olduğu ve 
              araçlarıyla ilgili her konuda bilgi alışverişi yapabildiği en büyük araç sahipleri topluluğu olmak.
            </p>
          </section>

          <section className="pt-6 border-t border-border">
            <p className="text-foreground/90 mb-4">
              Siz de aramıza katılmak ister misiniz?
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Hemen Kayıt Ol
            </Link>
          </section>
        </article>
      </main>
    </div>
  );
}
