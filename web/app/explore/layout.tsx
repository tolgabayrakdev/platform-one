import AuthProvider from "@/providers/auth-provider"

export default function ExploreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthProvider>
            <section>
                {children}
            </section>
        </AuthProvider>

    )
}