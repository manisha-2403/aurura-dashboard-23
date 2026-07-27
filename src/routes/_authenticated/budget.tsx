import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({
    meta: [
      { title: "Budget — Aurora Ledger" },
      { name: "description", content: "Budget tools for your Aurora Ledger finances." },
      { property: "og:title", content: "Budget — Aurora Ledger" },
      { property: "og:description", content: "Budget tools for your Aurora Ledger finances." },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  return (
    <AppShell title="Budget" subtitle="Coming up next">
      <div className="glass-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          The Budget module is being built in the next stage.
        </p>
      </div>
    </AppShell>
  );
}
