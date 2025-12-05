import AuthProvider from "@/providers/auth-provider";

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
