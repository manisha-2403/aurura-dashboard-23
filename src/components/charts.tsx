import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoney } from "@/lib/format";

type Series = { month: string; income: number; expenses: number; savings: number }[];

const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

function tooltipStyle() {
  return {
    contentStyle: {
      background: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: "0.9rem",
      color: "var(--popover-foreground)",
      fontSize: "12px",
      boxShadow: "var(--shadow-soft)",
    },
    labelStyle: { color: "var(--muted-foreground)", marginBottom: 4 },
  };
}

export function MonthlyLineChart({
  data,
  dataKey,
  color,
  currency,
}: {
  data: Series;
  dataKey: "income" | "expenses";
  color: string;
  currency: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => formatMoney(Number(v), currency, true)} />
        <Tooltip
          {...tooltipStyle()}
          formatter={(v: number) => formatMoney(Number(v), currency)}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SavingsTrendChart({ data, currency }: { data: Series; currency: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => formatMoney(Number(v), currency, true)} />
        <Tooltip
          {...tooltipStyle()}
          formatter={(v: number) => formatMoney(Number(v), currency)}
        />
        <Area
          type="monotone"
          dataKey="savings"
          stroke="var(--chart-1)"
          strokeWidth={3}
          fill="url(#savingsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function IncomeVsExpenseChart({ data, currency }: { data: Series; currency: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => formatMoney(Number(v), currency, true)} />
        <Tooltip
          {...tooltipStyle()}
          cursor={{ fill: "var(--accent)", opacity: 0.35 }}
          formatter={(v: number) => formatMoney(Number(v), currency)}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" name="Income" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({
  data,
  currency,
}: {
  data: { name: string; value: number; color: string }[];
  currency: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={62}
          outerRadius={100}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          {...tooltipStyle()}
          formatter={(v: number, n: string) => [formatMoney(Number(v), currency), n]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="grid h-64 place-items-center rounded-xl border border-dashed border-border/70 text-center">
      <p className="max-w-xs px-6 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
