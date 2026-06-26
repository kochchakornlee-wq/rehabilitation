import type { PdfFormHelpers } from "../formHelpers";

type BarthelSession = {
  feeding?: string | null;
  transfers?: string | null;
  grooming?: string | null;
  toilet_use?: string | null;
  bathing?: string | null;
  mobility?: string | null;
  stairs?: string | null;
  dressing?: string | null;
  bowels?: string | null;
  bladder?: string | null;
  total_score?: number | null;
  assessed_at?: string | null;
};

export type BarthelPdfPayload = {
  PatientName?: string;
  DOB?: string;
  Age?: string;
  HN?: string;
  VN?: string;
  VisitDate?: string;
  Gender?: string;
  Allergies?: string;
  sessions?: BarthelSession[];
};

/** parse ตัวเลขจาก "คำอธิบาย (10)" → "10" */
const parseScore = (val: string | null | undefined): string => {
  if (!val) return "";
  const match = val.match(/\((\d+)\)/);
  return match ? match[1] : "";
};

const ITEMS: { key: keyof BarthelSession; field: string }[] = [
  { key: "feeding", field: "feeding" },
  { key: "transfers", field: "tranfers" }, // ← typo ใน PDF
  { key: "grooming", field: "grooming" },
  { key: "toilet_use", field: "toilet" },
  { key: "bathing", field: "bathing" },
  { key: "mobility", field: "mobility" },
  { key: "stairs", field: "stairs" },
  { key: "dressing", field: "dressing" },
  { key: "bowels", field: "bowels" },
  { key: "bladder", field: "bladder" },
];

export function fillBarthelPdf(h: PdfFormHelpers, raw: unknown) {
  const data = raw as BarthelPdfPayload;

  // ─── Patient info ─────────────────────────────────────────────────────────
  h.setText("patient name", data.PatientName ?? "");
  h.setText("DOB", data.DOB ?? "");
  h.setText("age", data.Age ?? "");
  h.setText("hn", data.HN ?? "");
  h.setText("vn", data.VN ?? "");
  h.setText("visit date", data.VisitDate ?? "");
  h.setText("gender", data.Gender ?? "");
  h.setText("allergies", data.Allergies ?? "");

  // ─── Sessions (สูงสุด 4) ──────────────────────────────────────────────────
  const sessions = data.sessions ?? [];
  const MAX = 4;

  for (let i = 0; i < MAX; i++) {
    const n = i + 1; // column number 1-4
    const s = sessions[i] ?? null;

    // วันที่ใส่ใน barthel field
    h.setText(`barthel ${n}`, s?.assessed_at ?? "");

    // score แต่ละ item
    for (const { key, field } of ITEMS) {
      const raw = s ? (s[key] as string | null) : null;
      h.setText(`${field} ${n}`, parseScore(raw));
    }

    // total
    h.setText(
      `total ${n}`,
      s?.total_score != null ? String(s.total_score) : "",
    );
  }
}
