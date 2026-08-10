"use client";

import { ArrowRight } from "lucide-react";
import { FileFormat, FORMAT_LABEL } from "@/types/converter";

export function TransformControl({
  source,
  target,
  validTargets,
  onTargetChange,
  pulseKey,
}: {
  source: FileFormat;
  target: FileFormat | null;
  validTargets: FileFormat[];
  onTargetChange: (format: FileFormat) => void;
  pulseKey: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-5 border-b border-border-soft px-5 py-4 sm:gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Source</span>
        <span className="inline-flex w-fit rounded-md bg-foreground px-3 py-1.5 font-mono text-xs font-semibold text-white">
          {FORMAT_LABEL[source]}
        </span>
      </div>

      <div className="relative hidden h-px min-w-[48px] flex-1 bg-border sm:block" aria-hidden="true">
        <ArrowRight
          size={15}
          className="absolute top-1/2 right-0 -translate-y-1/2 text-secondary"
        />
        {pulseKey > 0 && (
          <span
            key={pulseKey}
            className="animate-data-pulse absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent"
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Target</span>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Output format">
          {validTargets.map((format) => {
            const selected = format === target;
            return (
              <button
                key={format}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onTargetChange(format)}
                className={`focus-ring rounded-md border px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                  selected
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-white text-foreground hover:border-foreground/40"
                }`}
              >
                {FORMAT_LABEL[format]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
