"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string | string[];
  fill?: boolean;
  tension?: number;
}

interface LineChartProps {
  data: {
    labels: string[];
    datasets: LineChartDataset[];
  };
}

export function LineChart({ data }: LineChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#475569",
          font: {
            size: 12,
          },
        },
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
      x: {
        grid: {
          color: "#e2e8f0",
        },
        ticks: {
          color: "#475569",
        },
      },
      y: {
        grid: {
          color: "#e2e8f0",
        },
        ticks: {
          color: "#475569",
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
  };

  return <Line data={data} options={options} />;
}
