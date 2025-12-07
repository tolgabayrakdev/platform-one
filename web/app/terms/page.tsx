import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Şartları | Garaj Muhabbet",
  description: "Garaj Muhabbet kullanım şartları. Platform kullanım kuralları, kullanıcı sorumlulukları ve platform kuralları hakkında bilgi edinin.",
  keywords: ["kullanım şartları", "platform kuralları", "kullanıcı sözleşmesi", "garaj muhabbet şartlar"],
  openGraph: {
    title: "Kullanım Şartları | Garaj Muhabbet",
    description: "Garaj Muhabbet kullanım şartları ve platform kuralları.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kullanım Şartları | Garaj Muhabbet",
    description: "Garaj Muhabbet kullanım şartları.",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center h-16">
            <h1 className="text-xl font-bold">Kullanım Şartları</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Kabul ve Onay</h2>
            <p className="text-foreground/90 mb-4">
              Garaj Muhabbet'i kullanarak, bu kullanım şartlarını kabul etmiş sayılırsınız. 
              Şartları kabul etmiyorsanız, platformu kullanmayın.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Hesap Sorumluluğu</h2>
            <p className="text-foreground/90 mb-4">
              Hesabınızı oluştururken:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Doğru ve güncel bilgiler sağlamalısınız</li>
              <li>Hesap güvenliğinden siz sorumlusunuz</li>
              <li>Şifrenizi gizli tutmalısınız</li>
              <li>Hesabınızda yapılan tüm işlemlerden sorumlusunuz</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Kullanıcı İçeriği</h2>
            <p className="text-foreground/90 mb-4">
              Platformda paylaştığınız içeriklerden siz sorumlusunuz. Aşağıdaki içerikleri paylaşamazsınız:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Yasadışı, zararlı veya tehdit edici içerik</li>
              <li>Telif hakkı ihlali yapan içerik</li>
              <li>Yanıltıcı veya sahte bilgiler</li>
              <li>Spam veya istenmeyen içerik</li>
              <li>Kişisel saldırı veya nefret söylemi</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Platform Kuralları</h2>
            <p className="text-foreground/90 mb-4">
              Platformu kullanırken:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Diğer kullanıcılara saygılı olmalısınız</li>
              <li>Platformun işleyişini bozmamalısınız</li>
              <li>Otomatik sistemler veya botlar kullanmamalısınız</li>
              <li>Başkalarının hesaplarına erişmeye çalışmamalısınız</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Fikri Mülkiyet</h2>
            <p className="text-foreground/90 mb-4">
              Platform içeriği ve tasarımı telif hakkı koruması altındadır. 
              İçeriği izinsiz kopyalayamaz, dağıtamaz veya kullanamazsınız.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Hizmet Değişiklikleri</h2>
            <p className="text-foreground/90 mb-4">
              Platformu herhangi bir zamanda değiştirme, askıya alma veya sonlandırma hakkımız saklıdır.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Sorumluluk Reddi</h2>
            <p className="text-foreground/90 mb-4">
              Platform "olduğu gibi" sunulmaktadır. Kullanıcılar arasındaki bilgi paylaşımlarından, 
              tavsiyelerden ve görüşlerden platform sorumlu değildir.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Hesap Sonlandırma</h2>
            <p className="text-foreground/90 mb-4">
              Kullanım şartlarını ihlal eden hesaplar uyarı verilmeksizin askıya alınabilir veya sonlandırılabilir.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Değişiklikler</h2>
            <p className="text-foreground/90 mb-4">
              Bu şartları herhangi bir zamanda güncelleyebiliriz. 
              Önemli değişiklikler kullanıcılara bildirilecektir.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. İletişim</h2>
            <p className="text-foreground/90 mb-4">
              Kullanım şartları hakkında sorularınız için bizimle iletişime geçebilirsiniz.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
