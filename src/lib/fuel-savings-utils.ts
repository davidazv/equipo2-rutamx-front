import type { FuelSavingsResponse } from "@/lib/api/fuel-savings";

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  fill?: boolean;
  tension?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export function buildMonthlyChartData(data: FuelSavingsResponse): { mxn: ChartData; liters: ChartData } {
  const monthlyMXN = Math.round(data.fuelSavingsMXN / 12);
  const monthlyLiters = Math.round(data.fuelSavingsLiters / 12);
  return {
    mxn: {
      labels: MONTHS,
      datasets: [{ label: "Ahorro MXN", data: MONTHS.map(() => monthlyMXN), backgroundColor: "rgba(30, 64, 175, 0.7)" }],
    },
    liters: {
      labels: MONTHS,
      datasets: [{ label: "Litros ahorrados", data: MONTHS.map(() => monthlyLiters), backgroundColor: "rgba(34, 199, 122, 0.7)" }],
    },
  };
}

export function buildAnnualChartData(data: FuelSavingsResponse): { mxn: ChartData; liters: ChartData } {
  const labels = Array.from({ length: data.projectionYears }, (_, i) => `Año ${i + 1}`);
  return {
    mxn: {
      labels,
      datasets: [{ label: "Ahorro MXN", data: labels.map((_, i) => Math.round(data.fuelSavingsMXN * (i + 1))), backgroundColor: "rgba(30, 64, 175, 0.7)" }],
    },
    liters: {
      labels,
      datasets: [{ label: "Litros ahorrados", data: labels.map((_, i) => Math.round(data.fuelSavingsLiters * (i + 1))), backgroundColor: "rgba(34, 199, 122, 0.7)" }],
    },
  };
}

export function buildAccumulatedChartData(data: FuelSavingsResponse): { mxn: ChartData; liters: ChartData } {
  const labels = Array.from({ length: data.projectionYears }, (_, i) => `Año ${i + 1}`);
  return {
    mxn: {
      labels,
      datasets: [{ label: "Ahorro acumulado MXN", data: labels.map((_, i) => Math.round(data.fuelSavingsMXN * (i + 1))), borderColor: "#1e40af", backgroundColor: "rgba(30, 64, 175, 0.1)", fill: true, tension: 0.4 }],
    },
    liters: {
      labels,
      datasets: [{ label: "Litros acumulados", data: labels.map((_, i) => Math.round(data.fuelSavingsLiters * (i + 1))), borderColor: "#22c77a", backgroundColor: "rgba(34, 199, 122, 0.1)", fill: true, tension: 0.4 }],
    },
  };
}

export function buildCSVContent(data: FuelSavingsResponse, tab: string): string {
  const rows: string[][] = [];

  if (tab === "mensual") {
    rows.push(["Mes", "Ahorro MXN", "Ahorro Litros"]);
    MONTHS.forEach((m) => {
      rows.push([
        m,
        String(Math.round(data.fuelSavingsMXN / 12)),
        String(Math.round(data.fuelSavingsLiters / 12)),
      ]);
    });
  } else if (tab === "anual") {
    rows.push(["Año", "Ahorro MXN", "Ahorro Litros"]);
    for (let y = 1; y <= data.projectionYears; y++) {
      rows.push([
        `Año ${y}`,
        String(Math.round(data.fuelSavingsMXN * y)),
        String(Math.round(data.fuelSavingsLiters * y)),
      ]);
    }
  } else {
    rows.push(["Año", "Ahorro Acumulado MXN", "Ahorro Acumulado Litros"]);
    for (let y = 1; y <= data.projectionYears; y++) {
      rows.push([
        `Año ${y}`,
        String(Math.round(data.fuelSavingsMXN * y)),
        String(Math.round(data.fuelSavingsLiters * y)),
      ]);
    }
  }

  return rows.map((r) => r.join(",")).join("\n");
}

export function formatMXN(v: number): string {
  return `$${Math.round(v).toLocaleString("es-MX")}`;
}

export function formatLiters(v: number): string {
  return `${Math.round(v).toLocaleString("es-MX")} L`;
}
