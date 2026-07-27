import { CATEGORY_MAP, type Transaction } from "./types";
import { formatDate, formatMoney } from "./format";
import { totals } from "./analytics";

export function exportTransactionsCSV(transactions: Transaction[], filename = "transactions.csv") {
  const header = ["Date", "Type", "Category", "Note", "Amount"];
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    CATEGORY_MAP[t.category]?.label ?? t.category,
    (t.note ?? "").replace(/"/g, '""'),
    String(t.amount),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\r\n");

  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
}

export async function exportTransactionsPDF(
  transactions: Transaction[],
  currency: string,
  ownerName: string,
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  const t = totals(transactions);

  doc.setFontSize(18);
  doc.text("Aurora Ledger — Financial Report", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`${ownerName || "Account holder"} · generated ${formatDate(new Date().toISOString().slice(0, 10))}`, 14, 27);
  doc.setTextColor(20);
  doc.setFontSize(11);
  doc.text(
    [
      `Total income: ${formatMoney(t.income, currency)}`,
      `Total expenses: ${formatMoney(t.expenses, currency)}`,
      `Net savings: ${formatMoney(t.balance, currency)}`,
    ],
    14,
    38,
  );

  autoTable(doc, {
    startY: 58,
    head: [["Date", "Type", "Category", "Note", "Amount"]],
    body: transactions.map((tx) => [
      formatDate(tx.date),
      tx.type === "income" ? "Income" : "Expense",
      CATEGORY_MAP[tx.category]?.label ?? tx.category,
      tx.note ?? "",
      formatMoney(tx.amount, currency),
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [124, 77, 226], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 242, 253] },
  });

  doc.save("financial-report.pdf");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
