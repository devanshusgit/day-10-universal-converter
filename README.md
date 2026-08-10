# Universal Converter

Drop a CSV, JSON, TXT, or Markdown file, instantly understand its structure, convert it into
another compatible format, preview the result, and download it — all inside your browser.

Files are processed locally in the browser and are not uploaded to a conversion server.

## Supported formats

- CSV (`.csv`)
- JSON (`.json`)
- TXT (`.txt`)
- Markdown (`.md`, `.markdown`)

## Conversion matrix

| Source | Valid targets |
| --- | --- |
| CSV | JSON, TXT, Markdown |
| JSON | CSV, TXT, Markdown |
| TXT | Markdown |
| Markdown | TXT |

Same-format and semantically-misleading conversions (e.g. Markdown → JSON) are intentionally
not offered.

## Features

- Drag-and-drop or click-to-browse file input, keyboard accessible
- Content-based format detection with a mismatch warning when a file's extension disagrees
  with what its content actually looks like (and the ability to pick either interpretation)
- Table preview for tabular data (CSV, array-of-objects JSON) with a raw/code view toggle
- Editable output before download or copy
- Copy to clipboard and download as a correctly-named/extensioned file
- Clear, non-technical error states for invalid JSON, malformed CSV, empty files, and
  unsupported conversions

## How local processing works

Everything — reading the file, detecting its format, parsing, and converting — runs in the
browser using the File API, `Blob`, and `URL.createObjectURL`. No API route, server function,
or third-party service ever sees file contents. There is no backend, no database, and no
authentication in this project.

## Privacy

Your files never leave this device. Dropping or selecting a file produces zero network
requests carrying file content — verified by inspecting network traffic during conversion.

## Format detection

Detection considers both the file extension and the actual content:

- Content starting with `{` or `[` is tested with `JSON.parse`.
- Remaining content is tested against a lightweight CSV heuristic (consistent column counts
  across sampled rows) and a Markdown heuristic (headings, emphasis, lists, links, etc.).
- Anything else falls back to plain text.

If the extension and the detected content format disagree, a **FORMAT MISMATCH** notice lets
you choose which interpretation to parse with.

## CSV behavior

CSV parsing and serialization use [PapaParse](https://www.papaparse.com/), so quoted fields,
commas inside quotes, escaped quotes, empty values, CRLF/LF line endings, and Unicode are all
handled correctly rather than via a naive `split(",")`.

- Values are kept as strings — no automatic type inference (numbers, booleans, etc.).
- The first row is used as the header row.
- Rows with a different field count than the header produce a warning, not a crash; the
  table stays honest to its declared headers rather than leaking an untitled column of data
  Papa Parse couldn't map to a header.

## JSON nested-value behavior

When converting JSON to a tabular format (CSV, or a Markdown table):

- Arrays of flat objects have their keys **unioned** across all records — a key missing from
  one record just leaves that cell blank, it never crashes or drops rows.
- Nested objects/arrays are serialized as compact, properly CSV-escaped JSON strings inside
  the cell (e.g. `{"tags":["a","b"]}` becomes a cell containing `["a","b"]`) rather than
  silently collapsing to `[object Object]`.

## Markdown/TXT limitations

Conversions between TXT and Markdown are intentionally conservative and do not use AI:

- **TXT → Markdown**: lines already written as `#`, `##`, or `###` headings are kept as
  headings; everything else keeps its paragraph grouping, with line breaks inside a paragraph
  preserved as Markdown hard breaks. No headings, bullets, or structure are invented.
- **Markdown → TXT**: headings, bold/italic, inline code, fenced code blocks, blockquotes,
  lists, and links are stripped to readable plain text (links become `text (url)`), using
  lightweight regex-based parsing rather than a full Markdown rendering engine.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4
- [PapaParse](https://www.papaparse.com/) for CSV parsing/serialization
- [Lucide](https://lucide.dev/) icons
- [Framer Motion](https://www.framer.com/motion/) for the transform-control micro-interaction
- Browser-native File API, Blob, `URL.createObjectURL`, and Clipboard API — no backend

## Installation

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Deployment

Deployed on [Vercel](https://vercel.com/). No environment variables are required — there is
no backend to configure.

- **Live demo:** _(added after deployment)_
- **GitHub:** _(added after push)_

## Known limitations

- Files larger than 10 MB are rejected with a clear message rather than attempted, to keep
  in-browser conversion reliable.
- Original and converted previews cap at 50 rows (tables) or ~20,000 characters (text) for
  render performance — the exported/downloaded file always contains the complete data, not
  just what's previewed.
- Markdown rendering in the preview is intentionally source/text-only, not an HTML renderer,
  to avoid any risk of executing untrusted Markdown/HTML content.
- Batch conversion, multi-file upload, PDF/DOCX/XLSX/media formats, and AI-assisted format
  understanding are out of scope by design.
