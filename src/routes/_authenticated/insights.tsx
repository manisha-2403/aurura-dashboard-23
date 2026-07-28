import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BrainCircuit,
  CalendarRange,
  Lightbulb,
  Loader2,
  PiggyBank,
  RefreshCw,
  Scissors,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { AiChat } from "@/components/ai-chat";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { buildSnapshot, fetchInsights } from "@/lib/ai";
import { useFinance } from "@/lib/finance";
import { formatMoney } from "@/lib/format";
import type { AiInsights } from "@/routes/api/insights";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — Aurora Ledger" },
      {
        name: "description",
        content:
          "AI-powered spending analysis, savings suggestions, expense predictions and a personal finance chatbot.",
      },
      { property: "og:title", content: "AI Insights — Aurora Ledger" },
      {
        property: "og:description",
        content: "AI-powered spending analysis, savings suggestions and a personal finance coach.",
      },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const { transactions, goals, settings, loading } = useFinance();
  const [insights, setInsights] = useState<AiInsights | null>(null);
  const [busy, setBusy] = useState(false);

  const snapshot = useMemo(
    () => buildSnapshot(transactions, goals, settings),
    [transactions, goals, settings],
  );

  async function generate() {
    if (transactions.length === 0) {
      toast.error("Add a few transactions first so Aurora has something to analyse.");
      return;
    }
    setBusy(true);
    try {
      setInsights(await fetchInsights(snapshot));
      toast.success("Fresh insights ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate insights.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="AI Insights"
      subtitle="Personalised analysis of your money"
      action={
        <Button
          onClick={() => void generate()}
          disabled={busy || loading}
          className="gradient-surface hidden rounded-xl text-primary-foreground sm:inline-flex"
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {insights ? "Refresh" : "Analyse"}
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Button
            onClick={() => void generate()}
            disabled={busy || loading}
            className="gradient-surface w-full rounded-xl text-primary-foreground sm:hidden"
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {insights ? "Refresh insights" : "Analyse my finances"}
          </Button>

          {busy && !insights ? (
            <LoadingState />
          ) : insights ? (
            <InsightsContent insights={insights} currency={settings.currency} />
          ) : (
            <EmptyState />
          )}
        </div>

        <AiChat context={snapshot} />
      </div>
    </AppShell>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass-card flex flex-col items-center gap-3 p-12 text-center">
      <span className="gradient-surface grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground">
        <BrainCircuit className="h-6 w-6" />
      </span>
      <h2 className="text-lg font-semibold">Let Aurora read your ledger</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Generate a personalised report covering spending habits, wasteful expenses, a savings target,
        next month's forecast and smart budget limits.
      </p>
    </div>
  );
}

function InsightsContent({ insights, currency }: { insights: AiInsights; currency: string }) {
  return (
    <div className="animate-rise space-y-6">
      <section className="glass-card relative overflow-hidden p-6">
        <div className="gradient-surface absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-2xl" />
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Overview
        </div>
        <p className="mt-3 text-sm leading-relaxed sm:text-base">{insights.summary}</p>
        {insights.healthVerdict && (
          <p className="mt-3 rounded-xl bg-accent/40 p-3 text-sm text-muted-foreground">
            {insights.healthVerdict}
          </p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          icon={PiggyBank}
          label="Suggested monthly saving"
          value={formatMoney(insights.suggestedMonthlySaving ?? 0, currency)}
          hint="Aurora's realistic target based on your cash flow"
          accent="success"
        />
        <MetricCard
          icon={TrendingUp}
          label="Predicted next month spend"
          value={formatMoney(insights.predictedNextMonthExpense ?? 0, currency)}
          hint={insights.trendNote}
          accent="primary"
        />
      </div>

      <ListCard
        icon={Wallet}
        title="Spending habits"
        description="Patterns Aurora found in your history"
        items={insights.spendingHabits}
      />

      {insights.unnecessaryExpenses?.length > 0 && (
        <section className="glass-card p-5">
          <CardHeading
            icon={Scissors}
            title="Trim these expenses"
            description="Likely avoidable spending"
          />
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {insights.unnecessaryExpenses.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-border/60 bg-accent/25 p-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold">{item.title}</p>
                  <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-xs font-bold text-success">
                    +{formatMoney(item.monthlySaving ?? 0, currency)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {insights.budgetRecommendations?.length > 0 && (
        <section className="glass-card p-5">
          <CardHeading
            icon={Lightbulb}
            title="Smart budget limits"
            description="Recommended monthly caps per category"
          />
          <ul className="mt-4 space-y-2">
            {insights.budgetRecommendations.map((rec) => (
              <li
                key={rec.category}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/50 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium capitalize">{rec.category}</p>
                  <p className="truncate text-xs text-muted-foreground">{rec.reason}</p>
                </div>
                <span className="shrink-0 font-display text-sm font-bold">
                  {formatMoney(rec.limit ?? 0, currency)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ListCard
        icon={Lightbulb}
        title="Personalised tips"
        description="Small moves with outsized impact"
        items={insights.tips}
      />

      {insights.weeklyReport && (
        <section className="glass-card p-5">
          <CardHeading
            icon={CalendarRange}
            title="Weekly report"
            description="Your week in one paragraph"
          />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {insights.weeklyReport}
          </p>
        </section>
      )}
    </div>
  );
}

function CardHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Wallet;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold">{title}</h2>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ListCard({
  icon,
  title,
  description,
  items,
}: {
  icon: typeof Wallet;
  title: string;
  description: string;
  items?: string[];
}) {
  if (!items?.length) return null;
  return (
    <section className="glass-card p-5">
      <CardHeading icon={icon} title={title} description={description} />
      <ul className="mt-4 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint?: string;
  accent: "primary" | "success";
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
            accent === "success" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
          }`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
      {hint && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}
