export type TransactionView = {
  id: number;
  title: string;
  detail: string;
  amount: number;
  type: "credit" | "debit";
  occurredAt: string;
};

const preciseDateTime = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function formatTransactionDate(occurredAt: string) {
  const date = new Date(occurredAt);
  return Number.isNaN(date.getTime()) ? "Data indisponível" : preciseDateTime.format(date);
}

export function transactionDescription(transaction: TransactionView) {
  const cleanDetail = transaction.detail
    .replace(/\s*·\s*(?:agora|hoje(?:,\s*\d{1,2}:\d{2})?|ontem(?:,\s*\d{1,2}:\d{2})?)\s*$/i, "")
    .trim();
  const timestamp = formatTransactionDate(transaction.occurredAt);
  return cleanDetail ? `${cleanDetail} · ${timestamp}` : timestamp;
}

export function sortTransactionsNewestFirst<T extends TransactionView>(transactions: T[]) {
  return [...transactions].sort((left, right) => {
    const timeDifference = new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime();
    return timeDifference || right.id - left.id;
  });
}
