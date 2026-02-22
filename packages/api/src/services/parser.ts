import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function parsePdf(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export function parseText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

const MIME_PARSERS: Record<string, (buffer: Buffer) => Promise<string> | string> = {
  "application/pdf": parsePdf,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": parseDocx,
  "text/plain": parseText,
};

export const SUPPORTED_MIMETYPES = Object.keys(MIME_PARSERS);

export async function parseFile(buffer: Buffer, mimetype: string): Promise<string> {
  const parser = MIME_PARSERS[mimetype];
  if (!parser) {
    throw new Error(`Unsupported file type: ${mimetype}`);
  }
  return parser(buffer);
}
