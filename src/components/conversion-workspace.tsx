"use client";

import { useState } from "react";
import { AlertTriangle, Check, Copy, Download, Lock, RotateCcw } from "lucide-react";
import {
  CONVERSION_MATRIX,
  ConversionError,
  ConversionResult,
  DetectedFormat,
  FileFormat,
  FileSummary,
  FORMAT_LABEL,
} from "@/types/converter";
import { detectFormat } from "@/lib/detect-format";
import { buildFileSummary, convert, ParsedSource, parseSourceContent } from "@/lib/converter";
import { formatBytes } from "@/lib/format";
import { downloadTextFile } from "@/lib/download";
import { FileDropzone } from "@/components/file-dropzone";
import { TransformControl } from "@/components/transform-control";
import { OriginalPreview } from "@/components/original-preview";
import { ConvertedPreview } from "@/components/converted-preview";
import { ErrorBlock, WarningBanner } from "@/components/error-banner";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type ReadyState = {
  stage: "ready";
  filename: string;
  sizeBytes: number;
  rawContent: string;
  detected: DetectedFormat;
  sourceFormat: FileFormat;
  data: ParsedSource;
  summary: FileSummary;
  warnings: string[];
  targetFormat: FileFormat | null;
  converting: boolean;
  pulseKey: number;
  result: ConversionResult | null;
  editedContent: string;
  conversionError: ConversionError | null;
};

type ErrorState = {
  stage: "error";
  filename: string;
  sizeBytes: number;
  error: ConversionError;
  reinterpret?: { rawContent: string; detected: DetectedFormat; sourceFormat: FileFormat };
};

type WorkspaceState =
  | { stage: "idle" }
  | { stage: "loading"; filename: string; sizeBytes: number; step: string }
  | ErrorState
  | ReadyState;

function nextFrame(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function resultSummaryLabel(data: ParsedSource): string {
  if (data.format === "csv") return `${data.table.rowCount.toLocaleString("en-US")} rows converted`;
  if (data.format === "json" && (data.kind === "array-of-objects" || data.kind === "array")) {
    return `${(data.value as unknown[]).length.toLocaleString("en-US")} records converted`;
  }
  return "Converted";
}

function MismatchBanner({
  filename,
  detected,
  currentSourceFormat,
  onPick,
}: {
  filename: string;
  detected: DetectedFormat;
  currentSourceFormat: FileFormat;
  onPick: (format: FileFormat) => void;
}) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-soft bg-[#FFF7EC] px-5 py-2.5 text-xs"
    >
      <span className="inline-flex items-center gap-1.5 font-semibold text-warning">
        <AlertTriangle size={12} aria-hidden="true" />
        FORMAT MISMATCH
      </span>
      <span className="text-secondary">
        Extension <span className="font-mono text-foreground">.{filename.split(".").pop()}</span>
      </span>
      <span className="text-secondary">
        Detected <span className="font-mono text-foreground">{FORMAT_LABEL[detected.contentFormat]}</span>
      </span>
      <div className="flex gap-2 sm:ml-auto">
        {detected.extensionFormat && (
          <button
            type="button"
            onClick={() => onPick(detected.extensionFormat as FileFormat)}
            disabled={currentSourceFormat === detected.extensionFormat}
            className="focus-ring rounded-md border border-warning/40 px-2.5 py-1 font-medium text-warning hover:bg-warning/10 disabled:opacity-50"
          >
            Use {FORMAT_LABEL[detected.extensionFormat]}
          </button>
        )}
        <button
          type="button"
          onClick={() => onPick(detected.contentFormat)}
          disabled={currentSourceFormat === detected.contentFormat}
          className="focus-ring rounded-md border border-warning/40 px-2.5 py-1 font-medium text-warning hover:bg-warning/10 disabled:opacity-50"
        >
          Use {FORMAT_LABEL[detected.contentFormat]}
        </button>
      </div>
    </div>
  );
}

