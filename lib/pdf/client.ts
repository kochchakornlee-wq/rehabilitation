import type { PdfFormType } from "./constants";

export type FetchPdfPreviewResult =
  | { ok: true; pdf: string }
  | { ok: false; error: string };

export async function fetchPdfPreview(
  formType: PdfFormType,
  payload: unknown,
): Promise<FetchPdfPreviewResult> {
  try {
    const res = await fetch(`/api/pdf/${formType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await res.json()) as { pdf?: string; error?: string };

    if (!res.ok || !result.pdf) {
      return {
        ok: false,
        error: result.error ?? "ไม่สามารถสร้าง PDF preview ได้",
      };
    }

    return { ok: true, pdf: result.pdf };
  } catch {
    return { ok: false, error: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" };
  }
}
