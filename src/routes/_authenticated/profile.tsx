import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Aurora Ledger" },
      { name: "description", content: "Profile tools for your Aurora Ledger finances." },
      { property: "og:title", content: "Profile — Aurora Ledger" },
      { property: "og:description", content: "Profile tools for your Aurora Ledger finances." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AppShell title="Profile" subtitle="Coming up next">
      <div className="glass-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          The Profile module is being built in the next stage.
        </p>
      </div>
    </AppShell>
  );
}
