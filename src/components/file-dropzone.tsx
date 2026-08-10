"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

const ACCEPT = ".csv,.json,.txt,.md,.markdown";

export function FileDropzone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    onFile(files[0]);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop a file to begin, or press Enter to browse files"
      className={`focus-ring flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-20 text-center transition-colors cursor-pointer ${
        dragging ? "border-accent bg-accent-soft" : "border-border hover:border-foreground/30"
      }`}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <UploadCloud size={22} className={dragging ? "text-accent" : "text-secondary"} aria-hidden="true" />
      <div>
        <p className="text-[15px] font-semibold text-foreground">Drop a file here</p>
        <p className="mt-1 font-mono text-xs tracking-wide text-secondary">CSV / JSON / TXT / MARKDOWN</p>
      </div>
      <span className="mt-1 text-sm font-medium text-accent underline-offset-4 hover:underline">
        or choose a file
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
