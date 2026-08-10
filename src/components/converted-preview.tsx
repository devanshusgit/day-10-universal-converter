"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { ConversionResult } from "@/types/converter";
import { parseCsv } from "@/lib/csv";
import { TablePreview } from "@/components/table-preview";
import { downloadTextFile } from "@/lib/download";

export function ConvertedPreview({
  result,
  content,
  onContentChange,
}: {
  result: ConversionResult;
  content: string;
  onContentChange: (value: string) => void;
}) {
  const [view, setView] = useState<"table" | "raw">("table");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const csvTable = useMemo(() => {
    if (result.targetFormat !== "csv") return null;
    return parseCsv(content).table;
  }, [result.targetFormat, content]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2000);
  }

  function handleDownload() {
    downloadTextFile(content, result.filename, result.mimeType);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        {csvTable ? (
          <div className="inline-flex rounded-lg border border-border p-0.5 text-xs font-medium">
            {(["table", "raw"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`focus-ring rounded-md px-2.5 py-1 capitalize transition-colors ${
                  view === v ? "bg-accent-soft text-accent-hover" : "text-secondary hover:text-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-secondary">Editable before download</span>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent/50"
          >
            {copyState === "copied" ? <Check size={13} className="text-success" /> : <Copy size={13} />}
            {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy output"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
          >
            <Download size={13} />
            Download
          </button>
        </div>
      </div>

      {csvTable && view === "table" ? (
        <TablePreview headers={csvTable.headers} rows={csvTable.rows} totalRowCount={csvTable.rowCount} />
      ) : (
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          spellCheck={false}
          aria-label="Converted output, editable"
          className="focus-ring h-96 w-full resize-none rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground"
        />
      )}
    </div>
  );
}
