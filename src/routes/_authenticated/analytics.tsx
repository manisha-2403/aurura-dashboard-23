import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { ChartCard } from "@/components/chart-card";
import {
  CategoryPieChart,
  EmptyChart,
  IncomeVsExpenseChart,
  MonthlyLineChart,
  SavingsTrendChart,
} from "@/components/charts";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  averageDailySpending,
  categoryBreakdown,
  monthlyComparison,
  monthlySeries,
  percentChange,
  totals,
  weeklyComparison,
  yearlyReport,
} from "@/lib/analytics";
import { exportTransactionsCSV, exportTransactionsPDF } from "@/lib/export";
import { useFinance } from "@/lib/finance";
import { formatMoney } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { ArrowLeftRight, CalendarClock, TrendingDown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Aurora Ledger" },
      {
        name: "description",
        content:
          "Visualise income, expenses, savings trends and category breakdowns across any period.",
      },
      { property: "og:title", content: "Analytics — Aurora Ledger" },
      {
        property: "og:description",
        content: "Visualise income, expenses, savings trends and category breakdowns.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { transactions, settings, loading } = useFinance();
  const { user } = useAuth();
  const [range, setRange] = useState("6");

  const months = Number(range);
  const series = useMemo(() => monthlySeries(transactions, months), [transactions, months]);
  const scoped = useMemo(() => {
    const keys = new Set(series.map((s) => s.key));
    return transactions.filter((t) => keys.has(t.date.slice(0, 7)));
  }, [transactions, series]);

  const stats = totals(scoped);
  const expenseByCategory = useMemo(() => categoryBreakdown(scoped, "expense"), [scoped]);
  const incomeByCategory = useMemo(() => categoryBreakdown(scoped, "income"), [scoped]);
  const week = useMemo(() => weeklyComparison(transactions), [transactions]);
  const month = useMemo(() => monthlyComparison(transactions), [transactions]);
  const year = useMemo(() => yearlyReport(transactions), [transactions]);

  const hasData = scoped.length > 0;

  return (
    <AppShell
      title="Analytics"
      subtitle="Where your money comes from and where it goes"
      action={
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="h-9 w-[7.5rem] rounded-xl" aria-label="Select period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="3">Last 3 months</SelectItem>
            <SelectItem value="6">Last 6 months</SelectItem>
            <SelectItem value="12">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Income"
            value={formatMoney(stats.income, settings.currency)}
            icon={TrendingUp}
            accent="success"
            loading={loading}
            trend={percentChange(month.current.income, month.previous.income)}
            hint="vs last month"
          />
          <StatCard
            label="Expenses"
            value={formatMoney(stats.expenses, settings.currency)}
            icon={TrendingDown}
            accent="destructive"
            loading={loading}
            trend={percentChange(month.current.expenses, month.previous.expenses)}
            hint="vs last month"
          />
          <StatCard
            label="Net savings"
            value={formatMoney(stats.balance, settings.currency)}
            icon={ArrowLeftRight}
            accent="primary"
            loading={loading}
            hint={`${(stats.savingsRate * 100).toFixed(0)}% savings rate`}
          />
          <StatCard
            label="Avg daily spend"
            value={formatMoney(averageDailySpending(transactions), settings.currency)}
            icon={CalendarClock}
            accent="warning"
            loading={loading}
            trend={percentChange(week.current.expenses, week.previous.expenses)}
            hint="vs last week"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Income trend" description="Monthly income" loading={loading}>
            {hasData ? (
              <MonthlyLineChart
                data={series}
                dataKey="income"
                color="var(--chart-4)"
                currency={settings.currency}
              />
            ) : (
              <EmptyChart message="No income recorded in this period yet." />
            )}
          </ChartCard>

          <ChartCard title="Expense trend" description="Monthly spending" loading={loading}>
            {hasData ? (
              <MonthlyLineChart
                data={series}
                dataKey="expenses"
                color="var(--chart-2)"
                currency={settings.currency}
              />
            ) : (
              <EmptyChart message="No expenses recorded in this period yet." />
            )}
          </ChartCard>

          <ChartCard
            title="Income vs expenses"
            description="Side-by-side comparison"
            loading={loading}
          >
            {hasData ? (
              <IncomeVsExpenseChart data={series} currency={settings.currency} />
            ) : (
              <EmptyChart message="Add transactions to compare income and expenses." />
            )}
          </ChartCard>

          <ChartCard title="Savings trend" description="Net saved each month" loading={loading}>
            {hasData ? (
              <SavingsTrendChart data={series} currency={settings.currency} />
            ) : (
              <EmptyChart message="Your savings curve will appear here." />
            )}
          </ChartCard>

          <ChartCard
            title="Spending by category"
            description="Where your money goes"
            loading={loading}
          >
            {expenseByCategory.length ? (
              <CategoryPieChart data={expenseByCategory} currency={settings.currency} />
            ) : (
              <EmptyChart message="No categorised expenses in this period." />
            )}
          </ChartCard>

          <ChartCard
            title="Income sources"
            description="How you earn"
            loading={loading}
          >
            {incomeByCategory.length ? (
              <CategoryPieChart data={incomeByCategory} currency={settings.currency} />
            ) : (
              <EmptyChart message="No income sources recorded in this period." />
            )}
          </ChartCard>
        </div>

        <ChartCard
          title={`${new Date().getFullYear()} yearly report`}
          description="Every month at a glance"
          loading={loading}
          action={
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  if (!transactions.length) return toast.error("Nothing to export yet.");
                  exportTransactionsCSV(transactions, "aurora-report.csv");
                  toast.success("CSV downloaded.");
                }}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={async () => {
                  if (!transactions.length) return toast.error("Nothing to export yet.");
                  await exportTransactionsPDF(
                    transactions,
                    settings.currency,
                    settings.displayName || user?.email || "",
                  );
                  toast.success("PDF downloaded.");
                }}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" /> PDF
              </Button>
            </div>
          }
        >
          {hasData ? (
            <IncomeVsExpenseChart data={year} currency={settings.currency} />
          ) : (
            <EmptyChart message="This year's report will build as you log transactions." />
          )}
        </ChartCard>
      </div>
    </AppShell>
  );
}
