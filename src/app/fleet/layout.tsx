import { Header } from "@/components/layout/header";

export default function FleetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-5 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
