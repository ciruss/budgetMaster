import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";

import type { Asset, Snapshot } from "../types";
import { formatMoney, todayIso } from "../lib/utils";
import { api } from "../api/api";
import { queryKeys } from "../api/queryKeys";
import {
  useAssetSnapshotsQuery,
  useAssetsQuery,
  useCreateAssetMutation,
  useCreateAssetSnapshotMutation,
  useDeleteAssetMutation,
} from "../api/queries";

import StatCard from "../components/StatCard";

export default function Assets() {
  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError,
  } = useAssetsQuery();
  const createAssetMutation = useCreateAssetMutation();
  const deleteAssetMutation = useDeleteAssetMutation();
  const createAssetSnapshotMutation = useCreateAssetSnapshotMutation();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    kind: "ASSET" as Asset["kind"],
  });
  const [snapForm, setSnapForm] = useState({
    snapshotDate: todayIso(),
    balance: "",
  });

  const snapshotQueries = useQueries({
    queries: assets.map((asset) => ({
      queryKey: queryKeys.assets.snapshots(asset.id),
      queryFn: () => api.getAssetSnapshots(asset.id),
    })),
  });
  const selectedSnapshotsQuery = useAssetSnapshotsQuery(selectedId);
  const loading =
    assetsLoading || snapshotQueries.some((query) => query.isLoading);
  const error =
    assetsError ??
    snapshotQueries.find((query) => query.error)?.error ??
    selectedSnapshotsQuery.error;

  const pickLatest = (list: Snapshot[]): Snapshot | null => {
    if (!list.length) return null;
    return [...list].sort((a, b) =>
      a.snapshotDate < b.snapshotDate ? 1 : -1
    )[0];
  };

  const latestByAsset = useMemo(() => {
    const map: Record<number, Snapshot | null> = {};

    assets.forEach((asset, index) => {
      map[asset.id] = pickLatest(snapshotQueries[index]?.data ?? []);
    });

    return map;
  }, [assets, snapshotQueries]);

  const snapshots = selectedSnapshotsQuery.data ?? [];

  const createAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      await createAssetMutation.mutateAsync({
        name: form.name,
        kind: form.kind,
        categoryId: null,
      });
      setForm({ name: "", kind: "ASSET" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create asset");
    }
  };

  const deleteAsset = async (id: number) => {
    if (!confirm("Delete this asset and all its snapshots?")) return;
    try {
      await deleteAssetMutation.mutateAsync({ id });
      if (selectedId === id) setSelectedId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  const createSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId == null || !snapForm.balance) return;
    try {
      await createAssetSnapshotMutation.mutateAsync({
        id: selectedId,
        payload: {
          snapshotDate: snapForm.snapshotDate,
          balance: Number(snapForm.balance),
        },
      });
      setSnapForm({ snapshotDate: todayIso(), balance: "" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add snapshot");
    }
  };

  const selected = assets.find((a) => a.id === selectedId) ?? null;

  const totalAssets = assets
    .filter((a) => a.kind === "ASSET")
    .reduce((sum, a) => sum + Number(latestByAsset[a.id]?.balance ?? 0), 0);
  const totalLiabilities = assets
    .filter((a) => a.kind === "LIABILITY")
    .reduce((sum, a) => sum + Number(latestByAsset[a.id]?.balance ?? 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Assets</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total assets"
          value={formatMoney(totalAssets)}
          tone="positive"
        />
        <StatCard
          label="Total liabilities"
          value={formatMoney(totalLiabilities)}
          tone="negative"
        />
        <StatCard
          label="Net worth"
          value={formatMoney(netWorth)}
          tone={netWorth < 0 ? "negative" : "positive"}
        />
      </div>

      {error && (
        <div className="text-red-600">
          {error instanceof Error ? error.message : "Failed to load"}
        </div>
      )}

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
              setForm({ ...form, kind: e.target.value as Asset["kind"] })
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
                    selectedId === a.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedId(a.id)}
                >
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-gray-500">
                      {a.kind}
                      {latest
                        ? ` · as of ${latest.snapshotDate}`
                        : " · no snapshots"}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`font-mono text-sm ${
                        a.kind === "LIABILITY"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {latest ? formatMoney(latest.balance) : "—"}
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
            {selected ? `Snapshots: ${selected.name}` : "Select an asset"}
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
