"use client"
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface AuthProviderProps {
    children: ReactNode;
}


function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [rateLimited, setRateLimited] = useState(false);

    const verifyAuthToken = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const res = await fetch(`/api/auth/me`, {
                method: 'GET',
                credentials: 'include',
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            
            if (res.status === 200) {
                // Kullanıcı giriş yapmış, il ve araç kontrolü yap
                const profileRes = await fetch('/api/users/profile', {
                    credentials: 'include',
                });

                if (profileRes.ok) {
                    const data = await profileRes.json();
                    
                    // İl ve araç seçilmemişse ve onboarding'de değilse yönlendir
                    if ((!data.profile?.city || !data.profile?.vehicle) && pathname !== '/onboarding') {
                        router.push('/onboarding');
                        return;
                    }
                }

                setLoading(false);
                setRateLimited(false);
            } else if (res.status === 403) {
                // Ban kontrolü - mesajı kontrol et
                const data = await res.json().catch(() => ({}));
                if (data.message?.includes('kapatılmıştır') || data.message?.includes('kapatıldı')) {
                    // Banlanmış kullanıcı - sadece sign-in'e yönlendir, mesaj zaten backend'den geliyor
                    setLoading(false);
                    router.push('/sign-in');
                    return;
                }
                setLoading(false);
                router.push('/sign-in');
            } else if (res.status === 429) {
                setLoading(false);
                setRateLimited(true);
            } else {
                setLoading(false);
                router.push('/sign-in');
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                setLoading(false);
                router.push('/sign-in');
            } else {
                setLoading(false);
                router.push('/sign-in');
            }
        }
    };

    useEffect(() => {
        verifyAuthToken();
    }, [pathname]);

    const handleRetry = () => {
        setLoading(true);
        setRateLimited(false);
        verifyAuthToken();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (rateLimited) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-md space-y-6 text-center">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-destructive">Çok Fazla İstek</h2>
                        <p className="text-muted-foreground">
                            Çok fazla istek gönderdiniz. Lütfen bir süre bekleyiniz.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleRetry} className="flex-1">
                            Tekrar Dene
                        </Button>
                        <Button onClick={() => router.push('/sign-in')} variant="outline" className="flex-1">
                            Çıkış Yap
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default AuthProvider;