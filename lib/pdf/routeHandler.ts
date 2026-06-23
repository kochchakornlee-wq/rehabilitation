import { NextRequest, NextResponse } from "next/server";
import { PDF_TEMPLATE_FILES, type PdfFormType } from "@/lib/pdf/constants";
import { generateFilledPdf, pdfBytesToBase64 } from "@/lib/pdf/generatePdf";
import { fillOpdPdf } from "@/lib/pdf/mappers/opd";
import { fillIpdPdf } from "@/lib/pdf/mappers/ipd";
import { fillDischargePdf } from "@/lib/pdf/mappers/discharge";
import type { PdfFormHelpers } from "@/lib/pdf/formHelpers";
import { fillHipPdf } from "@/lib/pdf/mappers/hip";
import { fillKoosPdf } from "@/lib/pdf/mappers/koos";
import { fillRankinPdf } from "@/lib/pdf/mappers/Rankin";
import { fillBarthelPdf } from "@/lib/pdf/mappers/barthel";
import { fillTimeupPdf } from "./mappers/timeup";
import { fillCancerPdf } from "./mappers/cancer";

const FILLERS: Record<PdfFormType, (h: PdfFormHelpers, data: unknown) => void> =
  {
    opd: fillOpdPdf,
    ipd: fillIpdPdf,
    discharge: fillDischargePdf,
    hip_th: fillHipPdf,
    hip_en: fillHipPdf,
    hip17: fillHipPdf,
    koos_th: fillKoosPdf,
    koos_en: fillKoosPdf,
    koos: fillKoosPdf,
    rankin: fillRankinPdf,
    barthel: fillBarthelPdf,
    timeup: fillTimeupPdf,
    cancer: fillCancerPdf, // ← แก้ชั่วคราว รอทำฟอร์ม cancer จริงๆ
  };

export function createPdfPreviewHandler(formType: PdfFormType) {
  return async function POST(req: NextRequest) {
    try {
      const data = await req.json();
      const templateFile = PDF_TEMPLATE_FILES[formType];
      const fillFn = FILLERS[formType];

      const pdfBytes = await generateFilledPdf(templateFile, fillFn, data);
      const base64 = pdfBytesToBase64(pdfBytes);

      return NextResponse.json({ pdf: base64 });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้าง PDF";
      console.error(`[pdf/${formType}]`, err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
