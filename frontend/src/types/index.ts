export type Summary = {
  income: number;
  expenses: number;
  invested: number;
  savings: number;
  savingsRate: number;
  budgetRemaining: number;
  netWorth: number;
};

export type User = {
  id: number;
  email: string;
  defaultSpendingLimit: number | null;
  createdAt: string;
};

export type Budget = {
  id: number;
  yearMonth: string;
  spendingLimit: number;
  userId: number;
};

export type Category = {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  parentCategoryId: number | null;
  userId: number;
};

export type Transaction = {
  id: number;
  amount: number;
  type: "INCOME" | "EXPENSE" | "INVESTMENT" | "PASSIVE_INCOME";
  date: string;
  categoryId: number | null;
  assetId: number | null;
  userId: number;
};

export type Asset = {
  id: number;
  name: string;
  kind: "ASSET" | "LIABILITY";
  categoryId: number | null;
  userId: number;
};

export type Snapshot = {
  id: number;
  snapshotDate: string;
  balance: number;
  assetId: number;
};

export type NetWorthPoint = {
  yearMonth: string;
  netWorth: number;
};
