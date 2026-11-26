/**
 * SyllabusParser — server-side PDF text extract (Q-002 APPROVED).
 * RULE: import only from Route Handlers / server modules — never client.
 *
 * pdf-parse must stay out of the webpack graph (see next.config serverExternalPackages)
 * and is loaded via dynamic import so Next never evaluates the broken ESM interop path.
 */

export type SyllabusParseResult = {
  ok: true;
  text: string;
  pages: number;
  /** First non-empty lines — proto form prefill hints. */
  previewLines: string[];
};

export type SyllabusParseError = {
  ok: false;
  code:
    | "invalid"
    | "toolarge"
    | "encrypted"
    | "scanned"
    | "timeout"
    | "error";
  message: string;
};

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Parse a PDF buffer with pdf-parse. Call from server only.
 */
export async function parseSyllabusPdf(
  buffer: Buffer,
): Promise<SyllabusParseResult | SyllabusParseError> {
  if (buffer.byteLength === 0) {
    return { ok: false, code: "invalid", message: "Empty file." };
  }
  if (buffer.byteLength > MAX_BYTES) {
    return { ok: false, code: "toolarge", message: "PDF exceeds 10 MB." };
  }

  try {
    /* Worker must load first — polyfills DOMMatrix via @napi-rs/canvas (Vercel Node). */
    const { CanvasFactory } = await import("pdf-parse/worker");
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer, CanvasFactory });
    const result = await parser.getText();
    await parser.destroy();

    const text = (result.text ?? "").trim();
    if (!text) {
      return {
        ok: false,
        code: "scanned",
        message: "No extractable text (scanned PDF?).",
      };
    }

    const previewLines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 12);

    return {
      ok: true,
      text,
      pages: result.total ?? previewLines.length,
      previewLines,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/password|encrypt/i.test(msg)) {
      return { ok: false, code: "encrypted", message: msg };
    }
    return { ok: false, code: "error", message: msg };
  }
}
