import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Loader2, Plus, Target, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinance } from "@/lib/finance";
import { formatDate, formatMoney, todayISO } from "@/lib/format";
import type { Goal } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Savings goals — Aurora Ledger" },
      {
        name: "description",
        content: "Create savings goals, add contributions and watch your progress grow.",
      },
      { property: "og:title", content: "Savings goals — Aurora Ledger" },
      {
        property: "og:description",
        content: "Create savings goals, add contributions and watch your progress grow.",
      },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const { goals, settings, addGoal, updateGoal, deleteGoal, loading } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  return (
    <AppShell
      title="Savings goals"
      subtitle="Give every rupee, dollar or euro a purpose"
      action={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="gradient-surface rounded-xl text-primary-foreground"
        >
          <Plus className="mr-1.5 h-4 w-4" /> New goal
        </Button>
      }
    >
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-3 p-12 text-center">
          <span className="gradient-surface grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground">
            <Target className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold">No goals yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Whether it's an emergency fund or a trip, goals make saving feel intentional.
          </p>
          <Button
            onClick={() => setOpen(true)}
            className="gradient-surface mt-2 rounded-xl text-primary-foreground"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create your first goal
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => {
            const pct = goal.target > 0 ? Math.min(100, (goal.saved / goal.target) * 100) : 0;
            const done = pct >= 100;
            return (
              <li
                key={goal.id}
                className="glass-card p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">{goal.title}</h2>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3 shrink-0" />
                      {goal.deadline ? formatDate(goal.deadline) : "No deadline"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${goal.title}`}
                      onClick={() => {
                        setEditing(goal);
                        setOpen(true);
                      }}
                      className="h-8 w-8 rounded-lg"
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${goal.title}`}
                      onClick={async () => {
                        try {
                          await deleteGoal(goal.id);
                          toast.success("Goal deleted.");
                        } catch {
                          toast.error("Could not delete that goal.");
                        }
                      }}
                      className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="mt-4 font-display text-2xl font-bold tracking-tight">
                  {formatMoney(goal.saved, settings.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {formatMoney(goal.target, settings.currency)}
                </p>
                <Progress value={pct} className="mt-3 h-2" />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={done ? "font-semibold text-success" : "text-muted-foreground"}>
                    {done ? "Goal reached 🎉" : `${pct.toFixed(0)}% complete`}
                  </span>
                  <span className="text-muted-foreground">
                    {formatMoney(Math.max(goal.target - goal.saved, 0), settings.currency)} to go
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <GoalDialog
        open={open}
        onOpenChange={setOpen}
        goal={editing}
        onSubmit={async (values) => {
          if (editing) await updateGoal(editing.id, values);
          else await addGoal(values);
        }}
      />
    </AppShell>
  );
}

function GoalDialog({
  open,
  onOpenChange,
  goal,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  goal: Goal | null;
  onSubmit: (values: Omit<Goal, "id" | "createdAt">) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const target = Number(data.get("target"));
    const saved = Number(data.get("saved") ?? 0);
    const deadline = String(data.get("deadline") ?? "");

    if (!title) return toast.error("Give your goal a name.");
    if (!target || target <= 0) return toast.error("Target amount must be greater than zero.");
    if (saved < 0) return toast.error("Saved amount can't be negative.");

    setBusy(true);
    try {
      await onSubmit({ title, target, saved, deadline });
      toast.success(goal ? "Goal updated." : "Goal created.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save that goal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? "Update goal" : "New savings goal"}</DialogTitle>
          <DialogDescription>
            {goal ? "Add progress or adjust the target." : "Name it, price it, and set a deadline."}
          </DialogDescription>
        </DialogHeader>
        <form
          key={goal?.id ?? "new"}
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-busy={busy}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Goal name</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={60}
              placeholder="Emergency fund"
              className="h-11 rounded-xl"
              defaultValue={goal?.title ?? ""}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target">Target amount</Label>
              <Input
                id="target"
                name="target"
                type="number"
                min="0.01"
                step="0.01"
                required
                inputMode="decimal"
                className="h-11 rounded-xl"
                defaultValue={goal?.target ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="saved">Saved so far</Label>
              <Input
                id="saved"
                name="saved"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className="h-11 rounded-xl"
                defaultValue={goal?.saved ?? 0}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Target date</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              className="h-11 rounded-xl"
              defaultValue={goal?.deadline ?? todayISO()}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={busy}
              className="gradient-surface h-11 w-full rounded-xl text-primary-foreground"
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {goal ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
