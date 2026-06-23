import { NextRequest, NextResponse } from "next/server";
import { generateFilledPdf, pdfBytesToBase64 } from "@/lib/pdf/generatePdf";
import { fillKoosPdf } from "@/lib/pdf/mappers/koos";
import { PDF_TEMPLATE_FILES } from "@/lib/pdf/constants";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const templateFile =
      data.lang === "en"
        ? PDF_TEMPLATE_FILES.koos_en
        : PDF_TEMPLATE_FILES.koos_th;
    const pdfBytes = await generateFilledPdf(templateFile, fillKoosPdf, data);
    return NextResponse.json({ pdf: pdfBytesToBase64(pdfBytes) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
    console.error("[pdf/koos]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
