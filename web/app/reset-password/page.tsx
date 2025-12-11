import { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Şifre Sıfırla | Garaj Muhabbet",
  description: "Yeni şifrenizi belirleyin.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Şifre Sıfırla</h1>
          <p className="text-muted-foreground">
            Yeni şifrenizi belirleyin
          </p>
        </div>

        <div className="border border-border rounded-lg p-8 bg-background">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
