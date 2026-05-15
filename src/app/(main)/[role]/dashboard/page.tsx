"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import RoiDashboardPage from "@/app/dashboard/page";
import ComparativeReportPage from "@/app/(main)/[role]/report/page";
import { CooDashboard } from "./_components/coo-dashboard";

export default function DashboardPage() {
  const role = useCurrentRole();

  if (role === "ceo" || role === "admin") {
    return <RoiDashboardPage />;
  }

  if (role === "cmo") {
    return <ComparativeReportPage />;
  }

  if (role === "coo") {
    return <CooDashboard />;
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
