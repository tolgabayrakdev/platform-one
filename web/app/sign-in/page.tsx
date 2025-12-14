import { Metadata } from "next";
import { SignInForm } from "./sign-in-form";
import Link from "next/link";
import AddToHomeScreen from "@/components/add-to-home-screen";
import InstallAppButton from "@/components/install-app-button";

export const metadata: Metadata = {
  title: "Giriş Yap | Garaj Muhabbet",
  description: "Garaj Muhabbet hesabınıza giriş yapın. Araç sahipleri topluluğuna katılın, gönderiler paylaşın ve diğer araç sahipleriyle iletişime geçin.",
  keywords: ["giriş yap", "hesap girişi", "araç platformu giriş", "garaj muhabbet giriş"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Giriş Yap | Garaj Muhabbet",
    description: "Garaj Muhabbet hesabınıza giriş yapın.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Giriş Yap | Garaj Muhabbet",
    description: "Garaj Muhabbet hesabınıza giriş yapın.",
  },
};

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Giriş Yap</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Hesabınıza giriş yapmak için bilgilerinizi girin
          </p>
        </div>

        <div className="text-center">
          <InstallAppButton variant="link" />
        </div>

        <div className="border border-border rounded-lg p-4 sm:p-6 md:p-8 bg-background">
          <SignInForm />
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Kayıt ol
          </Link>
        </p>
      </div>
      <AddToHomeScreen />
    </div>
  );
}