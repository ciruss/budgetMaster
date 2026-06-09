import { useState } from "react";

import { currentYearMonth, formatMoney } from "../lib/utils";
import {
  useBudgetQuery,
  useSummaryQuery,
  useUpsertBudgetMutation,
} from "../api/queries";

import MonthPicker from "../components/MonthPicker";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [limitInput, setLimitInput] = useState("");
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useSummaryQuery(yearMonth);
  const {
    data: budget,
    isLoading: budgetLoading,
    error: budgetError,
  } = useBudgetQuery(yearMonth);
  const { mutateAsync: upsertBudget, isPending: upsertBudgetPending } =
    useUpsertBudgetMutation();
  const loading = summaryLoading || budgetLoading;
  const error = summaryError ?? budgetError;

  const saveLimit = async () => {
    if (!limitInput) return;
    try {
      await upsertBudget({
        yearMonth,
        limit: Number(limitInput),
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save budget");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <MonthPicker value={yearMonth} onChange={setYearMonth} />
      </div>

      {error && (
        <div className="text-red-600">
          {error instanceof Error ? error.message : "Failed to load"}
        </div>
      )}
      {loading && <div className="text-gray-500">Loading…</div>}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Income"
            value={formatMoney(summary.income)}
            tone="positive"
          />
          <StatCard
            label="Expenses"
            value={formatMoney(summary.expenses)}
            tone="negative"
          />
          <StatCard label="Invested" value={formatMoney(summary.invested)} />
          <StatCard label="Savings" value={formatMoney(summary.savings)} />
          <StatCard
            label="Savings rate"
            value={`${(Number(summary.savingsRate) * 100).toFixed(1)}%`}
          />
          <StatCard
            label="Budget remaining"
            value={formatMoney(summary.budgetRemaining)}
            tone={Number(summary.budgetRemaining) < 0 ? "negative" : "positive"}
          />
          <StatCard label="Net worth" value={formatMoney(summary.netWorth)} />
        </div>
      )}

      <div className="bg-white p-6 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Monthly spending limit</h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={limitInput || budget?.spendingLimit?.toString() || ""}
            onChange={(e) => setLimitInput(e.target.value)}
            placeholder="Spending limit"
            className="border p-2 rounded w-64"
          />
          <button
            onClick={saveLimit}
            disabled={upsertBudgetPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {budget ? "Update" : "Create"} budget
          </button>
          {budget && (
            <span className="text-sm text-gray-500">
              Current: {formatMoney(budget.spendingLimit)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
