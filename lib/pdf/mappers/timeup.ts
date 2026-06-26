import type { PdfFormHelpers } from "../formHelpers";

export type TimeupPdfPayload = {
  patientName?: string;
  dob?: string;
  age?: string;
  hn?: string;
  vn?: string;
  visitDate?: string;
  gender?: string;
  allergies?: string;
  date?: string;
  time?: string;
  phyiotherapistName?: string;
  timeresult?: string;
  assessmentType?: string;
  canWalk?: string; // "walk" | "no walk"
  timetest?: string; // "0-10" | "11-20" | "21-30"
  divice?: string; // "independent" | "walker" | "cane" | "crutches" | "two crutches"
  direction?: string; // "right" | "left"
  aids?: string; // "yes" | "no"
};

export function fillTimeupPdf(h: PdfFormHelpers, raw: unknown) {
  const data = raw as TimeupPdfPayload;

  // ─── Patient info ─────────────────────────────────────────────────────────
  h.setText("patient name", data.patientName ?? "");
  h.setText("DOB", data.dob ?? "");
  h.setText("age", data.age ?? "");
  h.setText("hn", data.hn ?? "");
  h.setText("vn", data.vn ?? "");
  h.setText("visit date", data.visitDate ?? "");
  h.setText("gender", data.gender ?? "");
  h.setText("allergies", data.allergies ?? "");
  h.setText("date", data.date ?? "");
  h.setText("time", data.time ?? "");
  h.setText("Physiotherapist", data.phyiotherapistName ?? "");
  h.setText("result seconds", data.timeresult ?? "");

  // ─── Assessment type (Checkbox) ───────────────────────────────────────────
  h.setCheck("Preoperation", data.assessmentType === "pre");
  h.setCheck("Discharge", data.assessmentType === "discharge");
  h.setCheck("Follow up", data.assessmentType === "follow");

  // ─── Can walk (RadioGroup) ────────────────────────────────────────────────
  // แทนที่ส่วน can walk ใน fillTimeupPdf
  h.setCheck("can walk", data.canWalk === "walk");
  h.setCheck("can not walk", data.canWalk === "no walk");

  // ─── Time result (Checkbox) ───────────────────────────────────────────────
  h.setCheck("less than 10", data.timetest === "0-10");
  h.setCheck("10-20 sec", data.timetest === "11-20");
  h.setCheck("more than 20 sec", data.timetest === "21-30");

  // ─── Device (Checkbox) ────────────────────────────────────────────────────
  h.setCheck("Independent", data.divice === "independent");
  h.setCheck("Walker", data.divice === "walker");
  h.setCheck("Cane", data.divice === "cane");
  h.setCheck("One crutch", data.divice === "One crutch");
  h.setCheck("Two crutches", data.divice === "Two crutches");

  // ─── Return direction (Checkbox) ──────────────────────────────────────────
  h.setCheck("R", data.direction === "right");
  h.setCheck("Left", data.direction === "left");

  // ─── Visual aids (RadioGroup) ─────────────────────────────────────────────
  //   if (data.aids != null) {
  //     h.setCheck(
  //       "Others visual aids or glasses",
  //       data.aids === "yes" ? "yes" : "no",
  //     );
  //   }
  h.setCheck("yes", data.aids === "yes");
  h.setCheck("no", data.aids === "no");
}
