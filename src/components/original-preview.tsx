"use client";

import { useState } from "react";
import { ParsedSource } from "@/lib/converter";
import { jsonArrayToCsvTable, prettyJson } from "@/lib/json";
import { textStats } from "@/lib/text";
import { FORMAT_LABEL } from "@/types/converter";
import { TablePreview } from "@/components/table-preview";
import { TextPreview } from "@/components/text-preview";

function metaLabel(data: ParsedSource): string {
  if (data.format === "csv") return `${data.table.rowCount.toLocaleString("en-US")} rows`;
  if (data.format === "json") {
    if (data.kind === "array-of-objects" || data.kind === "array") {
      return `${(data.value as unknown[]).length.toLocaleString("en-US")} records`;
    }
    return data.kind.replace(/-/g, " ");
  }
  return `${textStats(data.text).characters.toLocaleString("en-US")} chars`;
}

export function OriginalPreview({ data, rawContent }: { data: ParsedSource; rawContent: string }) {
  const [view, setView] = useState<"table" | "raw">("table");
  const isTabular = data.format === "csv" || (data.format === "json" && data.kind === "array-of-objects");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border-soft bg-background/60 px-4 py-2">
        <span className="text-[11px] font-semibold tracking-wider text-secondary uppercase">Original</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-secondary">
            {FORMAT_LABEL[data.format]} · {metaLabel(data)}
          </span>
          {isTabular && (
            <div className="inline-flex rounded-md border border-border-soft p-0.5 text-[11px] font-medium">
              {(["table", "raw"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`focus-ring rounded px-2 py-0.5 capitalize transition-colors ${
                    view === v ? "bg-accent-soft text-accent-hover" : "text-secondary hover:text-foreground"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-[320px] flex-1 sm:h-[420px]">
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
    </div>
  );
}
