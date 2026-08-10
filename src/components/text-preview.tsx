const PREVIEW_CHAR_LIMIT = 20000;

export function TextPreview({ content }: { content: string }) {
  const truncated = content.length > PREVIEW_CHAR_LIMIT;
  const visible = truncated ? content.slice(0, PREVIEW_CHAR_LIMIT) : content;

  return (
    <div>
      <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-background p-3 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words text-foreground">
        {visible}
      </pre>
      {truncated && (
        <p className="mt-2 text-xs text-secondary">
          Previewing first {PREVIEW_CHAR_LIMIT.toLocaleString("en-US")} of{" "}
          {content.length.toLocaleString("en-US")} characters
        </p>
      )}
    </div>
  );
}
