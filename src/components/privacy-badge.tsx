import { ShieldCheck } from "lucide-react";

export function PrivacyBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-secondary ${className}`}
    >
      <ShieldCheck size={13} className="text-success" aria-hidden="true" />
      LOCAL ONLY · No uploads
    </span>
  );
}
