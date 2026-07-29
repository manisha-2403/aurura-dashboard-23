import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bot,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurora Ledger — AI Personal Finance Dashboard" },
      {
        name: "description",
        content:
          "Track income, expenses, budgets and savings goals with AI-powered insights in one elegant finance dashboard.",
      },
      { property: "og:title", content: "Aurora Ledger — AI Personal Finance Dashboard" },
      {
        property: "og:description",
        content:
          "Track income, expenses, budgets and savings goals with AI-powered insights in one elegant finance dashboard.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: BarChart3,
    title: "Beautiful analytics",
    body: "Interactive charts for cash flow, categories and trends — updated the moment you log a transaction.",
  },
  {
    icon: Bot,
    title: "AI insights",
    body: "Aurora reviews your spending, flags waste, predicts next month and answers questions in plain language.",
  },
  {
    icon: Wallet,
    title: "Smart budgets",
    body: "Set category limits, watch live progress bars and get nudged before you overspend.",
  },
  {
    icon: Target,
    title: "Savings goals",
    body: "Fund goals with deadlines and milestone tracking so long-term plans stay on schedule.",
  },
  {
    icon: PiggyBank,
    title: "Financial health score",
    body: "One number that summarises savings rate, spending balance and momentum over time.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Your data lives in your own secure account — exportable to CSV or PDF whenever you want.",
  },
];

function Landing() {
  return (
    <div className="aurora-bg min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 backdrop-blur-xl">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
        >
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="gradient-surface grid h-8 w-8 place-items-center rounded-xl text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-base">Aurora Ledger</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="gradient-surface inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
          <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered personal finance
          </span>
          <h1 className="mt-6 text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
            Money clarity, <span className="gradient-text">beautifully</span> done
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Aurora Ledger brings your income, expenses, budgets and goals into one calm dashboard —
            with an AI coach that turns raw numbers into decisions you can act on today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="gradient-surface glow-shadow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
            >
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="glass-panel inline-flex items-center rounded-full px-6 py-3 text-sm font-medium transition-colors hover:bg-accent/60"
            >
              I already have an account
            </Link>
          </div>

          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              ["Real-time", "Live sync across devices"],
              ["AI coach", "Answers about your money"],
              ["CSV & PDF", "Export anytime"],
            ].map(([k, v]) => (
              <div key={k} className="glass-card rounded-2xl p-5 text-left">
                <dt className="gradient-text text-lg font-semibold">{k}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6" aria-labelledby="features">
          <h2 id="features" className="text-center text-2xl font-semibold sm:text-3xl">
            Everything you need to stay ahead
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article key={title} className="glass-card rounded-2xl p-6 transition-transform hover:-translate-y-1">
                <span className="gradient-surface grid h-10 w-10 place-items-center rounded-xl text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
          <div className="glass-panel rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Start your financial glow-up</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Free to set up. Add your first transaction in under a minute and let Aurora do the
              analysis.
            </p>
            <Link
              to="/signup"
              className="gradient-surface mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aurora Ledger. Built for people who like their money organised.
      </footer>
    </div>
  );
}
