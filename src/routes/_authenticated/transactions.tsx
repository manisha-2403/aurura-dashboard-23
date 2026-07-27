import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { TransactionDialog } from "@/components/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFinance } from "@/lib/finance";
import { formatDate, formatMoney } from "@/lib/format";
import { exportTransactionsCSV, exportTransactionsPDF } from "@/lib/export";
import { CATEGORIES, CATEGORY_MAP, type Transaction } from "@/lib/types";
import { totals } from "@/lib/analytics";

export const Route = createFileRoute("/_authenticated/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Aurora Ledger" },
      {
        name: "description",
        content: "Add, edit, search and export every income and expense in your ledger.",
      },
      { property: "og:title", content: "Transactions — Aurora Ledger" },
      {
        property: "og:description",
        content: "Add, edit, search and export every income and expense in your ledger.",
      },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { transactions, settings, loading, deleteTransaction } = useFinance();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("date-desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = transactions.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.note.toLowerCase().includes(q) ||
        (CATEGORY_MAP[t.category]?.label ?? "").toLowerCase().includes(q)
      );
    });
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        default:
          return b.date.localeCompare(a.date);
      }
    });
    return sorted;
  }, [transactions, search, type, category, sort]);

  const stats = useMemo(() => totals(filtered), [filtered]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteTransaction(pendingDelete.id);
      toast.success("Transaction deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete");
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <AppShell
      title="Transactions"
      subtitle={`${filtered.length} of ${transactions.length} entries`}
      action={
        <Button
          size="sm"
          className="gradient-surface rounded-full text-primary-foreground"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="glass-card grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes or categories…"
              className="h-11 rounded-xl pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="col-span-2 h-11 rounded-xl sm:col-span-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest first</SelectItem>
                <SelectItem value="date-asc">Oldest first</SelectItem>
                <SelectItem value="amount-desc">Highest amount</SelectItem>
                <SelectItem value="amount-asc">Lowest amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Filtered income", value: stats.income, tone: "text-success" },
            { label: "Filtered expenses", value: stats.expenses, tone: "text-destructive" },
            { label: "Net", value: stats.balance, tone: "text-foreground" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <p className={`mt-1 font-display text-xl font-bold ${s.tone}`}>
                {formatMoney(s.value, settings.currency)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => exportTransactionsCSV(filtered)}
            disabled={!filtered.length}
          >
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={!filtered.length}
            onClick={() =>
              exportTransactionsPDF(filtered, settings.currency, settings.displayName)
            }
          >
            <FileText className="mr-1.5 h-4 w-4" /> Export PDF
          </Button>
        </div>

        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length ? (
            <ul className="divide-y divide-border/40">
              {filtered.map((t) => {
                const meta = CATEGORY_MAP[t.category];
                const Icon = meta?.icon ?? Search;
                return (
                  <li
                    key={t.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 transition-colors hover:bg-accent/30"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                      style={{ background: `color-mix(in oklab, ${meta?.color} 18%, transparent)` }}
                    >
                      <Icon className="h-4.5 w-4.5" style={{ color: meta?.color }} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {t.note || meta?.label || "Transaction"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {meta?.label} · {formatDate(t.date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                      <p
                        className={`text-sm font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}
                      >
                        {t.type === "income" ? "+" : "−"}
                        {formatMoney(t.amount, settings.currency)}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        aria-label="Edit transaction"
                        onClick={() => {
                          setEditing(t);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                        aria-label="Delete transaction"
                        onClick={() => setPendingDelete(t)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">
                Nothing matches these filters yet.
              </p>
              <Button
                className="gradient-surface mt-4 rounded-full text-primary-foreground"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add transaction
              </Button>
            </div>
          )}
        </div>
      </div>

      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />

      <AlertDialog open={!!pendingDelete} onOpenChange={(v) => !v && setPendingDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the entry from your ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
