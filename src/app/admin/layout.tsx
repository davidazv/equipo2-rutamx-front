import type { Metadata } from "next";
import AdminHeader from "./AdminHeader";

export const metadata: Metadata = {
  title: "Admin Panel — RutaMX",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
