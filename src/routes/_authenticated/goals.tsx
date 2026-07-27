import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Goals — Aurora Ledger" },
      { name: "description", content: "Goals tools for your Aurora Ledger finances." },
      { property: "og:title", content: "Goals — Aurora Ledger" },
      { property: "og:description", content: "Goals tools for your Aurora Ledger finances." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  return (
    <AppShell title="Goals" subtitle="Coming up next">
      <div className="glass-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          The Goals module is being built in the next stage.
        </p>
      </div>
    </AppShell>
  );
}
