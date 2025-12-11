import { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Şifremi Unuttum | Garaj Muhabbet",
  description: "Şifrenizi sıfırlamak için e-posta adresinizi girin.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Şifremi Unuttum</h1>
          <p className="text-muted-foreground">
            E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz
          </p>
        </div>

        <div className="border border-border rounded-lg p-8 bg-background">
          <ForgotPasswordForm />
        </div>

        <p className="text-sm text-center text-muted-foreground">
          <Link href="/sign-in" className="text-primary hover:underline">
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  );
}
