import { SignInForm } from "./sign-in-form";
import Link from "next/link";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Giriş Yap</h1>
          <p className="text-muted-foreground">
            Hesabınıza giriş yapmak için bilgilerinizi girin
          </p>
        </div>

        <div className="border border-border rounded-lg p-8 bg-background">
          <SignInForm />
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}