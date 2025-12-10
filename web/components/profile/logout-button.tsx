import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    if (!confirm("Çıkış yapmak istediğinize emin misiniz?")) return;

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/sign-in");
    } catch {
      toast.error("Çıkış yapılamadı");
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleLogout}
        className="w-full py-3 text-sm text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/5"
      >
        Çıkış Yap
      </button>
    </div>
  );
}
