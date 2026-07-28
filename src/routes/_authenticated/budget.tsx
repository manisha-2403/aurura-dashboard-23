import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PiggyBank, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { currentMonthKey, inMonth, totals } from "@/lib/analytics";
import { useFinance } from "@/lib/finance";
import { formatMoney } from "@/lib/format";
import { CATEGORIES, type CategoryId } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({
    meta: [
      { title: "Budget — Aurora Ledger" },
      {
        name: "description",
        content: "Set a monthly budget and per-category limits, and track them in real time.",
      },
      { property: "og:title", content: "Budget — Aurora Ledger" },
      {
        property: "og:description",
        content: "Set a monthly budget and per-category limits, and track them in real time.",
      },
    ],
  }),
  component: BudgetPage,
});

const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.kind !== "income");

function BudgetPage() {
  const { transactions, settings, saveSettings, loading } = useFinance();
  const [monthly, setMonthly] = useState<string | null>(null);
  const [limits, setLimits] = useState<Partial<Record<CategoryId, string>>>({});
  const [busy, setBusy] = useState(false);

  const monthTx = useMemo(() => inMonth(transactions, currentMonthKey()), [transactions]);
  const spent = totals(monthTx).expenses;
  const perCategory = useMemo(() => {
    const map = new Map<CategoryId, number>();
    for (const t of monthTx) {
      if (t.type !== "expense") continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return map;
  }, [monthTx]);

  const monthlyValue = monthly ?? String(settings.monthlyBudget || "");
  const budget = Number(monthlyValue) || 0;
  const usage = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const categoryBudgets: Partial<Record<CategoryId, number>> = { ...settings.categoryBudgets };
      for (const [id, value] of Object.entries(limits)) {
        const num = Number(value);
        if (!value || Number.isNaN(num) || num <= 0) delete categoryBudgets[id as CategoryId];
        else categoryBudgets[id as CategoryId] = num;
      }
      await saveSettings({ monthlyBudget: budget, categoryBudgets });
      toast.success("Budget saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your budget.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Budget" subtitle="Plan the month, then stay inside the lines">
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <form onSubmit={onSave} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <section className="glass-card space-y-5 p-6">
            <div className="flex items-center gap-3">
              <span className="gradient-surface grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary-foreground">
                <PiggyBank className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">Monthly budget</h2>
                <p className="truncate text-xs text-muted-foreground">
                  Total you allow yourself to spend
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly">Amount ({settings.currency})</Label>
              <Input
                id="monthly"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="2500"
                className="h-11 rounded-xl"
                value={monthlyValue}
                onChange={(e) => setMonthly(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Spent this month</span>
                <span className="font-display font-bold">
                  {formatMoney(spent, settings.currency)}
                </span>
              </div>
              <Progress value={usage} className="mt-2 h-2.5" />
              <p className="mt-2 text-xs text-muted-foreground">
                {budget > 0
                  ? `${usage.toFixed(0)}% used · ${formatMoney(Math.max(budget - spent, 0), settings.currency)} left`
                  : "Set a budget to track your usage."}
              </p>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="gradient-surface h-11 w-full rounded-xl text-primary-foreground"
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save budget
            </Button>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-base font-semibold">Category limits</h2>
            <p className="text-xs text-muted-foreground">Leave blank to skip a category</p>
            <ul className="mt-4 space-y-3">
              {EXPENSE_CATEGORIES.map((cat) => {
                const used = perCategory.get(cat.id) ?? 0;
                const raw = limits[cat.id] ?? String(settings.categoryBudgets[cat.id] ?? "");
                const limit = Number(raw) || 0;
                const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
                const over = limit > 0 && used > limit;
                return (
                  <li key={cat.id} className="rounded-2xl border border-border/50 p-3">
                    <div className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                          style={{ background: `color-mix(in oklab, ${cat.color} 18%, transparent)` }}
                        >
                          <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{cat.label}</p>
                          <p
                            className={`truncate text-xs ${over ? "text-destructive" : "text-muted-foreground"}`}
                          >
                            {formatMoney(used, settings.currency)} spent
                          </p>
                        </div>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        inputMode="decimal"
                        aria-label={`${cat.label} monthly limit`}
                        placeholder="—"
                        className="h-10 rounded-xl text-right"
                        value={raw}
                        onChange={(e) => setLimits((p) => ({ ...p, [cat.id]: e.target.value }))}
                      />
                    </div>
                    {limit > 0 && <Progress value={pct} className="mt-2.5 h-1.5" />}
                  </li>
                );
              })}
            </ul>
          </section>
        </form>
      )}
    </AppShell>
  );
}
