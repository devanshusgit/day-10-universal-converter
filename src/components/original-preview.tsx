"use client";

import { useState } from "react";
import { ParsedSource } from "@/lib/converter";
import { jsonArrayToCsvTable, prettyJson } from "@/lib/json";
import { TablePreview } from "@/components/table-preview";
import { TextPreview } from "@/components/text-preview";

function ViewToggle({
  view,
  onChange,
}: {
  view: "table" | "raw";
  onChange: (view: "table" | "raw") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border p-0.5 text-xs font-medium">
      {(["table", "raw"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`focus-ring rounded-md px-2.5 py-1 capitalize transition-colors ${
            view === v ? "bg-accent-soft text-accent-hover" : "text-secondary hover:text-foreground"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

export function OriginalPreview({ data, rawContent }: { data: ParsedSource; rawContent: string }) {
  const [view, setView] = useState<"table" | "raw">("table");
  const isTabular =
    data.format === "csv" || (data.format === "json" && data.kind === "array-of-objects");

  return (
    <div>
      {isTabular && (
        <div className="mb-2 flex justify-end">
          <ViewToggle view={view} onChange={setView} />
        </div>
      )}

      {data.format === "csv" &&
        (view === "table" ? (
          <TablePreview headers={data.table.headers} rows={data.table.rows} totalRowCount={data.table.rowCount} />
        ) : (
          <TextPreview content={rawContent} />
        ))}

      {data.format === "json" &&
        (data.kind === "array-of-objects" && view === "table" ? (
          (() => {
            const table = jsonArrayToCsvTable(data.value as Record<string, unknown>[]);
            return <TablePreview headers={table.headers} rows={table.rows} totalRowCount={table.rowCount} />;
          })()
        ) : (
          <TextPreview content={prettyJson(data.value)} />
        ))}

      {(data.format === "txt" || data.format === "markdown") && <TextPreview content={data.text} />}
    </div>
  );
}
