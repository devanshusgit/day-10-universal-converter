export type FileFormat = "csv" | "json" | "txt" | "markdown";

export const FORMAT_LABEL: Record<FileFormat, string> = {
  csv: "CSV",
  json: "JSON",
  txt: "TXT",
  markdown: "Markdown",
};

export const FORMAT_EXTENSION: Record<FileFormat, string> = {
  csv: "csv",
  json: "json",
  txt: "txt",
  markdown: "md",
};

export const FORMAT_MIME: Record<FileFormat, string> = {
  csv: "text/csv",
  json: "application/json",
  txt: "text/plain",
  markdown: "text/markdown",
};

/** Valid target formats for each source format. Same-format conversions are intentionally excluded. */
export const CONVERSION_MATRIX: Record<FileFormat, FileFormat[]> = {
  csv: ["json", "txt", "markdown"],
  json: ["csv", "txt", "markdown"],
  txt: ["markdown"],
  markdown: ["txt"],
};

export type CsvTable = {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  columnCount: number;
};

export type CsvParseIssue = {
  type: "error" | "warning";
  message: string;
};

export type CsvParseResult = {
  table: CsvTable;
  issues: CsvParseIssue[];
};

export type JsonKind = "array-of-objects" | "object" | "array" | "primitive";

export type JsonParseResult = {
  value: unknown;
  kind: JsonKind;
  recordCount: number | null;
  topLevelKeyCount: number | null;
};

export type DetectedFormat = {
  extensionFormat: FileFormat | null;
  contentFormat: FileFormat;
  confidence: "certain" | "likely";
  mismatch: boolean;
};

export type FileSummary = {
  filename: string;
  sizeBytes: number;
  format: FileFormat;
  encoding: string;
  csv?: { rows: number; columns: number };
  json?: { kind: JsonKind; recordCount: number | null; topLevelKeyCount: number | null };
  text?: { characters: number; lines: number; words: number };
};

export type ConversionResult = {
  sourceFormat: FileFormat;
  targetFormat: FileFormat;
  content: string;
  filename: string;
  mimeType: string;
};

export type ConversionError = {
  title: string;
  detail: string;
};
