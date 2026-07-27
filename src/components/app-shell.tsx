import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  ChartNoAxesCombined,
  User,
  Settings,
  Bell,
  LogOut,
  Menu,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { useFinance } from "@/lib/finance";
import { useNotifications } from "@/lib/notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budget", label: "Budget", icon: PiggyBank },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent/60 hover:text-foreground data-[status=active]:gradient-surface data-[status=active]:text-primary-foreground data-[status=active]:shadow-[var(--shadow-glow)]"
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5">
      <span className="gradient-surface grid h-9 w-9 shrink-0 place-items-center rounded-xl text-primary-foreground">
        <Sparkles className="h-4.5 w-4.5" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">Aurora Ledger</span>
    </Link>
  );
}

function NotificationBell() {
  const notifications = useNotifications();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative rounded-full border border-border/60 bg-glass backdrop-blur-md"
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-2xl p-2">
        <p className="px-2 py-1.5 text-sm font-semibold">Notifications</p>
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            You're all caught up.
          </p>
        ) : (
          <ul className="space-y-1">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-accent/60"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                    n.tone === "danger"
                      ? "bg-destructive/15 text-destructive"
                      : n.tone === "success"
                        ? "bg-success/15 text-success"
                        : "bg-primary/15 text-primary"
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const { settings } = useFinance();
  const navigate = useNavigate();
  const name = settings.displayName || user?.displayName || user?.email?.split("@")[0] || "You";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full ring-offset-background transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <Avatar className="h-9 w-9 border border-border/60">
            <AvatarImage src={settings.photoURL || user?.photoURL || undefined} alt={name} />
            <AvatarFallback className="gradient-surface text-xs font-semibold text-primary-foreground">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl">
        <DropdownMenuLabel className="truncate">
          <span className="block text-sm font-semibold">{name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user?.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await logout();
            navigate({ to: "/login", replace: true });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="aurora-bg min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-border/50 bg-glass p-5 backdrop-blur-xl lg:flex">
          <Brand />
          <NavLinks />
          <div className="mt-auto rounded-2xl border border-border/50 bg-accent/30 p-4">
            <p className="text-sm font-semibold">Stay on track</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Log every transaction to keep your health score accurate.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-24 lg:pb-0">
          <header className="sticky top-0 z-30 border-b border-border/50 bg-glass px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full lg:hidden"
                      aria-label="Open navigation"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 p-5">
                    <div className="mb-6">
                      <Brand />
                    </div>
                    <NavLinks onNavigate={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
                  {subtitle && (
                    <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {action}
                <NotificationBell />
                <ThemeToggle />
                <UserMenu />
              </div>
            </div>
          </header>

          <main className="animate-rise px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-glass px-2 py-2 backdrop-blur-xl lg:hidden">
        <ul className="grid grid-cols-5">
          {NAV_ITEMS.slice(0, 5).map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-lg ${active ? "gradient-surface text-primary-foreground" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
