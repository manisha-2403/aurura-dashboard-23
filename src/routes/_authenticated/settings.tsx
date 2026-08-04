import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Aurora Ledger" },
      { name: "description", content: "Settings tools for your Aurora Ledger finances." },
      { property: "og:title", content: "Settings — Aurora Ledger" },
      { property: "og:description", content: "Settings tools for your Aurora Ledger finances." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Coming up next">
      <div className="glass-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          The Settings module is being built in the next stage.
        </p>
      </div>
    </AppShell>
  );
}
