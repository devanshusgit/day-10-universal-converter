import { DetectedFormat } from "@/types/converter";
import { extensionToFormat, getExtension } from "@/lib/format";
import { looksLikeCsv } from "@/lib/csv";
import { looksLikeMarkdown } from "@/lib/text";

/**
 * Detects the likely format of a file's content, independent of its extension.
 * Extension is never trusted alone — content is inspected via cheap, deterministic heuristics.
 */
export function detectFormat(filename: string, content: string): DetectedFormat {
  const extensionFormat = extensionToFormat(getExtension(filename));

  let contentFormat: DetectedFormat["contentFormat"];
  let confidence: DetectedFormat["confidence"];

  const trimmed = content.trim();

  if (trimmed !== "" && (trimmed.startsWith("{") || trimmed.startsWith("["))) {
    try {
      JSON.parse(trimmed);
      contentFormat = "json";
      confidence = "certain";
    } catch {
      contentFormat = looksLikeCsv(content) ? "csv" : looksLikeMarkdown(content) ? "markdown" : "txt";
      confidence = "likely";
    }
  } else if (looksLikeCsv(content)) {
    contentFormat = "csv";
    confidence = "likely";
  } else if (looksLikeMarkdown(content)) {
    contentFormat = "markdown";
    confidence = "likely";
  } else {
    contentFormat = "txt";
    confidence = "certain";
  }

  return {
    extensionFormat,
    contentFormat,
    confidence,
    mismatch: extensionFormat !== null && extensionFormat !== contentFormat,
  };
}
