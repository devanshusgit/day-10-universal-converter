import { FileFormat, FORMAT_EXTENSION } from "@/types/converter";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

export function getExtension(filename: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(filename);
  return match ? match[1].toLowerCase() : "";
}

export function extensionToFormat(extension: string): FileFormat | null {
  switch (extension) {
    case "csv":
      return "csv";
    case "json":
      return "json";
    case "txt":
      return "txt";
    case "md":
    case "markdown":
      return "markdown";
    default:
      return null;
  }
}

export function replaceExtension(filename: string, targetFormat: FileFormat): string {
  const targetExt = FORMAT_EXTENSION[targetFormat];
  const currentExt = getExtension(filename);
  const base = currentExt ? filename.slice(0, -(currentExt.length + 1)) : filename;
  return `${base || "converted"}.${targetExt}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}