function PrivacyFooter() {
  return (
    <div className="flex items-center gap-1.5 border-t border-border-soft px-5 py-2.5 text-[11px] text-secondary">
      <Lock size={11} aria-hidden="true" />
      Processed locally in your browser. No file data is uploaded.
    </div>
  );
}

export function ConversionWorkspace() {
  const [state, setState] = useState<WorkspaceState>({ stage: "idle" });
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function loadFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      setState({
        stage: "error",
        filename: file.name,
        sizeBytes: file.size,
        error: {
          title: "File too large",
          detail: "This file is too large for reliable in-browser conversion. Try a file under 10 MB.",
        },
      });
      return;
    }

    setState({ stage: "loading", filename: file.name, sizeBytes: file.size, step: "Reading file…" });
    await nextFrame();

    let text: string;
    try {
      text = await file.text();
    } catch {
      setState({
        stage: "error",
        filename: file.name,
        sizeBytes: file.size,
        error: { title: "Could not read file", detail: "This file could not be read as text." },
      });
      return;
    }

    setState({ stage: "loading", filename: file.name, sizeBytes: file.size, step: "Detecting format…" });
    await nextFrame();

    const detected = detectFormat(file.name, text);

    setState({ stage: "loading", filename: file.name, sizeBytes: file.size, step: "Parsing…" });
    await nextFrame();

    applyInterpretation(file.name, file.size, text, detected, detected.contentFormat);
  }

  function applyInterpretation(
    filename: string,
    sizeBytes: number,
    rawContent: string,
    detected: DetectedFormat,
    sourceFormat: FileFormat
  ) {
    const outcome = parseSourceContent(sourceFormat, rawContent);

    if (!outcome.ok) {
      setState({
        stage: "error",
        filename,
        sizeBytes,
        error: outcome.error,
        reinterpret: detected.mismatch ? { rawContent, detected, sourceFormat } : undefined,
      });
      return;
    }

    const summary = buildFileSummary(filename, sizeBytes, outcome.data);

    setState({
      stage: "ready",
      filename,
      sizeBytes,
      rawContent,
      detected,
      sourceFormat,
      data: outcome.data,
      summary,
      warnings: outcome.warnings,
      targetFormat: null,
      converting: false,
      pulseKey: 0,
      result: null,
      editedContent: "",
      conversionError: null,
    });
  }

  function reinterpret(format: FileFormat) {
    if (state.stage === "ready") {
      applyInterpretation(state.filename, state.sizeBytes, state.rawContent, state.detected, format);
    } else if (state.stage === "error" && state.reinterpret) {
      applyInterpretation(state.filename, state.sizeBytes, state.reinterpret.rawContent, state.reinterpret.detected, format);
    }
  }

  function updateReady(patch: Partial<ReadyState>) {
    setState((prev) => (prev.stage === "ready" ? { ...prev, ...patch } : prev));
  }

  async function handleConvert() {
    if (state.stage !== "ready" || !state.targetFormat) return;
    const targetFormat = state.targetFormat;
    updateReady({ converting: true, conversionError: null, pulseKey: state.pulseKey + 1 });
    await nextFrame();

    const outcome = convert(state.data, targetFormat, state.filename);
    if ("error" in outcome) {
      updateReady({ converting: false, conversionError: outcome.error, result: null });
      return;
    }

    updateReady({ converting: false, result: outcome, editedContent: outcome.content, conversionError: null });
  }

  async function handleCopy() {
    if (state.stage !== "ready") return;
    try {
      await navigator.clipboard.writeText(state.editedContent);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2000);
  }

  function handleDownload() {
    if (state.stage !== "ready" || !state.result) return;
    downloadTextFile(state.editedContent, state.result.filename, state.result.mimeType);
  }

  function reset() {
    setState({ stage: "idle" });
    setCopyState("idle");
  }

  return (
    <div className="mx-auto w-full overflow-hidden rounded-xl border border-border bg-surface">
      {state.stage === "idle" && (
        <>
          <FileDropzone onFile={loadFile} />
          <PrivacyFooter />
        </>
      )}

      {state.stage === "loading" && (
        <div
          className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-soft border-t-accent" />
          <p className="text-sm font-medium text-secondary">{state.step}</p>
        </div>
      )}

      {state.stage === "error" && (
        <>
          {state.reinterpret && (
            <MismatchBanner
              filename={state.filename}
              detected={state.reinterpret.detected}
              currentSourceFormat={state.reinterpret.sourceFormat}
              onPick={reinterpret}
            />
          )}
          <ErrorBlock error={state.error} onReset={reset} />
        </>
      )}

      {state.stage === "ready" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft px-5 py-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="max-w-[240px] truncate font-mono font-medium text-foreground" title={state.filename}>
                {state.filename}
              </span>
              <span className="text-border">·</span>
              <span className="text-secondary">{formatBytes(state.sizeBytes)}</span>
              {state.summary.csv && (
                <>
                  <span className="text-border">·</span>
                  <span className="text-secondary">
                    {state.summary.csv.rows.toLocaleString("en-US")} rows
                  </span>
                  <span className="text-border">·</span>
                  <span className="text-secondary">{state.summary.csv.columns} columns</span>
                </>
              )}
              {state.summary.json && state.summary.json.recordCount !== null && (
                <>
                  <span className="text-border">·</span>
                  <span className="text-secondary">
                    {state.summary.json.recordCount.toLocaleString("en-US")} records
                  </span>
                </>
              )}
              {state.summary.text && (
                <>
                  <span className="text-border">·</span>
                  <span className="text-secondary">{state.summary.text.lines.toLocaleString("en-US")} lines</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={reset}
              className="focus-ring inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-secondary hover:text-foreground"
            >
              <RotateCcw size={12} /> Change file
            </button>
          </div>

          {state.detected.mismatch && (
            <MismatchBanner
              filename={state.filename}
              detected={state.detected}
              currentSourceFormat={state.sourceFormat}
              onPick={reinterpret}
            />
          )}

          <WarningBanner messages={state.warnings} />

          <TransformControl
            source={state.sourceFormat}
            target={state.targetFormat}
            validTargets={CONVERSION_MATRIX[state.sourceFormat]}
            onTargetChange={(format) => updateReady({ targetFormat: format, result: null, conversionError: null })}
            pulseKey={state.pulseKey}
          />

          <div className="grid grid-cols-1 divide-y divide-border-soft lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            <OriginalPreview data={state.data} rawContent={state.rawContent} />
            <ConvertedPreview
              targetFormat={state.targetFormat}
              result={state.result}
              conversionError={state.conversionError}
              content={state.editedContent}
              onContentChange={(value) => updateReady({ editedContent: value })}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft px-5 py-3">
            {state.result ? (
              <>
                <span className="font-mono text-xs text-secondary">
                  {resultSummaryLabel(state.data)} · {FORMAT_LABEL[state.sourceFormat]} → {FORMAT_LABEL[state.result.targetFormat]}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-foreground/40"
                  >
                    {copyState === "copied" ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                    {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
                  >
                    <Download size={13} />
                    Download .{state.result.filename.split(".").pop()}
                  </button>
                </div>
              </>
            ) : state.targetFormat ? (
              <button
                type="button"
                onClick={handleConvert}
                disabled={state.converting}
                className="focus-ring mx-auto inline-flex items-center gap-2 rounded-md bg-accent px-6 py-2 font-mono text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {state.converting
                  ? "Converting…"
                  : `Convert ${FORMAT_LABEL[state.sourceFormat]} → ${FORMAT_LABEL[state.targetFormat]}`}
              </button>
            ) : (
              <span className="mx-auto text-xs text-secondary">Choose an output format above.</span>
            )}
          </div>

          <PrivacyFooter />
        </>
      )}
    </div>
  );
}
