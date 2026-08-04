import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinance } from "@/lib/finance";
import { todayISO } from "@/lib/format";
import { categoriesFor, type CategoryId, type Transaction, type TransactionType } from "@/lib/types";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be greater than zero").max(1_000_000_000),
  category: z.string().min(1, "Pick a category"),
  date: z.string().min(1, "Pick a date"),
  note: z.string().trim().max(140, "Note must be under 140 characters"),
});

export function TransactionDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing?: Transaction | null;
}) {
  const { addTransaction, updateTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId>("food");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setDate(editing.date);
      setNote(editing.note ?? "");
    } else {
      setType("expense");
      setAmount("");
      setCategory("food");
      setDate(todayISO());
      setNote("");
    }
  }, [open, editing]);

  const options = categoriesFor(type);

  function changeType(next: TransactionType) {
    setType(next);
    const valid = categoriesFor(next);
    if (!valid.some((c) => c.id === category)) setCategory(valid[0].id);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({
      type,
      amount: Number(amount),
      category,
      date,
      note,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const payload = { ...parsed.data, category: parsed.data.category as CategoryId };
      if (editing) {
        await updateTransaction(editing.id, payload);
        toast.success("Transaction updated");
      } else {
        await addTransaction(payload);
        toast.success("Transaction added");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save transaction");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle>
          <DialogDescription>
            Keep your ledger accurate — every entry sharpens your insights.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => changeType(t)}
                className={`rounded-lg py-2 text-sm font-medium capitalize transition-all ${
                  type === t
                    ? "gradient-surface text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                className="h-11 rounded-xl"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                required
                className="h-11 rounded-xl"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as CategoryId)}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {options.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <c.icon className="h-4 w-4" style={{ color: c.color }} />
                      {c.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              rows={2}
              maxLength={140}
              placeholder="Coffee with the team"
              className="rounded-xl"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="gradient-surface rounded-full text-primary-foreground"
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Add transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
