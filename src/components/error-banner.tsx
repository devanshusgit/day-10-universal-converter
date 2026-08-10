import { AlertTriangle, RotateCcw } from "lucide-react";
import { ConversionError } from "@/types/converter";

export function ErrorBlock({ error, onReset }: { error: ConversionError; onReset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div>
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-error">
          <AlertTriangle size={14} aria-hidden="true" />
          {error.title.toUpperCase()}
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-secondary">{error.detail}</p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:border-foreground/40"
      >
        <RotateCcw size={12} /> Choose another file
      </button>
    </div>
  );
}

export function WarningBanner({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <div role="status" className="border-b border-border-soft bg-[#FFF7EC] px-5 py-2 text-xs text-warning">
      {messages.map((message, i) => (
        <p key={i} className="flex items-center gap-1.5">
          <AlertTriangle size={12} className="shrink-0" aria-hidden="true" />
          {message}
        </p>
      ))}
    </div>
  );
}
