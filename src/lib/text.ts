export function textStats(content: string) {
  const characters = content.length;
  const lines = content === "" ? 0 : content.split(/\r\n|\r|\n/).length;
  const words = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
  return { characters, lines, words };
}

const HEADING_RE = /^(#{1,3})\s+(.*)$/;

/**
 * Conservative TXT -> Markdown: headings written as `#`/`##`/`###` pass through untouched.
 * Everything else keeps its paragraph grouping; line breaks inside a paragraph become
 * markdown hard breaks (trailing double space) instead of being invented as structure.
 */
export function textToMarkdown(content: string): string {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const paragraphs = normalized.split(/\n{2,}/);

  const blocks = paragraphs.map((paragraph) => {
    const lines = paragraph.split("\n");
    if (lines.length === 1 && HEADING_RE.test(lines[0])) {
      return lines[0];
    }
    return lines.map((line) => line.replace(/\s+$/, "")).join("  \n");
  });

  return blocks.join("\n\n").trim() + "\n";
}

/** Heuristic: does this text contain common Markdown syntax markers? */
export function looksLikeMarkdown(content: string): boolean {
  const patterns = [
    /^#{1,6}\s+\S/m,
    /\*\*[^*]+\*\*/,
    /^-\s+\S/m,
    /^\d+\.\s+\S/m,
    /\[[^\]]+\]\([^)]+\)/,
    /^>\s+\S/m,
    /^```/m,
  ];
  return patterns.some((re) => re.test(content));
}
