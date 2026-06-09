import { useState } from "react";

import { currentYearMonth, formatMoney, todayIso } from "../lib/utils";
import type { Category, Transaction } from "../types";
import {
  useAssetsQuery,
  useCategoriesQuery,
  useCreateCategoryMutation,
  useCreateTransactionMutation,
  useDeleteCategoryMutation,
  useDeleteTransactionMutation,
  useTransactionsQuery,
  useUpdateTransactionMutation,
} from "../api/queries";

import MonthPicker from "../components/MonthPicker";

export default function Transactions() {
  const [ym, setYm] = useState(currentYearMonth());
  const [editingId, setEditingId] = useState<number | null>(null);
  const transactionsQuery = useTransactionsQuery(ym);
  const categoriesQuery = useCategoriesQuery();
  const assetsQuery = useAssetsQuery();
  const createTransactionMutation = useCreateTransactionMutation();
  const updateTransactionMutation = useUpdateTransactionMutation();
  const deleteTransactionMutation = useDeleteTransactionMutation();
  const createCategoryMutation = useCreateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const transactions = transactionsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const assets = assetsQuery.data ?? [];
  const loading =
    transactionsQuery.isLoading ||
    categoriesQuery.isLoading ||
    assetsQuery.isLoading;
  const error =
    transactionsQuery.error ?? categoriesQuery.error ?? assetsQuery.error;

  const emptyForm = {
    amount: "",
    type: "EXPENSE" as Transaction["type"],
    date: todayIso(),
    categoryId: "" as string,
    assetId: "" as string,
  };
  const [form, setForm] = useState(emptyForm);

  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({
    name: "",
    type: "EXPENSE" as Category["type"],
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.date) return;
    const payload = {
      amount: Number(form.amount),
      type: form.type,
      date: form.date,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      assetId: form.assetId ? Number(form.assetId) : null,
    };
    try {
      if (editingId) {
        await updateTransactionMutation.mutateAsync({
          id: editingId,
          yearMonth: ym,
          payload,
        });
      } else {
        await createTransactionMutation.mutateAsync({ yearMonth: ym, payload });
      }
      resetForm();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to save transaction"
      );
    }
  };

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setForm({
      amount: String(t.amount),
      type: t.type,
      date: t.date,
      categoryId: t.categoryId ? String(t.categoryId) : "",
      assetId: t.assetId ? String(t.assetId) : "",
    });
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await deleteTransactionMutation.mutateAsync({ id, yearMonth: ym });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name) return;
    try {
      await createCategoryMutation.mutateAsync({
        name: catForm.name,
        type: catForm.type,
        parentCategoryId: null,
      });
      setCatForm({ name: "", type: "EXPENSE" });
      setShowCatForm(false);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to create category"
      );
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategoryMutation.mutateAsync({ id });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  const categoryName = (id: number | null) =>
    categories.find((c) => c.id === id)?.name ?? "—";
  const assetName = (id: number | null) =>
    assets.find((a) => a.id === id)?.name ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <MonthPicker value={ym} onChange={setYm} />
      </div>

      {error && (
        <div className="text-red-600">
          {error instanceof Error ? error.message : "Failed to load"}
        </div>
      )}

      <form
        onSubmit={submit}
        className="bg-white p-4 rounded shadow-sm grid grid-cols-2 md:grid-cols-6 gap-3 items-end"
      >
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Amount</label>
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="border p-2 rounded"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Type</label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as Transaction["type"] })
            }
            className="border p-2 rounded"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
            <option value="INVESTMENT">Investment</option>
            <option value="PASSIVE_INCOME">Passive Income</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border p-2 rounded"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Asset</label>
          <select
            value={form.assetId}
            onChange={(e) => setForm({ ...form, assetId: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="">—</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={
              createTransactionMutation.isPending ||
              updateTransactionMutation.isPending
            }
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Transactions</h3>
          <span className="text-sm text-gray-500">
            {loading ? "Loading…" : `${transactions.length} total`}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Type</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Asset</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.date}</td>
                <td className="p-3">{t.type}</td>
                <td
                  className={`p-3 text-right font-mono ${
                    t.type === "EXPENSE" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatMoney(t.amount)}
                </td>
                <td className="p-3">{categoryName(t.categoryId)}</td>
                <td className="p-3">{assetName(t.assetId)}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => startEdit(t)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No transactions this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Categories</h3>
          <button
            onClick={() => setShowCatForm(!showCatForm)}
            className="text-blue-600 hover:underline text-sm"
          >
            {showCatForm ? "Cancel" : "+ New category"}
          </button>
        </div>
        {showCatForm && (
          <form onSubmit={createCategory} className="flex gap-2 mb-3">
            <input
              placeholder="Name"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              className="border p-2 rounded flex-1"
            />
            <select
              value={catForm.type}
              onChange={(e) =>
                setCatForm({
                  ...catForm,
                  type: e.target.value as Category["type"],
                })
              }
              className="border p-2 rounded"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            <button className="bg-blue-600 text-white px-3 py-2 rounded">
              Create
            </button>
          </form>
        )}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {c.name}
              <span className="text-xs text-gray-500">({c.type})</span>
              <button
                onClick={() => deleteCategory(c.id)}
                className="text-red-600 hover:text-red-800"
                title="Delete"
              >
                ×
              </button>
            </span>
          ))}
          {categories.length === 0 && (
            <span className="text-gray-500 text-sm">No categories yet.</span>
          )}
        </div>
      </div>
    </div>
  );
}
