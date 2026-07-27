import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export function ChartCard({
  title,
  description,
  children,
  action,
  loading,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <section className={`glass-card p-5 ${className ?? ""}`}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{title}</h2>
          {description && (
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-4">
        {loading ? <Skeleton className="h-64 w-full rounded-xl" /> : children}
      </div>
    </section>
  );
}
