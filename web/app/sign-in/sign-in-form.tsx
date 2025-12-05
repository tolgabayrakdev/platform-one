"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type VerificationStep = "login" | "email-verify" | "phone-verify";

export function SignInForm() {
  const [step, setStep] = useState<VerificationStep>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailCodeTimer, setEmailCodeTimer] = useState(90); // 90 saniye
  const [phoneCodeTimer, setPhoneCodeTimer] = useState(90); // 90 saniye
  const [userPhone, setUserPhone] = useState("");

  // Giriş yapmış kullanıcıyı kontrol et
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          // Kullanıcı zaten giriş yapmış, explore'a yönlendir
          window.location.href = '/explore';
          return;
        }
      } catch {
        // Hata olursa devam et (giriş yapmamış)
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          // Email doğrulanmamış
          setStep("email-verify");
          setUserEmail(email);
          setUserPassword(password);
          setEmailCodeTimer(90); // 90 saniye geri sayım başlat
          toast.error(data.message || 'E-posta adresinizi doğrulamalısınız');
          return;
        }
        throw new Error(data.message || 'Giriş başarısız');
      }

      // Telefon doğrulama gerekli mi kontrol et
      if (data.needsPhoneVerification) {
        setStep("phone-verify");
        setUserEmail(email);
        setUserPassword(password);
        setUserPhone(data.user?.phone || "");
        setPhoneCodeTimer(180);
        toast.info("Telefon numaranıza kod gönderildi. Lütfen doğrulayın.");
        return;
      }

      window.location.href = '/explore';
    } catch (error: any) {
      toast.error(error.message || "Giriş başarısız. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Önce email'i doğrula
      const verifyResponse = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, code: emailCode }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || 'Doğrulama kodu hatalı');
      }

      // Email doğrulandıktan sonra tekrar giriş yap
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, password: userPassword }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || 'Giriş başarısız');
      }

      // Telefon doğrulama gerekli mi kontrol et
      if (loginData.needsPhoneVerification) {
        setStep("phone-verify");
        setUserPhone(loginData.user?.phone || "");
        setPhoneCodeTimer(90); // 90 saniye geri sayım başlat
        toast.success("E-posta doğrulandı! Telefon numaranıza kod gönderildi.");
        return;
      }

      toast.success("E-posta doğrulandı! Giriş başarılı.");
      // Explore sayfasına yönlendir
      window.location.href = '/explore';
    } catch (error: any) {
      toast.error(error.message || "Doğrulama kodu hatalı!");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendEmailCode() {
    try {
      const response = await fetch('/api/auth/resend-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kod gönderilemedi');
      }

      setEmailCodeTimer(90); // Geri sayımı sıfırla
      toast.success("Doğrulama kodu yeniden gönderildi!");
    } catch (error: any) {
      toast.error(error.message || "Kod gönderilemedi. Lütfen tekrar deneyin.");
    }
  }

  // Telefon doğrulama
  async function handlePhoneVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, code: phoneCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Doğrulama kodu hatalı');
      }

      // Telefon doğrulandıktan sonra tekrar giriş yap
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, password: userPassword }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || 'Giriş başarısız');
      }

      toast.success("Telefon doğrulandı! Giriş başarılı.");
      window.location.href = '/explore';
    } catch (error: any) {
      toast.error(error.message || "Doğrulama kodu hatalı!");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendPhoneCode() {
    try {
      const response = await fetch('/api/auth/resend-phone-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kod gönderilemedi');
      }

      setPhoneCodeTimer(90); // Geri sayımı sıfırla
      toast.success("Doğrulama kodu yeniden gönderildi!");
    } catch (error: any) {
      toast.error(error.message || "Kod gönderilemedi. Lütfen tekrar deneyin.");
    }
  }

  // Email kodu geri sayım timer'ı
  useEffect(() => {
    if (step === "email-verify" && emailCodeTimer > 0) {
      const timer = setInterval(() => {
        setEmailCodeTimer((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, emailCodeTimer]);

  // Telefon kodu geri sayım timer'ı
  useEffect(() => {
    if (step === "phone-verify" && phoneCodeTimer > 0) {
      const timer = setInterval(() => {
        setPhoneCodeTimer((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, phoneCodeTimer]);

  // Email doğrulama adımı
  if (step === "email-verify") {
    return (
      <form onSubmit={handleEmailVerify} className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold">E-posta Doğrulama</h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{userEmail}</span> adresine gönderilen doğrulama kodunu girin
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="emailCode" className="block text-sm font-medium">
            Doğrulama Kodu
          </label>
          <input
            id="emailCode"
            name="emailCode"
            type="text"
            required
            value={emailCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setEmailCode(value);
            }}
            maxLength={6}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-center text-2xl tracking-widest"
            placeholder="000000"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Doğrulanıyor..." : "Doğrula"}
        </Button>

        <div className="text-center space-y-2">
          {emailCodeTimer > 0 ? (
            <p className="text-sm text-muted-foreground">
              Yeni kod almak için{" "}
              <span className="font-medium text-foreground">
                {Math.floor(emailCodeTimer / 60)}:{(emailCodeTimer % 60).toString().padStart(2, '0')}
              </span>{" "}
              bekleyin
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendEmailCode}
              className="text-sm text-primary hover:underline font-medium"
            >
              Yeni kod al
            </button>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setStep("login")}
            className="text-sm text-muted-foreground hover:underline"
          >
            Geri dön
          </button>
        </div>
      </form>
    );
  }

  // Telefon doğrulama adımı
  if (step === "phone-verify") {
    return (
      <form onSubmit={handlePhoneVerify} className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold">Telefon Doğrulama</h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">
              {userPhone ? (userPhone.startsWith('+90') ? `+90 ${userPhone.slice(3)}` : userPhone) : "Telefon numaranız"}
            </span> numarasına gönderilen doğrulama kodunu girin
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="phoneCode" className="block text-sm font-medium">
            Doğrulama Kodu
          </label>
          <input
            id="phoneCode"
            name="phoneCode"
            type="text"
            required
            value={phoneCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setPhoneCode(value);
            }}
            maxLength={6}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-center text-2xl tracking-widest"
            placeholder="000000"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Doğrulanıyor..." : "Doğrula"}
        </Button>

        <div className="text-center space-y-2">
          {phoneCodeTimer > 0 ? (
            <p className="text-sm text-muted-foreground">
              Yeni kod almak için{" "}
              <span className="font-medium text-foreground">
                {Math.floor(phoneCodeTimer / 60)}:{(phoneCodeTimer % 60).toString().padStart(2, '0')}
              </span>{" "}
              bekleyin
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendPhoneCode}
              className="text-sm text-primary hover:underline font-medium"
            >
              Yeni kod al
            </button>
          )}
        </div>
      </form>
    );
  }

  // Auth kontrolü yapılıyor
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Giriş formu
  if (step === "login") {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          placeholder="ornek@email.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          Şifre
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
    </form>
  );
}

}