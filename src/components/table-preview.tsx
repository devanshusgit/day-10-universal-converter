const MAX_CELL_LENGTH = 120;
const PREVIEW_ROW_LIMIT = 50;

function truncateCell(value: string): string {
  if (value.length <= MAX_CELL_LENGTH) return value;
  return `${value.slice(0, MAX_CELL_LENGTH)}…`;
}

export function TablePreview({
  headers,
  rows,
  totalRowCount,
}: {
  headers: string[];
  rows: Record<string, string>[];
  totalRowCount: number;
}) {
  const visibleRows = rows.slice(0, PREVIEW_ROW_LIMIT);
  const truncated = totalRowCount > visibleRows.length;

  return (
    <div>
      <div className="max-h-96 overflow-auto rounded-lg border border-border">
        <table className="w-full min-w-max border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-background">
            <tr>
              <th className="border-b border-border px-3 py-2 text-xs font-medium text-secondary">#</th>
              {headers.map((header) => (
                <th
                  key={header}
                  className="border-b border-border px-3 py-2 font-medium text-foreground whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-background/60">
                <td className="px-3 py-2 text-xs text-secondary">{i + 1}</td>
                {headers.map((header) => {
                  const value = row[header] ?? "";
                  return (
                    <td key={header} className="px-3 py-2 text-foreground whitespace-nowrap" title={value}>
                      {truncateCell(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {truncated && (
        <p className="mt-2 text-xs text-secondary">
          Previewing first {visibleRows.length} of {totalRowCount.toLocaleString("en-US")} rows
        </p>
      )}
    </div>
  );
}
