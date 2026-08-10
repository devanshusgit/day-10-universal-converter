const PREVIEW_CHAR_LIMIT = 20000;

export function TextPreview({ content }: { content: string }) {
  const truncated = content.length > PREVIEW_CHAR_LIMIT;
  const visible = truncated ? content.slice(0, PREVIEW_CHAR_LIMIT) : content;

  return (
    <div className="flex h-full flex-col">
      <pre className="flex-1 overflow-auto bg-[#FAFAF8] p-4 font-mono text-[13px] leading-[1.6] whitespace-pre-wrap break-words text-foreground">
        {visible}
      </pre>
      {truncated && (
        <p className="border-t border-border-soft px-4 py-1.5 text-[11px] text-secondary">
          Previewing first {PREVIEW_CHAR_LIMIT.toLocaleString("en-US")} of{" "}
          {content.length.toLocaleString("en-US")} characters
        </p>
      )}
    </div>
  );
}
