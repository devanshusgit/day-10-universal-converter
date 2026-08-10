"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { FileFormat, FORMAT_LABEL } from "@/types/converter";

export function TransformControl({
  source,
  target,
  validTargets,
  onTargetChange,
  onConvert,
  converting,
  canConvert,
}: {
  source: FileFormat;
  target: FileFormat | null;
  validTargets: FileFormat[];
  onTargetChange: (format: FileFormat) => void;
  onConvert: () => void;
  converting: boolean;
  canConvert: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <div className="flex min-w-[96px] flex-col items-center gap-1">
          <span className="text-[11px] font-medium tracking-wide text-secondary">SOURCE</span>
          <span className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground">
            {FORMAT_LABEL[source]}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 text-secondary" aria-hidden="true">
          <motion.div
            animate={converting ? { x: [0, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.6, repeat: converting ? Infinity : 0 }}
          >
            <ArrowRight size={20} />
          </motion.div>
          <span className="text-[10px] font-medium tracking-wide">CONVERT</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] font-medium tracking-wide text-secondary">TARGET</span>
          <div className="flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Output format">
            {validTargets.map((format) => {
              const selected = format === target;
              return (
                <button
                  key={format}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onTargetChange(format)}
                  className={`focus-ring relative rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                    selected
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-background text-foreground hover:border-accent/50"
                  }`}
                >
                  {FORMAT_LABEL[format]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={onConvert}
          disabled={!canConvert || converting}
          className="focus-ring inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {converting ? "Converting…" : "Convert"}
        </button>
      </div>
    </div>
  );
}
