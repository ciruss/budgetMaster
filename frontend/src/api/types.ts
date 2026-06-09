import type { Asset, Category, Transaction } from "../types";

export type Credentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
};

export type TransactionPayload = {
  amount: number;
  type: Transaction["type"];
  date: string;
  categoryId: number | null;
  assetId: number | null;
};

export type CategoryPayload = {
  name: string;
  type: Category["type"];
  parentCategoryId: number | null;
};

export type AssetPayload = {
  name: string;
  kind: Asset["kind"];
  categoryId: number | null;
};

export type AssetSnapshotPayload = {
  snapshotDate: string;
  balance: number;
};
