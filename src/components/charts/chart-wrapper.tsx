"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface ChartWrapperProps {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly loading?: boolean;
  readonly className?: string;
}

export function ChartWrapper({
  title,
  description,
  children,
  loading = false,
  className,
}: ChartWrapperProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="chart-container h-[250px]">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
