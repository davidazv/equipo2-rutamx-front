import { Header } from "@/components/layout/header";
import { AuthGuard } from "@/components/shared/auth-guard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
