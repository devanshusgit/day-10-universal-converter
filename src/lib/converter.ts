import {
  CsvTable,
  ConversionError,
  ConversionResult,
  FileFormat,
  FileSummary,
  FORMAT_MIME,
  JsonKind,
} from "@/types/converter";
import { parseCsv, stringifyCsv } from "@/lib/csv";
import {
  cellValueToString,
  classifyJson,
  jsonArrayToCsvTable,
  jsonRecordCount,
  jsonTopLevelKeyCount,
  parseJsonSafe,
  prettyJson,
} from "@/lib/json";
import { keyValueToMarkdown, markdownToText, tableToMarkdown } from "@/lib/markdown";
import { textStats, textToMarkdown } from "@/lib/text";
import { replaceExtension } from "@/lib/format";

export type ParsedSource =
  | { format: "csv"; table: CsvTable }
  | { format: "json"; value: unknown; kind: JsonKind }
  | { format: "txt"; text: string }
  | { format: "markdown"; text: string };

export type ParseOutcome =
  | { ok: true; data: ParsedSource; warnings: string[] }
  | { ok: false; error: ConversionError };

export function parseSourceContent(format: FileFormat, content: string): ParseOutcome {
  if (content.trim() === "") {
    return { ok: false, error: { title: "Empty file", detail: "This file contains no convertible content." } };
  }

  if (format === "csv") {
    const { table, issues } = parseCsv(content);
    const fatal = issues.find((i) => i.type === "error");
    if (fatal) {
      return { ok: false, error: { title: "CSV parse issue", detail: fatal.message } };
    }
    return { ok: true, data: { format: "csv", table }, warnings: issues.map((i) => i.message) };
  }

  if (format === "json") {
    const parsed = parseJsonSafe(content);
    if (!parsed.ok) {
      return { ok: false, error: { title: "Invalid JSON", detail: parsed.message } };
    }
    return { ok: true, data: { format: "json", value: parsed.value, kind: classifyJson(parsed.value) }, warnings: [] };
  }

  if (format === "txt") {
    return { ok: true, data: { format: "txt", text: content }, warnings: [] };
  }

  return { ok: true, data: { format: "markdown", text: content }, warnings: [] };
}

export function buildFileSummary(filename: string, sizeBytes: number, data: ParsedSource): FileSummary {
  const base: FileSummary = { filename, sizeBytes, format: data.format, encoding: "UTF-8" };
  if (data.format === "csv") {
    return { ...base, csv: { rows: data.table.rowCount, columns: data.table.columnCount } };
  }
  if (data.format === "json") {
    return {
      ...base,
      json: {
        kind: data.kind,
        recordCount: jsonRecordCount(data.value),
        topLevelKeyCount: jsonTopLevelKeyCount(data.value),
      },
    };
  }
  return { ...base, text: textStats(data.text) };
}

function csvTableToTxt(table: CsvTable): string {
  const blocks = table.rows.map((row) =>
    table.headers.map((h) => `${h}: ${row[h] ?? ""}`).join("\n")
  );
  return blocks.join("\n\n---\n\n") + "\n";
}

function jsonToTxt(value: unknown, kind: JsonKind): string {
  if (kind === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return entries.map(([k, v]) => `${k}: ${cellValueToString(v)}`).join("\n") + "\n";
  }
  if (kind === "array-of-objects" || kind === "array") {
    const items = value as unknown[];
    const blocks = items.map((item, index) => {
      const header = `Record ${index + 1}`;
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const entries = Object.entries(item as Record<string, unknown>);
        const body = entries.map(([k, v]) => `${k}: ${cellValueToString(v)}`).join("\n");
        return `${header}\n${body}`;
      }
      return `${header}\n${cellValueToString(item)}`;
    });
    return blocks.join("\n\n") + "\n";
  }
  return `${cellValueToString(value)}\n`;
}

function jsonValueToCsvTable(value: unknown, kind: JsonKind): CsvTable {
  if (kind === "array-of-objects") {
    return jsonArrayToCsvTable(value as Record<string, unknown>[]);
  }
  if (kind === "object") {
    return jsonArrayToCsvTable([value as Record<string, unknown>]);
  }
  if (kind === "array") {
    const items = value as unknown[];
    return {
      headers: ["value"],
      rows: items.map((item) => ({ value: cellValueToString(item) })),
      rowCount: items.length,
      columnCount: 1,
    };
  }
  return { headers: ["value"], rows: [{ value: cellValueToString(value) }], rowCount: 1, columnCount: 1 };
}

function jsonToMarkdown(value: unknown, kind: JsonKind): string {
  if (kind === "array-of-objects") {
    const table = jsonArrayToCsvTable(value as Record<string, unknown>[]);
    return tableToMarkdown(table.headers, table.rows);
  }
  if (kind === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => [k, cellValueToString(v)] as [string, string]
    );
    return keyValueToMarkdown(entries);
  }
  return "```json\n" + prettyJson(value) + "\n```\n";
}

/** Converts already-parsed source data into the target format. Assumes the pairing is valid. */
export function convert(
  data: ParsedSource,
  targetFormat: FileFormat,
  filename: string
): ConversionResult | { error: ConversionError } {
  let content: string;

  if (data.format === "csv") {
    if (targetFormat === "json") content = prettyJson(data.table.rows);
    else if (targetFormat === "txt") content = csvTableToTxt(data.table);
    else if (targetFormat === "markdown") content = tableToMarkdown(data.table.headers, data.table.rows);
    else return { error: { title: "Unsupported conversion", detail: "This format cannot be converted to the selected target." } };
  } else if (data.format === "json") {
    if (targetFormat === "csv") content = stringifyCsv(jsonValueToCsvTable(data.value, data.kind));
    else if (targetFormat === "txt") content = jsonToTxt(data.value, data.kind);
    else if (targetFormat === "markdown") content = jsonToMarkdown(data.value, data.kind);
    else return { error: { title: "Unsupported conversion", detail: "This format cannot be converted to the selected target." } };
  } else if (data.format === "txt") {
    if (targetFormat === "markdown") content = textToMarkdown(data.text);
    else return { error: { title: "Unsupported conversion", detail: "This format cannot be converted to the selected target." } };
  } else {
    if (targetFormat === "txt") content = markdownToText(data.text);
    else return { error: { title: "Unsupported conversion", detail: "This format cannot be converted to the selected target." } };
  }

  return {
    sourceFormat: data.format,
    targetFormat,
    content,
    filename: replaceExtension(filename, targetFormat),
    mimeType: FORMAT_MIME[targetFormat],
  };
}
