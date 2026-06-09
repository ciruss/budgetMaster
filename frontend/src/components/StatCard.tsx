export default function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const color =
    tone === "positive"
      ? "text-green-600"
      : tone === "negative"
        ? "text-red-600"
        : "text-gray-900";
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
