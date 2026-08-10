export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M6 4L2 10L6 16" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 4L18 10L14 16" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 10H12.5" stroke="var(--foreground)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M11 8.2L12.8 10L11 11.8" stroke="var(--foreground)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[11px] font-semibold whitespace-nowrap uppercase tracking-[0.06em] text-foreground sm:text-[13px] sm:tracking-[0.08em]">
        Universal Converter
      </span>
    </div>
  );
}
