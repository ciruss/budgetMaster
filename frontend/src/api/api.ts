import type {
  Asset,
  Budget,
  Category,
  NetWorthPoint,
  Snapshot,
  Summary,
  Transaction,
  User,
} from "../types";
import type {
  AssetPayload,
  AssetSnapshotPayload,
  AuthResponse,
  CategoryPayload,
  Credentials,
  TransactionPayload,
} from "./types";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(
  /\/$/,
  ""
);

export const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = sessionStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      throw new Error("Unauthorized");
    }
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return null as T;
  }

  return response.json() as Promise<T>;
};

export const api = {
  me: () => fetchApi<User>("/me"),
  login: async (data: Credentials) => {
    const res = await fetchApi<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res && res.token) {
      sessionStorage.setItem("token", res.token);
    }
    return res;
  },
  signup: (data: Credentials) =>
    fetchApi("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  logout: async () => {
    const token = sessionStorage.getItem("token");

    try {
      if (token) {
        await fetchApi("/auth/logout", { method: "POST" });
      }
    } finally {
      sessionStorage.removeItem("token");
    }
  },

  getSummary: (ym: string) => fetchApi<Summary>(`/summary/${ym}`),
  getNetWorth: (from: string, to: string) =>
    fetchApi<NetWorthPoint[]>(`/networth?from=${from}&to=${to}`),

  getTransactions: (month: string) =>
    fetchApi<Transaction[]>(`/transactions?month=${month}`),
  createTransaction: (data: TransactionPayload) =>
    fetchApi<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTransaction: (id: number, data: TransactionPayload) =>
    fetchApi<Transaction>(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTransaction: (id: number) =>
    fetchApi(`/transactions/${id}`, { method: "DELETE" }),

  getCategories: () => fetchApi<Category[]>("/categories"),
  createCategory: (data: CategoryPayload) =>
    fetchApi<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: number) =>
    fetchApi(`/categories/${id}`, { method: "DELETE" }),

  getAssets: () => fetchApi<Asset[]>("/assets"),
  createAsset: (data: AssetPayload) =>
    fetchApi<Asset>("/assets", { method: "POST", body: JSON.stringify(data) }),
  deleteAsset: (id: number) => fetchApi(`/assets/${id}`, { method: "DELETE" }),
  getAssetSnapshots: (id: number) =>
    fetchApi<Snapshot[]>(`/assets/${id}/snapshots`),
  createAssetSnapshot: (id: number, data: AssetSnapshotPayload) =>
    fetchApi<Snapshot>(`/assets/${id}/snapshots`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getBudget: (ym: string) => fetchApi<Budget>(`/budgets/${ym}`),
  upsertBudget: (ym: string, limit: number) =>
    fetchApi<Budget>(`/budgets/${ym}`, {
      method: "PUT",
      body: JSON.stringify({ spendingLimit: limit }),
    }),
};
