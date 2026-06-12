"use client";

import { useState, useEffect } from "react";
import { Route, Users, TrendingUp, Building2 } from "lucide-react";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartWrapper } from "@/components/charts/chart-wrapper";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { getOperationalSummary, getPassengerTrend, getHourlyStats } from "@/lib/api/kpi";
import { getAgenciesWithColors } from "@/lib/api/agencies";
import { formatNumber } from "@/lib/utils";
import type {
  OperationalSummaryResponse,
  PassengerTrendPoint,
  HourlyStatsResponse,
} from "@/lib/api/kpi";
import type { AgencyWithColorsResponse } from "@/lib/api/agencies";

interface DashboardData {
  summary: OperationalSummaryResponse;
  trend: PassengerTrendPoint[];
  hourly: HourlyStatsResponse;
  agencies: AgencyWithColorsResponse[];
}


export function CooDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOperationalSummary(),
      getPassengerTrend(),
      getHourlyStats(),
      getAgenciesWithColors(),
    ])
      .then(([summary, trend, hourly, agencies]) =>
        setData({ summary, trend, hourly, agencies })
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Error cargando el dashboard"
        description={error ?? undefined}
      />
    );
  }

  const { summary, trend, hourly, agencies } = data;

  const agencyRoutesData = {
    labels: agencies.map((a) => a.agencyName),
    datasets: [
      {
        label: "Rutas",
        data: agencies.map((a) => a.routeCount),
        backgroundColor: agencies.map(
          (a) => (a.agencyColor ? `#${a.agencyColor}` : "#3B82F6")
        ),
        borderWidth: 0,
      },
    ],
  };

  const passengerTrendData = {
    labels: trend.map((p) => p.day),
    datasets: [
      {
        label: "Pasajeros promedio",
        data: trend.map((p) => p.avgPassengers),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
      },
    ],
  };

  const occupancyData = {
    labels: hourly.occupancyByHour.map((o) => `${String(o.hour).padStart(2, "0")}:00`),
    datasets: [
      {
        label: "Ocupación %",
        data: hourly.occupancyByHour.map((o) => o.occupancyPct),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
      },
    ],
  };

  const busDemandData = {
    labels: hourly.busDemand.map((b) => `${String(b.hour).padStart(2, "0")}:00`),
    datasets: [
      {
        label: "Buses Requeridos",
        data: hourly.busDemand.map((b) => b.busesRequired),
        backgroundColor: "#3B82F6",
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-4" data-testid="fleet-operations-panel">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-text-secondary">
          Visión general del sistema de transporte eléctrico
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Rutas Activas"
          value={summary.totalRoutes}
          sub="con datos GTFS"
          icon={<Route className="h-5 w-5" />}
        />
        <KpiCard
          title="Pasajeros Diarios"
          value={formatNumber(summary.avgDailyPassengers)}
          sub="promedio histórico"
          icon={<Users className="h-5 w-5" />}
        />
        <KpiCard
          title="Hora Pico"
          value={summary.peakHour}
          sub="mayor actividad"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KpiCard
          title="Agencias"
          value={agencies.length}
          sub="sistemas de transporte"
          icon={<Building2 className="h-5 w-5" />}
        />
      </div>

      {/* Rutas por agencia + Tendencia de pasajeros */}
      <div className="grid gap-3 lg:grid-cols-2">
        <ChartWrapper
          title="Rutas por Agencia"
          description="Total de rutas por sistema de transporte"
        >
          <BarChart data={agencyRoutesData} />
        </ChartWrapper>
        <ChartWrapper
          title="Tendencia de Pasajeros"
          description="Afluencia promedio por día de la semana"
        >
          <LineChart data={passengerTrendData} />
        </ChartWrapper>
      </div>

      {/* Ocupación + Demanda de buses */}
      <div className="grid gap-3 lg:grid-cols-2">
        <ChartWrapper
          title="Ocupación por Franja Horaria"
          description="Porcentaje de ocupación estimado por hora"
        >
          <LineChart data={occupancyData} />
        </ChartWrapper>
        <ChartWrapper
          title="Demanda de Buses por Hora"
          description="Buses requeridos por franja horaria"
        >
          <BarChart data={busDemandData} />
        </ChartWrapper>
      </div>
    </div>
  );
}
