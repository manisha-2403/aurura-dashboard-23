import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "./auth";
import {
  DEFAULT_SETTINGS,
  type CategoryId,
  type Goal,
  type Transaction,
  type TransactionType,
  type UserSettings,
} from "./types";

type FinanceContextValue = {
  transactions: Transaction[];
  goals: Goal[];
  settings: UserSettings;
  loading: boolean;
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (g: Omit<Goal, "id" | "createdAt">) => Promise<void>;
  updateGoal: (id: string, g: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  saveSettings: (s: Partial<UserSettings>) => Promise<void>;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

type TxRow = {
  id: string;
  type: string;
  amount: number | string;
  category: string;
  date: string;
  note: string | null;
  created_at: string;
};

type GoalRow = {
  id: string;
  title: string;
  target: number | string;
  saved: number | string;
  deadline: string | null;
  created_at: string;
};

const num = (v: number | string | null | undefined) => Number(v ?? 0);

function mapTx(row: TxRow): Transaction {
  return {
    id: row.id,
    type: row.type as TransactionType,
    amount: num(row.amount),
    category: row.category as CategoryId,
    date: row.date,
    note: row.note ?? "",
    createdAt: new Date(row.created_at).getTime(),
  };
}

function mapGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    target: num(row.target),
    saved: num(row.saved),
    deadline: row.deadline ?? "",
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!uid) {
      setTransactions([]);
      setGoals([]);
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [tx, gl, pr] = await Promise.all([
      supabase.from("transactions").select("*").order("date", { ascending: false }),
      supabase.from("goals").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
    ]);

    setTransactions(((tx.data ?? []) as TxRow[]).map(mapTx));
    setGoals(((gl.data ?? []) as GoalRow[]).map(mapGoal));

    const p = pr.data as Record<string, unknown> | null;
    setSettings({
      ...DEFAULT_SETTINGS,
      displayName: (p?.display_name as string) || user?.displayName || "",
      photoURL: (p?.photo_url as string) || user?.photoURL || "",
      bio: (p?.bio as string) ?? "",
      phone: (p?.phone as string) ?? "",
      currency: (p?.currency as string) || DEFAULT_SETTINGS.currency,
      monthlyBudget: num(p?.monthly_budget as number | undefined),
      categoryBudgets:
        (p?.category_budgets as UserSettings["categoryBudgets"]) ?? DEFAULT_SETTINGS.categoryBudgets,
      monthlyReminder: (p?.monthly_reminder as boolean) ?? true,
    });
    setLoading(false);
  }, [uid, user?.displayName, user?.photoURL]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<FinanceContextValue>(() => {
    const requireUser = () => {
      if (!uid) throw new Error("You need to be signed in to do that.");
      return uid;
    };
    const check = (error: { message: string } | null) => {
      if (error) throw new Error(error.message);
    };

    return {
      transactions,
      goals,
      settings,
      loading,
      async addTransaction(t) {
        const id = requireUser();
        const { error } = await supabase.from("transactions").insert({
          user_id: id,
          type: t.type,
          amount: t.amount,
          category: t.category,
          date: t.date,
          note: t.note ?? "",
        });
        check(error);
        await refresh();
      },
      async updateTransaction(txId, t) {
        requireUser();
        const patch: TablesUpdate<"transactions"> = {};
        if (t.type !== undefined) patch.type = t.type;
        if (t.amount !== undefined) patch.amount = t.amount;
        if (t.category !== undefined) patch.category = t.category;
        if (t.date !== undefined) patch.date = t.date;
        if (t.note !== undefined) patch.note = t.note;
        const { error } = await supabase.from("transactions").update(patch).eq("id", txId);
        check(error);
        await refresh();
      },
      async deleteTransaction(txId) {
        requireUser();
        const { error } = await supabase.from("transactions").delete().eq("id", txId);
        check(error);
        await refresh();
      },
      async addGoal(g) {
        const id = requireUser();
        const { error } = await supabase.from("goals").insert({
          user_id: id,
          title: g.title,
          target: g.target,
          saved: g.saved,
          deadline: g.deadline || null,
        });
        check(error);
        await refresh();
      },
      async updateGoal(goalId, g) {
        requireUser();
        const patch: TablesUpdate<"goals"> = {};
        if (g.title !== undefined) patch.title = g.title;
        if (g.target !== undefined) patch.target = g.target;
        if (g.saved !== undefined) patch.saved = g.saved;
        if (g.deadline !== undefined) patch.deadline = g.deadline || null;
        const { error } = await supabase.from("goals").update(patch).eq("id", goalId);
        check(error);
        await refresh();
      },
      async deleteGoal(goalId) {
        requireUser();
        const { error } = await supabase.from("goals").delete().eq("id", goalId);
        check(error);
        await refresh();
      },
      async saveSettings(s) {
        const id = requireUser();
        setSettings((prev) => ({ ...prev, ...s }));
        const patch: TablesInsert<"profiles"> = { id };
        if (s.displayName !== undefined) patch.display_name = s.displayName;
        if (s.photoURL !== undefined) patch.photo_url = s.photoURL;
        if (s.bio !== undefined) patch.bio = s.bio;
        if (s.phone !== undefined) patch.phone = s.phone;
        if (s.currency !== undefined) patch.currency = s.currency;
        if (s.monthlyBudget !== undefined) patch.monthly_budget = s.monthlyBudget;
        if (s.categoryBudgets !== undefined) patch.category_budgets = s.categoryBudgets;
        if (s.monthlyReminder !== undefined) patch.monthly_reminder = s.monthlyReminder;
        const { error } = await supabase.from("profiles").upsert(patch, { onConflict: "id" });
        check(error);
      },
    };
  }, [transactions, goals, settings, loading, uid, refresh]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}
