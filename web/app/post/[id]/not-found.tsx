import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4">
        <p className="text-6xl">🔍</p>
        <h1 className="text-2xl font-bold">İlan Bulunamadı</h1>
        <p className="text-muted-foreground">
          Aradığınız ilan silinmiş veya mevcut değil.
        </p>
        <Link
          href="/feed"
          className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
