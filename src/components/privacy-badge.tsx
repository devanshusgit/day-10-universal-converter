import { Lock } from "lucide-react";

export function PrivacyBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap text-secondary ${className}`}>
      <Lock size={12} className="text-secondary" aria-hidden="true" />
      LOCAL ONLY
      <span className="hidden text-border sm:inline">·</span>
      <span className="hidden sm:inline">No uploads</span>
    </span>
  );
}
