import { CATEGORIES, CATEGORY_MAP, type CategoryId, type Transaction } from "./types";
import { monthKey, monthLabel } from "./format";

export type Stats = {
  income: number;
  expenses: number;
  balance: number;
  savings: number;
  savingsRate: number;
};

export function totals(transactions: Transaction[]): Stats {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  }
  const savings = income - expenses;
  return {
    income,
    expenses,
    balance: savings,
    savings: Math.max(savings, 0),
    savingsRate: income > 0 ? Math.max(0, Math.min(1, savings / income)) : 0,
  };
}

export function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function inMonth(transactions: Transaction[], key: string) {
  return transactions.filter((t) => monthKey(t.date) === key);
}

/** Last N months (oldest first) with income / expense / savings series. */
export function monthlySeries(transactions: Transaction[], months = 6) {
  const now = new Date();
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys.map((key) => {
    const rows = inMonth(transactions, key);
    const t = totals(rows);
    return {
      key,
      month: monthLabel(key),
      income: round(t.income),
      expenses: round(t.expenses),
      savings: round(t.balance),
    };
  });
}

export function categoryBreakdown(transactions: Transaction[], type: "expense" | "income") {
  const map = new Map<CategoryId, number>();
  for (const t of transactions) {
    if (t.type !== type) continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return CATEGORIES.filter((c) => map.has(c.id))
    .map((c) => ({ id: c.id, name: c.label, value: round(map.get(c.id) ?? 0), color: c.color }))
    .sort((a, b) => b.value - a.value);
}

export function highestExpenseCategory(transactions: Transaction[]) {
  const rows = categoryBreakdown(transactions, "expense");
  if (!rows.length) return null;
  const top = rows[0];
  return { ...top, meta: CATEGORY_MAP[top.id] };
}

export function averageDailySpending(transactions: Transaction[], days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const total = transactions
    .filter((t) => t.type === "expense" && new Date(`${t.date}T00:00:00`) >= cutoff)
    .reduce((sum, t) => sum + t.amount, 0);
  return round(total / days);
}

function rangeTotal(transactions: Transaction[], from: Date, to: Date) {
  const rows = transactions.filter((t) => {
    const d = new Date(`${t.date}T00:00:00`);
    return d >= from && d < to;
  });
  return totals(rows);
}

export function weeklyComparison(transactions: Transaction[]) {
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setHours(0, 0, 0, 0);
  startOfThisWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  const endOfThisWeek = new Date(startOfThisWeek);
  endOfThisWeek.setDate(startOfThisWeek.getDate() + 7);

  return {
    current: rangeTotal(transactions, startOfThisWeek, endOfThisWeek),
    previous: rangeTotal(transactions, startOfLastWeek, startOfThisWeek),
  };
}

export function monthlyComparison(transactions: Transaction[]) {
  const now = new Date();
  const startThis = new Date(now.getFullYear(), now.getMonth(), 1);
  const startNext = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    current: rangeTotal(transactions, startThis, startNext),
    previous: rangeTotal(transactions, startPrev, startThis),
  };
}

export function yearlyReport(transactions: Transaction[], year = new Date().getFullYear()) {
  return Array.from({ length: 12 }, (_, i) => {
    const key = `${year}-${String(i + 1).padStart(2, "0")}`;
    const t = totals(inMonth(transactions, key));
    return {
      key,
      month: new Date(year, i, 1).toLocaleDateString(undefined, { month: "short" }),
      income: round(t.income),
      expenses: round(t.expenses),
      savings: round(t.balance),
    };
  });
}

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return round(((current - previous) / previous) * 100);
}

/**
 * Financial health score (0-100):
 *  - 50 pts savings rate (savings / income, capped at 30% = full marks)
 *  - 30 pts budget adherence (spend under monthly budget)
 *  - 20 pts diversification (no single category over 40% of spending)
 */
export function financialHealthScore(monthTx: Transaction[], monthlyBudget: number) {
  const t = totals(monthTx);
  const savingsPoints = Math.round(Math.min(t.savingsRate / 0.3, 1) * 50);

  let budgetPoints = 15;
  if (monthlyBudget > 0) {
    const usage = t.expenses / monthlyBudget;
    budgetPoints = Math.round(Math.max(0, Math.min(1, 1.25 - usage)) * 30);
  }

  const breakdown = categoryBreakdown(monthTx, "expense");
  let diversityPoints = 20;
  if (t.expenses > 0 && breakdown.length) {
    const share = breakdown[0].value / t.expenses;
    diversityPoints = Math.round(Math.max(0, Math.min(1, (1 - share) / 0.6)) * 20);
  }

  const score = Math.max(0, Math.min(100, savingsPoints + budgetPoints + diversityPoints));
  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Healthy" : score >= 40 ? "Fair" : "Needs work";
  return { score, label, savingsPoints, budgetPoints, diversityPoints };
}

export function round(n: number) {
  return Math.round(n * 100) / 100;
}
