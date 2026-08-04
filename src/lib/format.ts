import { CURRENCIES } from "./types";

export function currencySymbol(code: string) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

export function formatMoney(value: number, currency = "USD", compact = false) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: compact ? 1 : value % 1 === 0 ? 0 : 2,
      notation: compact ? "compact" : "standard",
    }).format(value);
  } catch {
    return `${currencySymbol(currency)}${value.toFixed(2)}`;
  }
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}

export function formatDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}
