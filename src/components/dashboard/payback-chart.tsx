import { Card, CardContent } from "@/components/ui/card";
import type { RoiEstimateResponse, RouteResponse } from "@/lib/api/roi";

const YEARS_TO_SHOW = 8;
const CHART_W = 280;
const CHART_H = 140;
const PAD = { top: 10, right: 10, bottom: 24, left: 44 };

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(v / 1_000).toLocaleString("es-MX")}k`;
}

interface RouteEstimate {
  route: RouteResponse;
  estimate: RoiEstimateResponse;
}

interface PaybackChartProps {
  routeEstimates: RouteEstimate[];
}

function MiniPaybackCard({ route, estimate }: RouteEstimate) {
  const plotW = CHART_W - PAD.left - PAD.right;
  const plotH = CHART_H - PAD.top - PAD.bottom;

  const maxSavings = estimate.netAnnualReturn * YEARS_TO_SHOW;
  const yMax = Math.max(estimate.totalInvestmentMXN, maxSavings) * 1.1;

  function toX(year: number) {
    return PAD.left + (year / YEARS_TO_SHOW) * plotW;
  }
  function toY(value: number) {
    return PAD.top + plotH - (value / yMax) * plotH;
  }

  // Savings line points (year 0 to YEARS_TO_SHOW)
  const savingsPoints = Array.from({ length: YEARS_TO_SHOW + 1 }, (_, i) => ({
    x: toX(i),
    y: toY(estimate.netAnnualReturn * i),
  }));
  const savingsPath = savingsPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Investment line
  const investY = toY(estimate.totalInvestmentMXN);

  // Break-even point
  const beX = toX(estimate.paybackYears);
  const beY = investY;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-xs font-medium truncate">
            {route.routeShortName}
          </p>
          <span className="text-xs text-muted-foreground ml-2 shrink-0">
            {estimate.paybackYears.toFixed(1)} anos
          </span>
        </div>

        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full h-auto"
          role="img"
          aria-label={`Punto de equilibrio: ${estimate.paybackYears.toFixed(1)} anos`}
        >
          {/* Y-axis labels */}
          <text
            x={PAD.left - 4}
            y={PAD.top + 4}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {fmt(yMax)}
          </text>
          <text
            x={PAD.left - 4}
            y={PAD.top + plotH + 4}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
          >
            $0
          </text>

          {/* X-axis labels */}
          {[0, 2, 4, 6, 8].filter((y) => y <= YEARS_TO_SHOW).map((y) => (
            <text
              key={y}
              x={toX(y)}
              y={CHART_H - 4}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {y === 0 ? "0" : `${y}a`}
            </text>
          ))}

          {/* Grid lines */}
          <line
            x1={PAD.left}
            y1={PAD.top}
            x2={PAD.left}
            y2={PAD.top + plotH}
            className="stroke-border/40"
            strokeWidth={0.5}
          />
          <line
            x1={PAD.left}
            y1={PAD.top + plotH}
            x2={PAD.left + plotW}
            y2={PAD.top + plotH}
            className="stroke-border/40"
            strokeWidth={0.5}
          />

          {/* Investment line (dashed) */}
          <line
            x1={PAD.left}
            y1={investY}
            x2={PAD.left + plotW}
            y2={investY}
            className="stroke-destructive/50"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x={PAD.left + plotW}
            y={investY - 4}
            textAnchor="end"
            className="fill-destructive"
            fontSize={8}
            fontWeight={600}
          >
            Inversion
          </text>

          {/* Savings area */}
          <path
            d={`${savingsPath} L ${savingsPoints[savingsPoints.length - 1].x} ${PAD.top + plotH} L ${PAD.left} ${PAD.top + plotH} Z`}
            className="fill-primary/10"
          />

          {/* Savings line */}
          <path
            d={savingsPath}
            fill="none"
            className="stroke-primary"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Break-even dot */}
          {estimate.paybackYears <= YEARS_TO_SHOW && (
            <>
              <line
                x1={beX}
                y1={beY}
                x2={beX}
                y2={PAD.top + plotH}
                className="stroke-green-500/30"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              <circle
                cx={beX}
                cy={beY}
                r={4}
                className="fill-green-500 stroke-white"
                strokeWidth={1.5}
              />
              <text
                x={beX}
                y={beY - 8}
                textAnchor="middle"
                className="fill-green-600"
                fontSize={9}
                fontWeight={700}
              >
                {estimate.paybackYears.toFixed(1)}a
              </text>
            </>
          )}
        </svg>
      </CardContent>
    </Card>
  );
}

export function PaybackChart({ routeEstimates }: PaybackChartProps) {
  if (routeEstimates.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Punto de Equilibrio</p>
          <p className="text-sm text-muted-foreground mt-4">
            Selecciona rutas para comparar
          </p>
        </CardContent>
      </Card>
    );
  }

  const gridCols =
    routeEstimates.length === 1
      ? "grid-cols-1"
      : routeEstimates.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Punto de Equilibrio por Ruta
      </p>
      <div className={`grid gap-3 ${gridCols}`}>
        {routeEstimates.map(({ route, estimate }) => (
          <MiniPaybackCard
            key={route.routeId}
            route={route}
            estimate={estimate}
          />
        ))}
      </div>
    </div>
  );
}
