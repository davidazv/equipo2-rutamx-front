import type { Metadata } from "next";
import AdminHeader from "./AdminHeader";
import { AuthGuard } from "@/components/shared/auth-guard";

export const metadata: Metadata = {
  title: "Admin Panel — RutaMX",
};

export default function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-6 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
