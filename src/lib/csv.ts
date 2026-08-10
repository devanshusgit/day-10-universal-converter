import Papa from "papaparse";
import { CsvParseIssue, CsvParseResult, CsvTable } from "@/types/converter";

/** Parses CSV text into a normalized table. Values are kept as strings by design. */
export function parseCsv(content: string): CsvParseResult {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const seenMessages = new Set<string>();
  const issues: CsvParseIssue[] = [];
  let fatal = false;

  function addIssue(issue: CsvParseIssue) {
    if (seenMessages.has(issue.message)) return;
    seenMessages.add(issue.message);
    issues.push(issue);
  }

  for (const error of result.errors) {
    if (error.type === "FieldMismatch") {
      addIssue({ type: "warning", message: "Some rows contain a different number of fields." });
    } else if (error.type === "Quotes") {
      addIssue({ type: "warning", message: "Some quoted fields were unusual and best-effort parsed." });
    } else if (error.type === "Delimiter") {
      fatal = true;
      addIssue({ type: "error", message: "Could not detect a consistent delimiter in this file." });
    } else {
      addIssue({ type: "warning", message: error.message });
    }
  }

  const headers = result.meta.fields ?? [];
  const rows = result.data
    .filter((row) => Object.values(row).some((v) => v !== undefined && v !== ""))
    .map((row) => {
      // Papa Parse stashes extra columns beyond the header row under this key; keep
      // the table honest to its declared headers rather than leaking an untitled field.
      if (!("__parsed_extra" in row)) return row;
      const clone: Record<string, string> = { ...row };
      delete clone.__parsed_extra;
      return clone;
    });

  if (headers.length === 0 || rows.length === 0) {
    fatal = fatal || headers.length === 0;
  }

  const table: CsvTable = {
    headers,
    rows,
    rowCount: rows.length,
    columnCount: headers.length,
  };

  if (fatal) {
    issues.unshift({ type: "error", message: "This file does not look like valid tabular CSV data." });
  }

  return { table, issues };
}

/** Serializes a normalized table back to CSV text, escaping as needed. */
export function stringifyCsv(table: CsvTable): string {
  return Papa.unparse(
    { fields: table.headers, data: table.rows.map((row) => table.headers.map((h) => row[h] ?? "")) },
    { newline: "\n" }
  );
}

/** Lightweight heuristic: does this text parse into a plausible table (2+ consistent columns)? */
export function looksLikeCsv(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  const sample = Papa.parse<string[]>(trimmed, { skipEmptyLines: true, preview: 20 });
  if (sample.data.length < 2) return false;
  const colCounts = sample.data.map((row) => row.length);
  const first = colCounts[0];
  if (first < 2) return false;
  const consistent = colCounts.filter((c) => c === first).length;
  return consistent / colCounts.length >= 0.8;
}
