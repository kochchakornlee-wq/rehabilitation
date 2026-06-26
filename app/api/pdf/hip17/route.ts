import { NextRequest, NextResponse } from "next/server";
import { generateFilledPdf, pdfBytesToBase64 } from "@/lib/pdf/generatePdf";
import { fillHipPdf } from "@/lib/pdf/mappers/hip";
import { PDF_TEMPLATE_FILES } from "@/lib/pdf/constants";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const templateFile =
      data.lang === "en"
        ? PDF_TEMPLATE_FILES.hip_en
        : PDF_TEMPLATE_FILES.hip_th;

    const pdfBytes = await generateFilledPdf(templateFile, fillHipPdf, data);
    return NextResponse.json({ pdf: pdfBytesToBase64(pdfBytes) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
    console.error("[pdf/hip17]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
