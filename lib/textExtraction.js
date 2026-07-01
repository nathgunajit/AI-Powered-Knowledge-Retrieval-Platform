import fs from "fs/promises";
import path from "path";

export async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt") {
    return fs.readFile(filePath, "utf-8");
  }

  if (ext === ".pdf") {
    const { PDFParse } = await import("pdf-parse");
    const buffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }

  if (ext === ".docx") {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error(`Unsupported file extension for text extraction: ${ext}`);
}
