import { SignUpForm } from "./sign-up-form";
import Link from "next/link";

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Kayıt Ol</h1>
          <p className="text-muted-foreground">
            Yeni hesap oluşturmak için bilgilerinizi girin
          </p>
        </div>

        <div className="border border-border rounded-lg p-8 bg-background">
          <SignUpForm />
        </div>

        <p className="text-sm text-center text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
