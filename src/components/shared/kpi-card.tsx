import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface KpiCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly sub?: string;
  readonly icon?: ReactNode;
}

export function KpiCard({ title, value, sub, icon }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-primary">{icon}</span>
            </div>
          )}
          <div>
            <p className="text-xs text-text-secondary">{title}</p>
            <p className="text-xl font-bold leading-none tabular-nums">{value}</p>
            {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
