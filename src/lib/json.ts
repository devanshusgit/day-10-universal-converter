import { CsvTable, JsonKind } from "@/types/converter";

export type JsonParseOutcome =
  | { ok: true; value: unknown }
  | { ok: false; message: string };

/** Parses JSON text, translating native errors into a line/column-aware message. */
export function parseJsonSafe(content: string): JsonParseOutcome {
  try {
    return { ok: true, value: JSON.parse(content) };
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Invalid JSON";
    const positionMatch = /position (\d+)/.exec(raw);
    if (positionMatch) {
      const position = Number(positionMatch[1]);
      const upToError = content.slice(0, position);
      const line = upToError.split("\n").length;
      const column = position - upToError.lastIndexOf("\n");
      return { ok: false, message: `Unexpected token near line ${line}, column ${column}.` };
    }
    return { ok: false, message: raw };
  }
}

export function classifyJson(value: unknown): JsonKind {
  if (Array.isArray(value)) {
    const allFlatObjects = value.every(
      (item) => typeof item === "object" && item !== null && !Array.isArray(item)
    );
    return value.length > 0 && allFlatObjects ? "array-of-objects" : "array";
  }
  if (typeof value === "object" && value !== null) return "object";
  return "primitive";
}

export function jsonRecordCount(value: unknown): number | null {
  if (Array.isArray(value)) return value.length;
  return null;
}

export function jsonTopLevelKeyCount(value: unknown): number | null {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return Object.keys(value).length;
  }
  return null;
}

/** Stringifies a cell value for CSV/table export. Objects/arrays become compact JSON strings. */
export function cellValueToString(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

/** Converts an array of flat objects into a normalized table, union-ing keys across all rows. */
export function jsonArrayToCsvTable(records: Record<string, unknown>[]): CsvTable {
  const headerSet = new Set<string>();
  for (const record of records) {
    for (const key of Object.keys(record)) headerSet.add(key);
  }
  const headers = Array.from(headerSet);
  const rows = records.map((record) => {
    const row: Record<string, string> = {};
    for (const header of headers) {
      row[header] = cellValueToString(record[header]);
    }
    return row;
  });
  return { headers, rows, rowCount: rows.length, columnCount: headers.length };
}

export function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
