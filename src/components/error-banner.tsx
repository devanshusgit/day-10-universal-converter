import { AlertTriangle } from "lucide-react";
import { ConversionError } from "@/types/converter";

export function ErrorBanner({ error }: { error: ConversionError }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-[#E6B3B3] bg-[#FBEDED] p-4"
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#B3261E]" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-[#8C1D18]">{error.title.toUpperCase()}</p>
        <p className="mt-0.5 text-sm text-[#8C1D18]/90">{error.detail}</p>
      </div>
    </div>
  );
}

export function WarningBanner({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-border bg-accent-soft p-4">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-hover" aria-hidden="true" />
      <div className="space-y-0.5">
        {messages.map((message, i) => (
          <p key={i} className="text-sm text-accent-hover">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}
