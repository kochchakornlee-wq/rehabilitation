import type { PdfFormHelpers } from "../formHelpers";

export type KoosPdfPayload = {
  lang?: "th" | "en";
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
  assessment_type?: string; // "before" | "after" | "follow_up_1m" | "follow_up_3m" | "follow_up_6m" | "follow_up_1y"
  // pain scores (label string เช่น "Mild (1)")
  p1?: string;
  p2?: string;
  p3?: string;
  p4?: string;
  p5?: string;
  p6?: string;
  p7?: string;
  p8?: string;
  p9?: string;
  pain_total?: number;
  pain_percent?: number;
  // act scores
  a1?: string;
  a2?: string;
  a3?: string;
  a4?: string;
  a5?: string;
  a6?: string;
  a7?: string;
  a8?: string;
  adl_total?: number;
  adl_percent?: number;
};

// ─── assessment_type → checkbox field name ───────────────────────────────────
const ASSESSMENT_TYPE_TH: Record<string, string> = {
  before: "ก่อนผ่าตัด", // TH ไม่มี checkbox ก่อนผ่าตัด ใน field list
  after: "after surgery",
  follow_up_1m: "after surgery 1 month",
  follow_up_3m: "after surgery 3 months",
  follow_up_6m: "after surgery 6 months",
  follow_up_1y: "after surgery 1 y",
};

const ASSESSMENT_TYPE_EN: Record<string, string> = {
  before: "before surgery",
  after: "behind surgery",
  follow_up_1m: "behind surgery 1 month",
  follow_up_3m: "behind surgery 3 month",
  follow_up_6m: "behind surgery 6 month",
  follow_up_1y: "behind surgery 1 year",
};

export function fillKoosPdf(h: PdfFormHelpers, raw: unknown) {
  const data = raw as KoosPdfPayload;
  const isEn = data.lang === "en";

  // ─── Patient info (field name เหมือนกันทั้ง TH/EN ยกเว้น visit date) ───────
  h.setText("patient name", data.PatientName ?? "");
  h.setText("DOB", data.DOB ?? "");
  h.setText(isEn ? "Age" : "age", data.Age ?? "");
  h.setText("hn", data.HN ?? "");
  h.setText("vn", data.VN ?? "");
  h.setText(isEn ? "visit date" : "visit", data.VisitDate ?? "");
  h.setText("gender", data.Gender ?? "");
  h.setText("allergies", data.Allergies ?? "");
  h.setText("physiotherapist", data.assessor_name ?? "");
  h.setText(isEn ? "Date" : "date", data.assessor_date ?? "");
  h.setText("time", data.assessor_time ?? "");

  // ─── Assessment type checkbox ─────────────────────────────────────────────
  const typeMap = isEn ? ASSESSMENT_TYPE_EN : ASSESSMENT_TYPE_TH;
  const assessType = data.assessment_type ?? "";
  for (const [key, fieldName] of Object.entries(typeMap)) {
    h.setCheck(fieldName, assessType === key);
  }

  if (isEn) {
    // ─── EN: field name = "Date  P1 How often is your knee painful" ──────────
    h.setText("P date", data.assessor_date ?? "");
    h.setText("A date", data.assessor_date ?? "");
    h.setText("Date  P1 How often is your knee painful", data.p1 ?? "");
    h.setText("Date  P2 Twistingpivoting on your knee", data.p2 ?? "");
    h.setText("Date  P3 Straightening knee fully", data.p3 ?? "");
    h.setText("Date  P4 Bending knee fully", data.p4 ?? "");
    h.setText("Date  P5 Walking on flat surface", data.p5 ?? "");
    h.setText("Date  P6 Going up or down stairs", data.p6 ?? "");
    h.setText("Date  P7 At night while in bed", data.p7 ?? "");
    h.setText("Date  P8 Sitting or lying", data.p8 ?? "");
    h.setText("Date  P9 Standing upright", data.p9 ?? "");
    h.setText("P_Total score", data.pain_total?.toString() ?? "");
    h.setText("P percentage", data.pain_percent?.toString() ?? "");

    h.setText("Date  A1 Descending", data.a1 ?? "");
    h.setText("Date  A2 Ascending stairs", data.a2 ?? "");
    h.setText("Date  A3 Rising from sitting", data.a3 ?? "");
    h.setText("Date  A4 Standing", data.a4 ?? "");
    h.setText("Date  A5 Bending to floorpicking up an object", data.a5 ?? "");
    h.setText("Date  A6 Walking on flat surface", data.a6 ?? "");
    h.setText("Date  A7 Getting inout of car", data.a7 ?? "");
    h.setText("Date  A8 Going shopping", data.a8 ?? "");
    h.setText("A_ Total score_2", data.adl_total?.toString() ?? "");
    h.setText("A_percen", data.adl_percent?.toString() ?? "");
  } else {
    // ─── TH: field name = p1, p2, ... a1, a2, ... ───────────────────────────
    h.setText("p_date", data.assessor_date ?? "");
    h.setText("A_date", data.assessor_date ?? "");
    h.setText("P1", data.p1 ?? "");
    h.setText("p2", data.p2 ?? "");
    h.setText("p3", data.p3 ?? "");
    h.setText("p4", data.p4 ?? "");
    h.setText("p5", data.p5 ?? "");
    h.setText("p6", data.p6 ?? "");
    h.setText("p7", data.p7 ?? "");
    h.setText("p8", data.p8 ?? "");
    h.setText("p9", data.p9 ?? "");
    h.setText("p total", data.pain_total?.toString() ?? "");
    h.setText("p percentage", data.pain_percent?.toString() ?? "");

    h.setText("a1", data.a1 ?? "");
    h.setText("a2", data.a2 ?? "");
    h.setText("a3", data.a3 ?? "");
    h.setText("a4", data.a4 ?? "");
    h.setText("a5", data.a5 ?? "");
    h.setText("a6", data.a6 ?? "");
    h.setText("a7", data.a7 ?? "");
    h.setText("a8", data.a8 ?? "");
    h.setText("a total", data.adl_total?.toString() ?? "");
    h.setText("a percentage", data.adl_percent?.toString() ?? "");
  }
}
