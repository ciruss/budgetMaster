import { shiftYearMonth } from "../lib/utils";

type MonthPickerProps = {
  value: string;
  onChange: (ym: string) => void;
};

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
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
