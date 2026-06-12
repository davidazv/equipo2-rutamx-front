import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly title?: string;
  readonly description?: string;
  readonly action?: React.ReactNode;
  readonly icon?: React.ReactNode;
}

function ErrorState({
  title = "Something went wrong",
  description,
  action,
  icon,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        {icon ?? <AlertCircle className="h-6 w-6" />}
      </div>
      {title && (
        <p className="text-base font-semibold text-foreground">{title}</p>
      )}
      {description && (
        <p className="max-w-xs text-sm text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export { ErrorState };
export type { ErrorStateProps };
