import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  HeartPulse,
  ArrowRight,
  Plus,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { ChartCard } from "@/components/chart-card";
import {
  CategoryPieChart,
  EmptyChart,
  IncomeVsExpenseChart,
  SavingsTrendChart,
} from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useFinance } from "@/lib/finance";
import {
  categoryBreakdown,
  currentMonthKey,
  financialHealthScore,
  inMonth,
  monthlyComparison,
  monthlySeries,
  percentChange,
  totals,
} from "@/lib/analytics";
import { formatDate, formatMoney } from "@/lib/format";
import { CATEGORY_MAP } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aurora Ledger" },
      {
        name: "description",
        content: "Your balance, income, expenses, savings and financial health at a glance.",
      },
      { property: "og:title", content: "Dashboard — Aurora Ledger" },
      {
        property: "og:description",
        content: "Your balance, income, expenses, savings and financial health at a glance.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { transactions, settings, loading } = useFinance();

  const all = useMemo(() => totals(transactions), [transactions]);
  const monthTx = useMemo(() => inMonth(transactions, currentMonthKey()), [transactions]);
  const month = useMemo(() => totals(monthTx), [monthTx]);
  const series = useMemo(() => monthlySeries(transactions, 6), [transactions]);
  const pie = useMemo(() => categoryBreakdown(monthTx, "expense"), [monthTx]);
  const compare = useMemo(() => monthlyComparison(transactions), [transactions]);
  const health = useMemo(
    () => financialHealthScore(monthTx, settings.monthlyBudget),
    [monthTx, settings.monthlyBudget],
  );

  const budgetUsed = settings.monthlyBudget > 0 ? month.expenses / settings.monthlyBudget : 0;
  const name = settings.displayName || user?.displayName || user?.email?.split("@")[0] || "there";
  const recent = transactions.slice(0, 6);

  return (
    <AppShell
      title="Dashboard"
      subtitle={new Date().toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })}
      action={
        <Button asChild size="sm" className="gradient-surface hidden rounded-full text-primary-foreground sm:inline-flex">
          <Link to="/transactions">
            <Plus className="mr-1.5 h-4 w-4" /> Add
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="glass-card relative overflow-hidden p-6 sm:p-8">
          <div className="gradient-surface pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-25 blur-3xl" />
          <div className="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
              <h2 className="mt-1 font-display text-2xl font-bold capitalize sm:text-3xl">
                Hey {name} 👋
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                {month.expenses === 0
                  ? "No spending logged this month yet — add your first transaction to see your trends come alive."
                  : `You've spent ${formatMoney(month.expenses, settings.currency)} this month and saved ${formatMoney(Math.max(month.balance, 0), settings.currency)}.`}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild className="gradient-surface rounded-full text-primary-foreground">
                  <Link to="/transactions">
                    <Plus className="mr-1.5 h-4 w-4" /> Add transaction
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/analytics">
                    View analytics <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-accent/25 p-5 text-center md:w-56">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Financial health
              </p>
              <div className="relative mx-auto mt-3 grid h-28 w-28 place-items-center">
                <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(health.score / 100) * 327} 327`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div>
                  <p className="font-display text-3xl font-bold">{health.score}</p>
                  <p className="text-[11px] text-muted-foreground">/ 100</p>
                </div>
              </div>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                <HeartPulse className="h-3.5 w-3.5" /> {health.label}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            loading={loading}
            label="Current balance"
            value={formatMoney(all.balance, settings.currency)}
            icon={Wallet}
            hint="All time"
          />
          <StatCard
            loading={loading}
            label="Total income"
            value={formatMoney(month.income, settings.currency)}
            icon={TrendingUp}
            accent="success"
            trend={percentChange(compare.current.income, compare.previous.income)}
            hint="vs last month"
          />
          <StatCard
            loading={loading}
            label="Total expenses"
            value={formatMoney(month.expenses, settings.currency)}
            icon={TrendingDown}
            accent="destructive"
            trend={-percentChange(compare.current.expenses, compare.previous.expenses)}
            hint="vs last month"
          />
          <StatCard
            loading={loading}
            label="Savings this month"
            value={formatMoney(Math.max(month.balance, 0), settings.currency)}
            icon={PiggyBank}
            accent="warning"
            hint={`${Math.round(month.savingsRate * 100)}% of income`}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="glass-card p-5 lg:col-span-1">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Monthly budget</h2>
              <Link to="/budget" className="text-xs font-medium text-primary hover:underline">
                Manage
              </Link>
            </div>
            {settings.monthlyBudget > 0 ? (
              <>
                <p className="mt-4 font-display text-2xl font-bold">
                  {formatMoney(month.expenses, settings.currency)}
                  <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                    of {formatMoney(settings.monthlyBudget, settings.currency)}
                  </span>
                </p>
                <Progress value={Math.min(budgetUsed * 100, 100)} className="mt-4 h-2.5" />
                <p
                  className={`mt-3 text-sm font-medium ${budgetUsed > 1 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {budgetUsed > 1
                    ? `${formatMoney(month.expenses - settings.monthlyBudget, settings.currency)} over budget`
                    : `${formatMoney(settings.monthlyBudget - month.expenses, settings.currency)} remaining`}
                </p>
              </>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-border/70 p-5 text-center">
                <p className="text-sm text-muted-foreground">No budget set for this month.</p>
                <Button asChild size="sm" variant="outline" className="mt-3 rounded-full">
                  <Link to="/budget">Set a budget</Link>
                </Button>
              </div>
            )}
          </div>

          <ChartCard
            title="Savings trend"
            description="Net savings over the last 6 months"
            loading={loading}
            className="lg:col-span-2"
          >
            <SavingsTrendChart data={series} currency={settings.currency} />
          </ChartCard>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Income vs expenses"
            description="Last 6 months"
            loading={loading}
          >
            <IncomeVsExpenseChart data={series} currency={settings.currency} />
          </ChartCard>

          <ChartCard
            title="Expenses by category"
            description="This month"
            loading={loading}
          >
            {pie.length ? (
              <CategoryPieChart data={pie} currency={settings.currency} />
            ) : (
              <EmptyChart message="Log a few expenses and this donut will break them down by category." />
            )}
          </ChartCard>
        </section>

        <section className="glass-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Recent transactions</h2>
            <Link to="/transactions" className="text-xs font-medium text-primary hover:underline">
              See all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))
            ) : recent.length ? (
              recent.map((t) => {
                const meta = CATEGORY_MAP[t.category];
                const Icon = meta?.icon ?? Wallet;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 p-3 transition-colors hover:bg-accent/40"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                      style={{ background: `color-mix(in oklab, ${meta?.color} 18%, transparent)` }}
                    >
                      <Icon className="h-4.5 w-4.5" style={{ color: meta?.color }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {t.note || meta?.label || "Transaction"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {meta?.label} · {formatDate(t.date)}
                      </p>
                    </div>
                    <p
                      className={`shrink-0 text-sm font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}
                    >
                      {t.type === "income" ? "+" : "−"}
                      {formatMoney(t.amount, settings.currency)}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No transactions yet. Add your first one to get started.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
