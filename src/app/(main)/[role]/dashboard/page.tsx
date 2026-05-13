"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import RoiDashboardPage from "@/app/dashboard/page";

export default function DashboardPage() {
  const role = useCurrentRole();

  if (role === "ceo" || role === "admin") {
    return <RoiDashboardPage />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-text-secondary">
          Vision general del sistema de transporte electrico
        </p>
      </div>
    </div>
  );
}
