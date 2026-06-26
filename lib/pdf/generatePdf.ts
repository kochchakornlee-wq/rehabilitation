import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { finalizeFormAppearances } from "./appearance";
import { PDF_TEMPLATES_DIR } from "./constants";
import { createFormHelpers, type PdfFormHelpers } from "./formHelpers";

export type PdfFillFn = (helpers: PdfFormHelpers, data: unknown) => void;

export async function generateFilledPdf(
  templateFileName: string,
  fillFn: PdfFillFn,
  data: unknown,
): Promise<Uint8Array> {
  const templatePath = path.join(PDF_TEMPLATES_DIR, templateFileName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `ไม่พบไฟล์ PDF Template: public/templates/${templateFileName}`,
    );
  }

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();
  const helpers = createFormHelpers(form);

  fillFn(helpers, data);

  await finalizeFormAppearances(pdfDoc, form);
  form.flatten({ updateFieldAppearances: false });

  return pdfDoc.save();
}

export function pdfBytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}
