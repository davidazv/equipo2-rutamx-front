"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

interface BarChartProps {
  data: {
    labels: string[];
    datasets: BarChartDataset[];
  };
  horizontal?: boolean;
}

export function BarChart({ data, horizontal = false }: BarChartProps) {
  const options = {
    indexAxis: horizontal ? ("y" as const) : ("x" as const),
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: "#475569", font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#0f172a",
        bodyColor: "#475569",
        borderColor: "#e2e8f0",
        borderWidth: 1,
      },
    },
    scales: {
      x: { grid: { color: "#e2e8f0" }, ticks: { color: "#475569" } },
      y: { grid: { color: "#e2e8f0" }, ticks: { color: "#475569" } },
    },
  };

  return <Bar data={data} options={options} />;
}
