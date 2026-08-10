export function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

export function tableToMarkdown(headers: string[], rows: Record<string, string>[]): string {
  if (headers.length === 0) return "";
  const headerLine = `| ${headers.map(escapeMarkdownCell).join(" | ")} |`;
  const dividerLine = `| ${headers.map(() => "---").join(" | ")} |`;
  const rowLines = rows.map(
    (row) => `| ${headers.map((h) => escapeMarkdownCell(row[h] ?? "")).join(" | ")} |`
  );
  return [headerLine, dividerLine, ...rowLines].join("\n") + "\n";
}

export function keyValueToMarkdown(entries: [string, string][]): string {
  return tableToMarkdown(["Key", "Value"], entries.map(([k, v]) => ({ Key: k, Value: v })));
}

function stripInlineMarkdown(line: string): string {
  let text = line;
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1 ($2)");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/(?<![*\w])\*([^*]+)\*(?!\w)/g, "$1");
  text = text.replace(/(?<![_\w])_([^_]+)_(?!\w)/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");
  return text;
}

/** Converts Markdown into readable plain text: strips syntax, keeps content and paragraph shape. */
export function markdownToText(content: string): string {
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const out: string[] = [];
  let inFence = false;

  for (const rawLine of lines) {
    if (/^\s*```/.test(rawLine)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      out.push(rawLine);
      continue;
    }
    if (/^\s*(---|\*\*\*|___)\s*$/.test(rawLine)) {
      out.push("");
      continue;
    }

    let line = rawLine;
    line = line.replace(/^#{1,6}\s+/, "");
    line = line.replace(/^>\s?/, "");
    line = line.replace(/^\s*[-*+]\s+/, "");
    line = line.replace(/^\s*\d+\.\s+/, "");
    line = stripInlineMarkdown(line);
    out.push(line);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
