import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ShieldCheck, TrendingUp, PieChart } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="aurora-bg grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="gradient-surface grid h-9 w-9 place-items-center rounded-xl text-primary-foreground">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-lg font-bold">Aurora Ledger</span>
        </Link>

        <div className="max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Every rupee, dollar and euro <span className="gradient-text">accounted for.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            A calm, colourful home for your money — budgets, goals, and clear charts that make
            spending decisions obvious.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              { icon: TrendingUp, text: "Live balance, income and expense tracking" },
              { icon: PieChart, text: "Five interactive charts on every trend" },
              { icon: ShieldCheck, text: "Private by default — your data, your account" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Aurora Ledger. Built for people who like knowing.
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="gradient-surface grid h-8 w-8 place-items-center rounded-lg text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-display font-bold">Aurora Ledger</span>
            </Link>
            <ThemeToggle />
          </div>

          <div className="glass-panel rounded-3xl p-7 sm:p-9">
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>

            <div className="mt-6">{children}</div>
          </div>

          {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
