import type { PdfFormHelpers } from "../formHelpers";

export type RankinPdfPayload = {
  PatientName?: string;
  DOB?: string;
  Age?: string;
  HN?: string;
  VN?: string;
  VisitDate?: string;
  Gender?: string;
  Allergies?: string;
  assessor_name?: string;
  assessor_date?: string;
  assessor_time?: string;
  admission_score?: number | null;
  admission_date?: string;
  dc_score?: number | null;
  dc_date?: string;
  fu_score?: number | null;
  fu_date?: string;
};

const SCORES = [0, 1, 2, 3, 4, 5, 6];

export function fillRankinPdf(h: PdfFormHelpers, raw: unknown) {
  const data = raw as RankinPdfPayload;

  // ─── Patient info ─────────────────────────────────────────────────────────
  h.setText("patient name", data.PatientName ?? "");
  h.setText("DOB", data.DOB ?? "");
  h.setText("age", data.Age ?? "");
  h.setText("HN", data.HN ?? "");
  h.setText("vn", data.VN ?? "");
  h.setText("visit date", data.VisitDate ?? "");
  h.setText("gender", data.Gender ?? "");
  h.setText("Allergies", data.Allergies ?? "");

  // ─── Assessor ─────────────────────────────────────────────────────────────
  h.setText("Assessor", data.assessor_name ?? "");
  h.setText("date", data.assessor_date ?? "");
  h.setText("time", data.assessor_time ?? "");

  // ─── Visit dates ──────────────────────────────────────────────────────────
  h.setText("admit date", data.admission_date ?? "");
  h.setText("D/C date", data.dc_date ?? "");
  h.setText("F/U date", data.fu_date ?? "");

  // ─── Admission score ──────────────────────────────────────────────────────
  const admitScore = data.admission_score ?? null;
  SCORES.forEach((s) => {
    h.setCheck(`admit ${s}`, admitScore === s); // ← Checkbox
  });
  h.setText("admit total", admitScore != null ? String(admitScore) : "");

  // ─── D/C score ────────────────────────────────────────────────────────────
  const dcScore = data.dc_score ?? null;
  SCORES.forEach((s) => {
    h.setCheck(`D/C ${s}`, dcScore === s); // ← Checkbox
  });
  h.setText("D/C  total", dcScore != null ? String(dcScore) : "");

  // ─── F/U score ────────────────────────────────────────────────────────────
  const fuScore = data.fu_score ?? null;
  SCORES.forEach((s) => {
    h.setCheck(`F/U ${s}`, fuScore === s); // ← Checkbox
  });
  h.setText("F/U total", fuScore != null ? String(fuScore) : "");
}
