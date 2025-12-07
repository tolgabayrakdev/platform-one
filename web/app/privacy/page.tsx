import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Garaj Muhabbet",
  description: "Garaj Muhabbet gizlilik politikası. Kişisel bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu öğrenin. KVKK uyumlu gizlilik politikamız.",
  keywords: ["gizlilik politikası", "KVKK", "kişisel veri koruma", "veri güvenliği", "garaj muhabbet gizlilik"],
  openGraph: {
    title: "Gizlilik Politikası | Garaj Muhabbet",
    description: "Garaj Muhabbet gizlilik politikası ve kişisel veri koruma bilgileri.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Gizlilik Politikası | Garaj Muhabbet",
    description: "Garaj Muhabbet gizlilik politikası.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center h-16">
            <h1 className="text-xl font-bold">Gizlilik Politikası</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Gizlilik Politikamız</h2>
            <p className="text-foreground/90 mb-4">
              Garaj Muhabbet olarak, kullanıcılarımızın gizliliğini korumak bizim için önemlidir. 
              Bu gizlilik politikası, kişisel bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Toplanan Bilgiler</h2>
            <p className="text-foreground/90 mb-4">
              Platformumuzu kullanırken aşağıdaki bilgileri topluyoruz:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Ad, soyad, e-posta adresi ve telefon numarası</li>
              <li>Profil bilgileri (şehir, araç bilgileri)</li>
              <li>Paylaştığınız gönderiler ve yorumlar</li>
              <li>Platform kullanım verileri</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Bilgilerin Kullanımı</h2>
            <p className="text-foreground/90 mb-4">
              Toplanan bilgileriniz aşağıdaki amaçlarla kullanılır:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Hesabınızı oluşturma ve yönetme</li>
              <li>Platform hizmetlerini sunma ve iyileştirme</li>
              <li>İletişim ve bildirimler gönderme</li>
              <li>Güvenlik ve dolandırıcılık önleme</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Bilgi Paylaşımı</h2>
            <p className="text-foreground/90 mb-4">
              Kişisel bilgilerinizi üçüncü taraflarla paylaşmıyoruz, ancak aşağıdaki durumlar hariç:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Yasal yükümlülükler</li>
              <li>Güvenlik ve dolandırıcılık önleme</li>
              <li>Kullanıcının açık rızası</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Veri Güvenliği</h2>
            <p className="text-foreground/90 mb-4">
              Kişisel bilgilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri alıyoruz. 
              Ancak, internet üzerinden hiçbir veri aktarımı %100 güvenli değildir.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Çerezler</h2>
            <p className="text-foreground/90 mb-4">
              Platformumuz, hizmetlerimizi iyileştirmek ve kullanıcı deneyimini geliştirmek için çerezler kullanır.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Haklarınız</h2>
            <p className="text-foreground/90 mb-4">
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Kişisel verilerinize erişim</li>
              <li>Düzeltme ve silme talebi</li>
              <li>İtiraz etme hakkı</li>
              <li>Veri taşınabilirliği</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. İletişim</h2>
            <p className="text-foreground/90 mb-4">
              Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
