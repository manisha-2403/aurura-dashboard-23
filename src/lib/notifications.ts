import { useMemo } from "react";
import { AlertTriangle, PartyPopper, CalendarClock, type LucideIcon } from "lucide-react";

import { useFinance } from "./finance";
import { currentMonthKey, inMonth, totals } from "./analytics";
import { formatMoney } from "./format";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  tone: "danger" | "success" | "info";
  icon: LucideIcon;
};

export function useNotifications(): AppNotification[] {
  const { transactions, goals, settings } = useFinance();

  return useMemo(() => {
    const list: AppNotification[] = [];
    const monthTx = inMonth(transactions, currentMonthKey());
    const { expenses } = totals(monthTx);

    if (settings.monthlyBudget > 0) {
      if (expenses > settings.monthlyBudget) {
        list.push({
          id: "budget-exceeded",
          title: "Budget exceeded",
          body: `You're ${formatMoney(expenses - settings.monthlyBudget, settings.currency)} over this month's budget.`,
          tone: "danger",
          icon: AlertTriangle,
        });
      } else if (expenses >= settings.monthlyBudget * 0.8) {
        list.push({
          id: "budget-warning",
          title: "Budget almost used",
          body: `You've spent ${Math.round((expenses / settings.monthlyBudget) * 100)}% of this month's budget.`,
          tone: "info",
          icon: AlertTriangle,
        });
      }
    }

    for (const goal of goals) {
      if (goal.target > 0 && goal.saved >= goal.target) {
        list.push({
          id: `goal-${goal.id}`,
          title: "Goal achieved",
          body: `"${goal.title}" is fully funded. Nice work!`,
          tone: "success",
          icon: PartyPopper,
        });
      }
    }

    if (settings.monthlyReminder) {
      const now = new Date();
      const daysLeft =
        new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
      if (daysLeft <= 5) {
        list.push({
          id: "monthly-reminder",
          title: "Monthly review",
          body: `${daysLeft === 0 ? "Today is" : `${daysLeft} days until`} the end of the month — review your spending and set next month's budget.`,
          tone: "info",
          icon: CalendarClock,
        });
      }
    }

    return list;
  }, [transactions, goals, settings]);
}
