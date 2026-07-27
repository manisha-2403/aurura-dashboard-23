import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { getDb } from "./firebase";
import { useAuth } from "./auth";
import { DEFAULT_SETTINGS, type Goal, type Transaction, type UserSettings } from "./types";

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

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDb();
    if (!db || !user) {
      setTransactions([]);
      setGoals([]);
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }
    setLoading(true);
    let pending = 3;
    const done = () => {
      pending -= 1;
      if (pending <= 0) setLoading(false);
    };

    const unsubTx = onSnapshot(
      query(collection(db, "users", user.uid, "transactions"), orderBy("date", "desc")),
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction));
        done();
      },
      () => done(),
    );

    const unsubGoals = onSnapshot(
      collection(db, "users", user.uid, "goals"),
      (snap) => {
        setGoals(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Goal));
        done();
      },
      () => done(),
    );

    const unsubSettings = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const data = (snap.data() ?? {}) as Partial<UserSettings>;
        setSettings({
          ...DEFAULT_SETTINGS,
          displayName: user.displayName ?? "",
          photoURL: user.photoURL ?? "",
          ...data,
        });
        done();
      },
      () => done(),
    );

    return () => {
      unsubTx();
      unsubGoals();
      unsubSettings();
    };
  }, [user]);

  const value = useMemo<FinanceContextValue>(() => {
    const uid = user?.uid;
    const requireDb = () => {
      const db = getDb();
      if (!db || !uid) throw new Error("You need to be signed in to do that.");
      return { db, uid };
    };

    return {
      transactions,
      goals,
      settings,
      loading,
      async addTransaction(t) {
        const { db, uid } = requireDb();
        await addDoc(collection(db, "users", uid, "transactions"), {
          ...t,
          createdAt: Date.now(),
        });
      },
      async updateTransaction(id, t) {
        const { db, uid } = requireDb();
        await updateDoc(doc(db, "users", uid, "transactions", id), t);
      },
      async deleteTransaction(id) {
        const { db, uid } = requireDb();
        await deleteDoc(doc(db, "users", uid, "transactions", id));
      },
      async addGoal(g) {
        const { db, uid } = requireDb();
        await addDoc(collection(db, "users", uid, "goals"), { ...g, createdAt: Date.now() });
      },
      async updateGoal(id, g) {
        const { db, uid } = requireDb();
        await updateDoc(doc(db, "users", uid, "goals", id), g);
      },
      async deleteGoal(id) {
        const { db, uid } = requireDb();
        await deleteDoc(doc(db, "users", uid, "goals", id));
      },
      async saveSettings(s) {
        const { db, uid } = requireDb();
        setSettings((prev) => ({ ...prev, ...s }));
        await setDoc(doc(db, "users", uid), s, { merge: true });
      },
    };
  }, [transactions, goals, settings, loading, user]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}
