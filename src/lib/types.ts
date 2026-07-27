import {
  Utensils,
  ShoppingBag,
  Bus,
  ReceiptText,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Wallet,
  Laptop,
  TrendingUp,
  CircleDashed,
  type LucideIcon,
} from "lucide-react";

export type TransactionType = "income" | "expense";

export type CategoryId =
  | "food"
  | "shopping"
  | "transport"
  | "bills"
  | "entertainment"
  | "health"
  | "education"
  | "salary"
  | "freelance"
  | "investments"
  | "others";

export type CategoryMeta = {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  /** css color token used for charts and chips */
  color: string;
  kind: TransactionType | "both";
};

export const CATEGORIES: CategoryMeta[] = [
  { id: "food", label: "Food", icon: Utensils, color: "var(--chart-1)", kind: "expense" },
  {
    id: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    color: "var(--chart-2)",
    kind: "expense",
  },
  { id: "transport", label: "Transport", icon: Bus, color: "var(--chart-3)", kind: "expense" },
  { id: "bills", label: "Bills", icon: ReceiptText, color: "var(--chart-4)", kind: "expense" },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Clapperboard,
    color: "var(--chart-5)",
    kind: "expense",
  },
  { id: "health", label: "Health", icon: HeartPulse, color: "var(--chart-6)", kind: "expense" },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    color: "var(--chart-7)",
    kind: "expense",
  },
  { id: "salary", label: "Salary", icon: Wallet, color: "var(--chart-4)", kind: "income" },
  { id: "freelance", label: "Freelance", icon: Laptop, color: "var(--chart-3)", kind: "income" },
  {
    id: "investments",
    label: "Investments",
    icon: TrendingUp,
    color: "var(--chart-8)",
    kind: "income",
  },
  { id: "others", label: "Others", icon: CircleDashed, color: "var(--chart-2)", kind: "both" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  CategoryMeta
>;

export function categoriesFor(type: TransactionType) {
  return CATEGORIES.filter((c) => c.kind === type || c.kind === "both");
}

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryId;
  /** ISO date, yyyy-MM-dd */
  date: string;
  note: string;
  createdAt: number;
};

export type Goal = {
  id: string;
  title: string;
  target: number;
  saved: number;
  /** ISO date, yyyy-MM-dd */
  deadline: string;
  createdAt: number;
};

export type UserSettings = {
  currency: string;
  monthlyBudget: number;
  categoryBudgets: Partial<Record<CategoryId, number>>;
  displayName: string;
  photoURL: string;
  bio: string;
  phone: string;
  monthlyReminder: boolean;
};

export const DEFAULT_SETTINGS: UserSettings = {
  currency: "USD",
  monthlyBudget: 0,
  categoryBudgets: {},
  displayName: "",
  photoURL: "",
  bio: "",
  phone: "",
  monthlyReminder: true,
};

export const CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ" },
  { code: "NGN", label: "Nigerian Naira", symbol: "₦" },
  { code: "BRL", label: "Brazilian Real", symbol: "R$" },
];
