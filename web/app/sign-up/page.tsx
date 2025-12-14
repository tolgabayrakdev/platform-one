import { Metadata } from "next";
import { SignUpForm } from "./sign-up-form";
import Link from "next/link";
import AddToHomeScreen from "@/components/add-to-home-screen";
import InstallAppButton from "@/components/install-app-button";

export const metadata: Metadata = {
  title: "Kayıt Ol | Garaj Muhabbet - Ücretsiz Hesap Oluştur",
  description: "Garaj Muhabbet'e ücretsiz kayıt olun. Türkiye'nin en büyük araç sahipleri topluluğuna katılın, gönderiler paylaşın ve diğer araç sahipleriyle iletişime geçin.",
  keywords: ["kayıt ol", "ücretsiz kayıt", "hesap oluştur", "araç platformu kayıt", "garaj muhabbet kayıt"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Kayıt Ol | Garaj Muhabbet",
    description: "Garaj Muhabbet'e ücretsiz kayıt olun ve araç sahipleri topluluğuna katılın.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kayıt Ol | Garaj Muhabbet",
    description: "Garaj Muhabbet'e ücretsiz kayıt olun.",
  },
};

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Kayıt Ol</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Yeni hesap oluşturmak için bilgilerinizi girin
          </p>
        </div>

        <div className="text-center">
          <InstallAppButton variant="link" />
        </div>

        <div className="border border-border rounded-lg p-4 sm:p-6 md:p-8 bg-background">
          <SignUpForm />
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
      <AddToHomeScreen />
    </div>
  );
}
