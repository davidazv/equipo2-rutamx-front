"use client";

import { LayoutDashboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentRole } from "@/hooks/use-current-role";
import RoiDashboardPage from "@/app/dashboard/page";

export default function DashboardPage() {
  const role = useCurrentRole();

  if (role === "ceo") {
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

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <LayoutDashboard className="h-6 w-6 text-primary-light" />
          </div>
          <p className="text-sm text-text-secondary">
            Dashboard para rol <span className="font-semibold text-foreground uppercase">{role}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
