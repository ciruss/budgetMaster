export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  summary: {
    all: ["summary"] as const,
    byMonth: (yearMonth: string) =>
      [...queryKeys.summary.all, yearMonth] as const,
  },
  budget: {
    all: ["budget"] as const,
    byMonth: (yearMonth: string) =>
      [...queryKeys.budget.all, yearMonth] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    byMonth: (yearMonth: string) =>
      [...queryKeys.transactions.all, yearMonth] as const,
  },
  categories: {
    all: () => ["categories"] as const,
  },
  assets: {
    all: () => ["assets"] as const,
    snapshots: (id: number) => ["assets", "snapshots", id] as const,
  },
  history: {
    all: ["history"] as const,
    netWorth: (from: string, to: string) =>
      [...queryKeys.history.all, "netWorth", from, to] as const,
  },
};
