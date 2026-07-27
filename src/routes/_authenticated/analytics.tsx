import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Aurora Ledger" },
      { name: "description", content: "Analytics tools for your Aurora Ledger finances." },
      { property: "og:title", content: "Analytics — Aurora Ledger" },
      { property: "og:description", content: "Analytics tools for your Aurora Ledger finances." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <AppShell title="Analytics" subtitle="Coming up next">
      <div className="glass-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          The Analytics module is being built in the next stage.
        </p>
      </div>
    </AppShell>
  );
}
