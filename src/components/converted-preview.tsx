"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ConversionError, ConversionResult, FileFormat, FORMAT_LABEL } from "@/types/converter";
import { parseCsv } from "@/lib/csv";
import { TablePreview } from "@/components/table-preview";

function Placeholder({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center px-6 text-center text-sm text-secondary">{children}</div>;
}

export function ConvertedPreview({
  targetFormat,
  result,
  conversionError,
  content,
  onContentChange,
}: {
  targetFormat: FileFormat | null;
  result: ConversionResult | null;
  conversionError: ConversionError | null;
  content: string;
  onContentChange: (value: string) => void;
}) {
  const [view, setView] = useState<"table" | "raw">("table");

  const csvTable = useMemo(() => {
    if (!result || result.targetFormat !== "csv") return null;
    return parseCsv(content).table;
  }, [result, content]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border-soft bg-background/60 px-4 py-2">
        <span className="text-[11px] font-semibold tracking-wider text-secondary uppercase">Converted</span>
        <div className="flex items-center gap-3">
          {targetFormat && (
            <span className="font-mono text-[11px] text-secondary">
              {FORMAT_LABEL[targetFormat]} · {result ? "Ready" : conversionError ? "Error" : "Not converted"}
            </span>
          )}
          {csvTable && (
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
        {!targetFormat && <Placeholder>Choose an output format.</Placeholder>}

        {targetFormat && conversionError && (
          <div role="alert" className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-error">
              <AlertTriangle size={12} aria-hidden="true" />
              {conversionError.title.toUpperCase()}
            </p>
            <p className="text-sm text-secondary">{conversionError.detail}</p>
          </div>
        )}

        {targetFormat && !result && !conversionError && <Placeholder>Press Convert to see the result.</Placeholder>}

        {result &&
          (csvTable && view === "table" ? (
            <TablePreview headers={csvTable.headers} rows={csvTable.rows} totalRowCount={csvTable.rowCount} />
          ) : (
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              spellCheck={false}
              aria-label="Converted output, editable"
              className="focus-ring h-full w-full resize-none bg-[#FAFAF8] p-4 font-mono text-[13px] leading-[1.6] text-foreground"
            />
          ))}
      </div>
    </div>
  );
}
