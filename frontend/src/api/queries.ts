import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { api } from "../api/api";
import { queryKeys } from "./queryKeys";
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
  CategoryPayload,
  Credentials,
  TransactionPayload,
} from "./types";

const invalidateSummaryQueries = (
  queryClient: QueryClient,
  yearMonth?: string
) =>
  yearMonth
    ? queryClient.invalidateQueries({
        queryKey: queryKeys.summary.byMonth(yearMonth),
      })
    : queryClient.invalidateQueries({ queryKey: queryKeys.summary.all });

const invalidateBudgetQueries = (
  queryClient: QueryClient,
  yearMonth?: string
) =>
  yearMonth
    ? queryClient.invalidateQueries({
        queryKey: queryKeys.budget.byMonth(yearMonth),
      })
    : queryClient.invalidateQueries({ queryKey: queryKeys.budget.all });

const invalidateTransactionsQueries = (
  queryClient: QueryClient,
  yearMonth?: string
) =>
  yearMonth
    ? queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.byMonth(yearMonth),
      })
    : queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });

const invalidateAssetQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.assets.all() });

const invalidateHistoryQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: queryKeys.history.all });

export function useMeQuery(enabled = true) {
  return useQuery<User | null>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => api.me(),
    enabled,
    retry: false,
  });
}

export function useSummaryQuery(yearMonth: string) {
  return useQuery<Summary>({
    queryKey: queryKeys.summary.byMonth(yearMonth),
    queryFn: () => api.getSummary(yearMonth),
  });
}

export function useBudgetQuery(yearMonth: string) {
  return useQuery<Budget | null>({
    queryKey: queryKeys.budget.byMonth(yearMonth),
    queryFn: async () => {
      try {
        return await api.getBudget(yearMonth);
      } catch {
        return null;
      }
    },
  });
}

export function useTransactionsQuery(yearMonth: string) {
  return useQuery<Transaction[]>({
    queryKey: queryKeys.transactions.byMonth(yearMonth),
    queryFn: () => api.getTransactions(yearMonth),
  });
}

export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: queryKeys.categories.all(),
    queryFn: () => api.getCategories(),
  });
}

export function useAssetsQuery() {
  return useQuery<Asset[]>({
    queryKey: queryKeys.assets.all(),
    queryFn: () => api.getAssets(),
  });
}

export function useAssetSnapshotsQuery(id: number | null) {
  return useQuery<Snapshot[]>({
    queryKey: queryKeys.assets.snapshots(id ?? 0),
    queryFn: () => api.getAssetSnapshots(id!),
    enabled: id != null,
  });
}

export function useNetWorthQuery(from: string, to: string) {
  return useQuery<NetWorthPoint[]>({
    queryKey: queryKeys.history.netWorth(from, to),
    queryFn: () => api.getNetWorth(from, to),
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: Credentials) => api.login(credentials),
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: (credentials: Credentials) => api.signup(credentials),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => api.logout(),
  });
}

export function useUpsertBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ yearMonth, limit }: { yearMonth: string; limit: number }) =>
      api.upsertBudget(yearMonth, limit),
    onSuccess: async (_, { yearMonth }) => {
      await Promise.all([
        invalidateBudgetQueries(queryClient, yearMonth),
        invalidateSummaryQueries(queryClient, yearMonth),
      ]);
    },
  });
}

export function useCreateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
    }: {
      yearMonth: string;
      payload: TransactionPayload;
    }) => api.createTransaction(payload),
    onSuccess: async (_, { yearMonth }) => {
      await Promise.all([
        invalidateTransactionsQueries(queryClient, yearMonth),
        invalidateSummaryQueries(queryClient, yearMonth),
        invalidateBudgetQueries(queryClient, yearMonth),
        invalidateHistoryQueries(queryClient),
      ]);
    },
  });
}

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      yearMonth: string;
      payload: TransactionPayload;
    }) => api.updateTransaction(id, payload),
    onSuccess: async (_, { yearMonth }) => {
      await Promise.all([
        invalidateTransactionsQueries(queryClient, yearMonth),
        invalidateSummaryQueries(queryClient, yearMonth),
        invalidateBudgetQueries(queryClient, yearMonth),
        invalidateHistoryQueries(queryClient),
      ]);
    },
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; yearMonth: string }) =>
      api.deleteTransaction(id),
    onSuccess: async (_, { yearMonth }) => {
      await Promise.all([
        invalidateTransactionsQueries(queryClient, yearMonth),
        invalidateSummaryQueries(queryClient, yearMonth),
        invalidateBudgetQueries(queryClient, yearMonth),
        invalidateHistoryQueries(queryClient),
      ]);
    },
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryPayload) => api.createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(),
      });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) => api.deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(),
      });
    },
  });
}

export function useCreateAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssetPayload) => api.createAsset(payload),
    onSuccess: async () => {
      await Promise.all([
        invalidateAssetQueries(queryClient),
        invalidateSummaryQueries(queryClient),
        invalidateHistoryQueries(queryClient),
      ]);
    },
  });
}

export function useDeleteAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) => api.deleteAsset(id),
    onSuccess: async (_, { id }) => {
      await Promise.all([
        invalidateAssetQueries(queryClient),
        queryClient.removeQueries({ queryKey: queryKeys.assets.snapshots(id) }),
        invalidateSummaryQueries(queryClient),
        invalidateHistoryQueries(queryClient),
      ]);
    },
  });
}

export function useCreateAssetSnapshotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AssetSnapshotPayload;
    }) => api.createAssetSnapshot(id, payload),
    onSuccess: async (_, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.assets.snapshots(id),
        }),
        invalidateAssetQueries(queryClient),
        invalidateSummaryQueries(queryClient),
        invalidateHistoryQueries(queryClient),
      ]);
    },
  });
}
