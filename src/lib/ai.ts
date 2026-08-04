import type { Stats } from "./analytics";
import {
  averageDailySpending,
  categoryBreakdown,
  currentMonthKey,
  financialHealthScore,
  inMonth,
  monthlySeries,
  totals,
} from "./analytics";
import type { Goal, Transaction, UserSettings } from "./types";
import type { AiInsights } from "@/routes/api/insights";

export type FinanceSnapshot = {
  currency: string;
  monthlyBudget: number;
  month: string;
  totalsAllTime: Stats;
  totalsThisMonth: Stats;
  averageDailySpending: number;
  healthScore: number;
  monthlySeries: { month: string; income: number; expenses: number; savings: number }[];
  topExpenseCategories: { name: string; value: number }[];
  goals: { title: string; target: number; saved: number; deadline: string }[];
};

export function buildSnapshot(
  transactions: Transaction[],
  goals: Goal[],
  settings: UserSettings,
): FinanceSnapshot {
  const key = currentMonthKey();
  const monthTx = inMonth(transactions, key);
  return {
    currency: settings.currency,
    monthlyBudget: settings.monthlyBudget,
    month: key,
    totalsAllTime: totals(transactions),
    totalsThisMonth: totals(monthTx),
    averageDailySpending: averageDailySpending(transactions),
    healthScore: financialHealthScore(monthTx, settings.monthlyBudget).score,
    monthlySeries: monthlySeries(transactions, 6).map(({ month, income, expenses, savings }) => ({
      month,
      income,
      expenses,
      savings,
    })),
    topExpenseCategories: categoryBreakdown(transactions, "expense")
      .slice(0, 6)
      .map(({ name, value }) => ({ name, value })),
    goals: goals.map((g) => ({
      title: g.title,
      target: g.target,
      saved: g.saved,
      deadline: g.deadline,
    })),
  };
}

export async function fetchInsights(snapshot: FinanceSnapshot): Promise<AiInsights> {
  const res = await fetch("/api/insights", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(snapshot),
  });
  const data = (await res.json().catch(() => null)) as (AiInsights & { error?: string }) | null;
  if (!res.ok || !data || data.error) {
    throw new Error(data?.error ?? "Could not generate insights right now.");
  }
  return data;
}

/** Streams an assistant reply, invoking `onDelta` with each text chunk. */
export async function streamChat(
  messages: { role: "user" | "assistant"; content: string }[],
  context: unknown,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, context }),
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error((await res.text().catch(() => "")) || "Aurora is unavailable right now.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const parsed = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) onDelta(text);
      } catch {
        /* partial frame — ignore */
      }
    }
  }
}
