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

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const TITLE = "Aurora — AI Personal Finance Dashboard";
const DESCRIPTION =
  "Track spending, plan budgets and hit savings goals with beautiful analytics and an AI finance coach that knows your numbers.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Wallet,
    title: "Every transaction, organised",
    body: "Add, edit and categorise income and expenses in seconds, with search, filters and CSV/PDF export.",
  },
  {
    icon: BarChart3,
    title: "Analytics that actually explain",
    body: "Trends, category breakdowns and month-over-month comparisons rendered in soft, readable charts.",
  },
  {
    icon: Bot,
    title: "Aurora, your AI coach",
    body: "Ask anything about your money and get grounded answers based on your own spending snapshot.",
  },
  {
    icon: Target,
    title: "Goals with momentum",
    body: "Set savings targets, watch progress bars fill and get nudged when you're falling behind.",
  },
  {
    icon: PiggyBank,
    title: "Budgets per category",
    body: "Monthly limits with live usage rings so overspending never sneaks up on you.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Your data lives in your own secure account — nobody else can read your finances.",
  },
];

function Landing() {
  return (
    <div className="aurora-bg min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 backdrop-blur-xl">
        <nav
          aria-label="Main"
          className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4"
        >
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="gradient-surface grid h-8 w-8 place-items-center rounded-xl text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            Aurora
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="gradient-surface rounded-xl text-primary-foreground">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-14 sm:pt-24">
          <div className="glass-panel rounded-3xl px-6 py-12 sm:px-12 sm:py-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-accent/40 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered money insights
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              The calm, intelligent home for your{" "}
              <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                personal finances
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {DESCRIPTION}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="gradient-surface rounded-xl text-primary-foreground"
              >
                <Link to="/signup">
                  Create free account <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-24">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything you need to stay ahead
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article key={title} className="glass-card rounded-2xl p-6 transition-transform hover:-translate-y-1">
                <span className="gradient-surface mb-4 grid h-10 w-10 place-items-center rounded-xl text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto w-full max-w-6xl px-5 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Aurora Finance. Built for people who like knowing where their
          money goes.
        </div>
      </footer>
    </div>
  );
}
