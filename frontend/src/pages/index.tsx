import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { api } from '../lib/api';
import {
  currentYearMonth,
  shiftYearMonth,
  formatMoney,
  todayIso,
} from '../lib/utils';

type Summary = {
  income: number;
  expenses: number;
  invested: number;
  savings: number;
  savingsRate: number;
  budgetRemaining: number;
  netWorth: number;
};

type Budget = {
  id: number;
  yearMonth: string;
  spendingLimit: number;
  userId: number;
};

type Category = {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  parentCategoryId: number | null;
  userId: number;
};

type Transaction = {
  id: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'PASSIVE_INCOME';
  date: string;
  categoryId: number | null;
  assetId: number | null;
  userId: number;
};

type Asset = {
  id: number;
  name: string;
  kind: 'ASSET' | 'LIABILITY';
  categoryId: number | null;
  userId: number;
};

type Snapshot = {
  id: number;
  snapshotDate: string;
  balance: number;
  assetId: number;
};

type NetWorthPoint = {
  yearMonth: string;
  netWorth: number;
};

function MonthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (ym: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(shiftYearMonth(value, -1))}
        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        ←
      </button>
      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border px-2 py-1 rounded"
      />
      <button
        onClick={() => onChange(shiftYearMonth(value, 1))}
        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        →
      </button>
    </div>
  );
}

/* -------- Dashboard -------- */

export function Dashboard() {
  const [ym, setYm] = useState(currentYearMonth());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, b] = await Promise.all([
        api.getSummary(ym),
        api.getBudget(ym).catch(() => null),
      ]);
      setSummary(s);
      setBudget(b);
      setLimitInput(b?.spendingLimit?.toString() ?? '');
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [ym]);

  const saveLimit = async () => {
    if (!limitInput) return;
    try {
      const b = await api.upsertBudget(ym, Number(limitInput));
      setBudget(b);
      await load();
    } catch (e: any) {
      alert(e.message ?? 'Failed to save budget');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <MonthPicker value={ym} onChange={setYm} />
      </div>

      {error && <div className="text-red-600">{error}</div>}
      {loading && <div className="text-gray-500">Loading…</div>}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Income" value={formatMoney(summary.income)} tone="positive" />
          <StatCard label="Expenses" value={formatMoney(summary.expenses)} tone="negative" />
          <StatCard label="Invested" value={formatMoney(summary.invested)} />
          <StatCard label="Savings" value={formatMoney(summary.savings)} />
          <StatCard
            label="Savings rate"
            value={`${(Number(summary.savingsRate) * 100).toFixed(1)}%`}
          />
          <StatCard
            label="Budget remaining"
            value={formatMoney(summary.budgetRemaining)}
            tone={Number(summary.budgetRemaining) < 0 ? 'negative' : 'positive'}
          />
          <StatCard label="Net worth" value={formatMoney(summary.netWorth)} />
        </div>
      )}

      <div className="bg-white p-6 rounded shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Monthly spending limit</h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            placeholder="Spending limit"
            className="border p-2 rounded w-64"
          />
          <button
            onClick={saveLimit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {budget ? 'Update' : 'Create'} budget
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

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'positive' | 'negative';
}) {
  const color =
    tone === 'positive'
      ? 'text-green-600'
      : tone === 'negative'
      ? 'text-red-600'
      : 'text-gray-900';
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

/* -------- Transactions -------- */

export function Transactions() {
  const [ym, setYm] = useState(currentYearMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const emptyForm = {
    amount: '',
    type: 'EXPENSE' as Transaction['type'],
    date: todayIso(),
    categoryId: '' as string,
    assetId: '' as string,
  };
  const [form, setForm] = useState(emptyForm);

  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({
    name: '',
    type: 'EXPENSE' as Category['type'],
  });

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tx, cats, ass] = await Promise.all([
        api.getTransactions(ym),
        api.getCategories(),
        api.getAssets(),
      ]);
      setTransactions(tx);
      setCategories(cats);
      setAssets(ass);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [ym]);

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
        await api.updateTransaction(editingId, payload);
      } else {
        await api.createTransaction(payload);
      }
      resetForm();
      await loadAll();
    } catch (e: any) {
      alert(e.message ?? 'Failed to save transaction');
    }
  };

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setForm({
      amount: String(t.amount),
      type: t.type,
      date: t.date,
      categoryId: t.categoryId ? String(t.categoryId) : '',
      assetId: t.assetId ? String(t.assetId) : '',
    });
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await api.deleteTransaction(id);
      await loadAll();
    } catch (e: any) {
      alert(e.message ?? 'Failed to delete');
    }
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name) return;
    try {
      await api.createCategory({
        name: catForm.name,
        type: catForm.type,
        parentCategoryId: null,
      });
      setCatForm({ name: '', type: 'EXPENSE' });
      setShowCatForm(false);
      await loadAll();
    } catch (e: any) {
      alert(e.message ?? 'Failed to create category');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.deleteCategory(id);
      await loadAll();
    } catch (e: any) {
      alert(e.message ?? 'Failed to delete');
    }
  };

  const categoryName = (id: number | null) =>
    categories.find((c) => c.id === id)?.name ?? '—';
  const assetName = (id: number | null) =>
    assets.find((a) => a.id === id)?.name ?? '—';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <MonthPicker value={ym} onChange={setYm} />
      </div>

      {error && <div className="text-red-600">{error}</div>}

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
              setForm({ ...form, type: e.target.value as Transaction['type'] })
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? 'Update' : 'Add'}
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
            {loading ? 'Loading…' : `${transactions.length} total`}
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
                    t.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'
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
            {showCatForm ? 'Cancel' : '+ New category'}
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
                  type: e.target.value as Category['type'],
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

