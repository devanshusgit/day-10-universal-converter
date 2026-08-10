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
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-max border-collapse text-left text-[13px]">
          <thead className="sticky top-0 z-10 bg-[#FAFAF8]">
            <tr>
              <th className="border-b border-border-soft px-3 py-2 text-[11px] font-medium text-secondary">#</th>
              {headers.map((header) => (
                <th
                  key={header}
                  className="border-b border-border-soft px-3 py-2 font-mono font-medium whitespace-nowrap text-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i} className="border-b border-border-soft last:border-0 hover:bg-background/70">
                <td className="px-3 py-1.5 text-[11px] text-secondary">{i + 1}</td>
                {headers.map((header) => {
                  const value = row[header] ?? "";
                  return (
                    <td
                      key={header}
                      className="whitespace-nowrap px-3 py-1.5 font-mono text-foreground"
                      title={value}
                    >
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
        <p className="border-t border-border-soft px-3 py-1.5 text-[11px] text-secondary">
          Previewing first {visibleRows.length} of {totalRowCount.toLocaleString("en-US")} rows
        </p>
      )}
    </div>
  );
}
