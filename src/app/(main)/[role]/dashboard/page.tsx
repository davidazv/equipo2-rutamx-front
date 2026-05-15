"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import RoiDashboardPage from "@/app/dashboard/page";
import ComparativeReportPage from "@/app/(main)/[role]/report/page";
import { CmoDashboard } from "./_components/cmo-dashboard";
import { CooDashboard } from "./_components/coo-dashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function DashboardPage() {
  const role = useCurrentRole();

  if (role === "ceo" || role === "admin") {
    return <RoiDashboardPage />;
  }

  if (role === "cmo") {
    return (
      <Tabs defaultValue="analisis">
        <TabsList>
          <TabsTrigger value="analisis">Análisis de Rutas</TabsTrigger>
          <TabsTrigger value="reporte">Reporte Comparativo</TabsTrigger>
        </TabsList>
        <TabsContent value="analisis">
          <CmoDashboard />
        </TabsContent>
        <TabsContent value="reporte">
          <ComparativeReportPage />
        </TabsContent>
      </Tabs>
    );
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
