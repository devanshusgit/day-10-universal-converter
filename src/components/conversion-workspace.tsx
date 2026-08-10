"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
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
import { FileDropzone } from "@/components/file-dropzone";
import { FileSummaryCard } from "@/components/file-summary";
import { TransformControl } from "@/components/transform-control";
import { OriginalPreview } from "@/components/original-preview";
import { ConvertedPreview } from "@/components/converted-preview";
import { ErrorBanner, WarningBanner } from "@/components/error-banner";

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
    <div role="status" className="rounded-xl border border-border bg-accent-soft p-4 text-sm">
      <p className="font-semibold text-accent-hover">FORMAT MISMATCH</p>
      <p className="mt-1 text-accent-hover/90">
        File extension: <strong>.{filename.split(".").pop()}</strong> — Detected content:{" "}
        <strong>{FORMAT_LABEL[detected.contentFormat]}</strong>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {detected.extensionFormat && (
          <button
            type="button"
            onClick={() => onPick(detected.extensionFormat as FileFormat)}
            disabled={currentSourceFormat === detected.extensionFormat}
            className="focus-ring rounded-lg border border-accent bg-surface px-3 py-1.5 text-xs font-medium text-accent-hover disabled:opacity-50"
          >
            Use extension: {FORMAT_LABEL[detected.extensionFormat]}
          </button>
        )}
        <button
          type="button"
          onClick={() => onPick(detected.contentFormat)}
          disabled={currentSourceFormat === detected.contentFormat}
          className="focus-ring rounded-lg border border-accent bg-surface px-3 py-1.5 text-xs font-medium text-accent-hover disabled:opacity-50"
        >
          Use detected: {FORMAT_LABEL[detected.contentFormat]}
        </button>
      </div>
    </div>
  );
}

export function ConversionWorkspace() {
  const [state, setState] = useState<WorkspaceState>({ stage: "idle" });

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
    updateReady({ converting: true, conversionError: null });
    await nextFrame();

    const outcome = convert(state.data, targetFormat, state.filename);
    if ("error" in outcome) {
      updateReady({ converting: false, conversionError: outcome.error, result: null });
      return;
    }

    updateReady({ converting: false, result: outcome, editedContent: outcome.content, conversionError: null });
  }

  function reset() {
    setState({ stage: "idle" });
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {state.stage === "idle" && (
        <div>
          <FileDropzone onFile={loadFile} />
          <p className="mt-3 text-center text-xs text-secondary" aria-live="polite">
            Drop a file to begin.
          </p>
        </div>
      )}

      {state.stage === "loading" && (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface px-6 py-14 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-soft border-t-accent" />
          <p className="text-sm font-medium text-secondary">{state.step}</p>
        </div>
      )}

      {state.stage === "error" && (
        <div className="space-y-4">
          {state.reinterpret && (
            <MismatchBanner
              filename={state.filename}
              detected={state.reinterpret.detected}
              currentSourceFormat={state.reinterpret.sourceFormat}
              onPick={reinterpret}
            />
          )}
          <ErrorBanner error={state.error} />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={reset}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-accent/50"
            >
              <RotateCcw size={14} /> Start over
            </button>
          </div>
        </div>
      )}

      {state.stage === "ready" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-secondary">Conversion workspace</h2>
            <button
              type="button"
              onClick={reset}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent/50"
            >
              <RotateCcw size={12} /> Start over
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

          <FileSummaryCard summary={state.summary} />

          <WarningBanner messages={state.warnings} />

          <TransformControl
            source={state.sourceFormat}
            target={state.targetFormat}
            validTargets={CONVERSION_MATRIX[state.sourceFormat]}
            onTargetChange={(format) => updateReady({ targetFormat: format, result: null, conversionError: null })}
            onConvert={handleConvert}
            converting={state.converting}
            canConvert={state.targetFormat !== null}
          />

          {state.conversionError && <ErrorBanner error={state.conversionError} />}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Original</h3>
              <OriginalPreview data={state.data} rawContent={state.rawContent} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Converted</h3>
              {state.result ? (
                <ConvertedPreview
                  result={state.result}
                  content={state.editedContent}
                  onContentChange={(value) => updateReady({ editedContent: value })}
                />
              ) : (
                <div className="flex h-96 items-center justify-center rounded-lg border border-dashed border-border text-sm text-secondary">
                  {state.targetFormat ? "Nothing to preview yet." : "Choose an output format."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
