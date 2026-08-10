import { FileSummary, FORMAT_LABEL } from "@/types/converter";
import { formatBytes, formatNumber } from "@/lib/format";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-secondary">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function FileSummaryCard({ summary }: { summary: FileSummary }) {
  const stats: { label: string; value: string }[] = [];

  if (summary.csv) {
    stats.push({ label: "Rows", value: formatNumber(summary.csv.rows) });
    stats.push({ label: "Columns", value: formatNumber(summary.csv.columns) });
  } else if (summary.json) {
    stats.push({ label: "Type", value: summary.json.kind.replace(/-/g, " ") });
    if (summary.json.recordCount !== null) {
      stats.push({ label: "Records", value: formatNumber(summary.json.recordCount) });
    }
    if (summary.json.topLevelKeyCount !== null) {
      stats.push({ label: "Keys", value: formatNumber(summary.json.topLevelKeyCount) });
    }
  } else if (summary.text) {
    stats.push({ label: "Characters", value: formatNumber(summary.text.characters) });
    stats.push({ label: "Lines", value: formatNumber(summary.text.lines) });
    stats.push({ label: "Words", value: formatNumber(summary.text.words) });
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-foreground" title={summary.filename}>
          {summary.filename}
        </p>
        <span className="shrink-0 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-hover">
          {FORMAT_LABEL[summary.format]}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Size" value={formatBytes(summary.sizeBytes)} />
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} />
        ))}
        <Stat label="Encoding" value={summary.encoding} />
      </div>
    </div>
  );
}