/* -------- Assets -------- */

export function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [latestByAsset, setLatestByAsset] = useState<Record<number, Snapshot | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const [form, setForm] = useState({
    name: '',
    kind: 'ASSET' as Asset['kind'],
  });
  const [snapForm, setSnapForm] = useState({
    snapshotDate: todayIso(),
    balance: '',
  });

  const pickLatest = (list: Snapshot[]): Snapshot | null => {
    if (!list.length) return null;
    return [...list].sort((a, b) =>
      a.snapshotDate < b.snapshotDate ? 1 : -1,
    )[0];
  };

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const a: Asset[] = await api.getAssets();
      setAssets(a);
      const entries = await Promise.all(
        a.map(async (asset) => {
          try {
            const snaps: Snapshot[] = await api.getAssetSnapshots(asset.id);
            return [asset.id, pickLatest(snaps)] as const;
          } catch {
            return [asset.id, null] as const;
          }
        }),
      );
      const map: Record<number, Snapshot | null> = {};
      for (const [id, snap] of entries) map[id] = snap;
      setLatestByAsset(map);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const loadSnapshots = async (id: number) => {
    try {
      const s = await api.getAssetSnapshots(id);
      setSnapshots(s);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load snapshots');
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    if (selectedId != null) loadSnapshots(selectedId);
    else setSnapshots([]);
  }, [selectedId]);

  const createAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      await api.createAsset({
        name: form.name,
        kind: form.kind,
        categoryId: null,
      });
      setForm({ name: '', kind: 'ASSET' });
      await loadAssets();
    } catch (e: any) {
      alert(e.message ?? 'Failed to create asset');
    }
  };

  const deleteAsset = async (id: number) => {
    if (!confirm('Delete this asset and all its snapshots?')) return;
    try {
      await api.deleteAsset(id);
      if (selectedId === id) setSelectedId(null);
      await loadAssets();
    } catch (e: any) {
      alert(e.message ?? 'Failed to delete');
    }
  };

  const createSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId == null || !snapForm.balance) return;
    try {
      await api.createAssetSnapshot(selectedId, {
        snapshotDate: snapForm.snapshotDate,
        balance: Number(snapForm.balance),
      });
      setSnapForm({ snapshotDate: todayIso(), balance: '' });
      await loadSnapshots(selectedId);
      await loadAssets();
    } catch (e: any) {
      alert(e.message ?? 'Failed to add snapshot');
    }
  };

  const selected = assets.find((a) => a.id === selectedId) ?? null;

  const totalAssets = assets
    .filter((a) => a.kind === 'ASSET')
    .reduce((sum, a) => sum + Number(latestByAsset[a.id]?.balance ?? 0), 0);
  const totalLiabilities = assets
    .filter((a) => a.kind === 'LIABILITY')
    .reduce((sum, a) => sum + Number(latestByAsset[a.id]?.balance ?? 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Assets</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total assets" value={formatMoney(totalAssets)} tone="positive" />
        <StatCard
          label="Total liabilities"
          value={formatMoney(totalLiabilities)}
          tone="negative"
        />
        <StatCard
          label="Net worth"
          value={formatMoney(netWorth)}
          tone={netWorth < 0 ? 'negative' : 'positive'}
        />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <form
        onSubmit={createAsset}
        className="bg-white p-4 rounded shadow-sm flex gap-3 items-end"
      >
        <div className="flex flex-col flex-1">
          <label className="text-xs text-gray-500">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Kind</label>
          <select
            value={form.kind}
            onChange={(e) =>
              setForm({ ...form, kind: e.target.value as Asset['kind'] })
            }
            className="border p-2 rounded"
          >
            <option value="ASSET">Asset</option>
            <option value="LIABILITY">Liability</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add asset
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow-sm">
          <div className="p-4 border-b font-semibold">Your assets</div>
          {loading && <div className="p-4 text-gray-500">Loading…</div>}
          {!loading && assets.length === 0 && (
            <div className="p-4 text-gray-500">No assets yet.</div>
          )}
          <ul>
            {assets.map((a) => {
              const latest = latestByAsset[a.id];
              return (
                <li
                  key={a.id}
                  className={`p-3 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                    selectedId === a.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedId(a.id)}
                >
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-gray-500">
                      {a.kind}
                      {latest
                        ? ` · as of ${latest.snapshotDate}`
                        : ' · no snapshots'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-mono text-sm ${
                        a.kind === 'LIABILITY'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {latest ? formatMoney(latest.balance) : '—'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAsset(a.id);
                      }}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-white rounded shadow-sm">
          <div className="p-4 border-b font-semibold">
            {selected ? `Snapshots: ${selected.name}` : 'Select an asset'}
          </div>
          {selected && (
            <>
              <form
                onSubmit={createSnapshot}
                className="p-4 border-b flex gap-2 items-end"
              >
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500">Date</label>
                  <input
                    type="date"
                    value={snapForm.snapshotDate}
                    onChange={(e) =>
                      setSnapForm({ ...snapForm, snapshotDate: e.target.value })
                    }
                    className="border p-2 rounded"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="text-xs text-gray-500">Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={snapForm.balance}
                    onChange={(e) =>
                      setSnapForm({ ...snapForm, balance: e.target.value })
                    }
                    className="border p-2 rounded"
                    required
                  />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Add
                </button>
              </form>

              {snapshots.length === 0 ? (
                <div className="p-4 text-gray-500">No snapshots yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left p-3">Date</th>
                      <th className="text-right p-3">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshots.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="p-3">{s.snapshotDate}</td>
                        <td className="p-3 text-right font-mono">
                          {formatMoney(s.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------- History -------- */

export function History() {
  const today = currentYearMonth();
  const defaultFrom = shiftYearMonth(today, -11);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);
  const [data, setData] = useState<NetWorthPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await api.getNetWorth(from, to);
      setData(d);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [from, to]);

  const chartData = data.map((p) => ({
    yearMonth: p.yearMonth,
    netWorth: Number(p.netWorth),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">History</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500">From</label>
          <input
            type="month"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <label className="text-sm text-gray-500">To</label>
          <input
            type="month"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="bg-white rounded shadow-sm p-4">
        <h3 className="font-semibold mb-3">Net worth</h3>
        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : chartData.length === 0 ? (
          <div className="text-gray-500">No data for this range.</div>
        ) : (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="yearMonth" />
                <YAxis />
                <Tooltip formatter={(v: any) => formatMoney(v)} />
                <Line
                  type="monotone"
                  dataKey="netWorth"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Month</th>
                <th className="text-right p-3">Net worth</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((p) => (
                <tr key={p.yearMonth} className="border-t">
                  <td className="p-3">{p.yearMonth}</td>
                  <td className="p-3 text-right font-mono">
                    {formatMoney(p.netWorth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
