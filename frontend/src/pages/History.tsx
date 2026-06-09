import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { currentYearMonth, formatMoney, shiftYearMonth } from "../lib/utils";
import { useNetWorthQuery } from "../api/queries";

export default function History() {
  const today = currentYearMonth();
  const defaultFrom = shiftYearMonth(today, -11);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);

  const {
    data = [],
    isLoading: netWorthLoading,
    error: netWorthError,
  } = useNetWorthQuery(from, to);
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

      {netWorthError && (
        <div className="text-red-600">
          {netWorthError instanceof Error
            ? netWorthError.message
            : "Failed to load"}
        </div>
      )}

      <div className="bg-white rounded shadow-sm p-4">
        <h3 className="font-semibold mb-3">Net worth</h3>
        {netWorthLoading ? (
          <div className="text-gray-500">Loading…</div>
        ) : chartData.length === 0 ? (
          <div className="text-gray-500">No data for this range.</div>
        ) : (
          <div style={{ width: "100%", height: 320 }}>
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
