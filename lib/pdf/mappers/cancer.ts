import type { PdfFormHelpers } from "../formHelpers";

export type CancerPdfPayload = {
  PatientName?: string;
  DOB?: string;
  Age?: string;
  HN?: string;
  VN?: string;
  VisitDate?: string;
  Gender?: string;
  Allergies?: string;
  // Header
  diagnosis?: string;
  painScale?: string;
  underlyingDisease?: string;
  currentTreatment?: string[]; // ["None","Chemotherapy",...]
  currentOther?: string;
  pastTreatment?: string[];
  pastOther?: string;
  assessmentMode?: string; // "initial" | "reassessment"
  // Assessor
  physiotherapist?: string;
  assessDate?: string;
  assessTime?: string;
  // ROM
  romHeadNeckRight?: string;
  romHeadNeckLeft?: string;
  romHeadNeckRemark?: string;
  romUpperRight?: string;
  romUpperLeft?: string;
  romUpperRemark?: string;
  romLowerRight?: string;
  romLowerLeft?: string;
  romLowerRemark?: string;
  // Circumference
  circUpperRightPosition?: string;
  circUpperRightCm?: string;
  circUpperLeftPosition?: string;
  circUpperLeftCm?: string;
  circUpperRemark?: string;
  circLowerRightPosition?: string;
  circLowerRightCm?: string;
  circLowerLeftPosition?: string;
  circLowerLeftCm?: string;
  circLowerRemark?: string;
  // Functional
  handgripResult?: string;
  handgripLevel?: string;
  handgripRemark?: string;
  reachResult?: string;
  reachLevel?: string;
  reachRemark?: string;
  tugResult?: string;
  tugLevel?: string;
  tugRemark?: string;
  // Other
  otherProblems?: string;
  suggestion?: string;
};

const CURRENT_TX_MAP: Record<string, string> = {
  None: "None",
  Chemotherapy: "Chemotherapy",
  Radiotherapy: "Radiotherapy",
  "Hormone therapy": "Hormone therapy",
};

const PAST_TX_MAP: Record<string, string> = {
  None: "None_2",
  Chemotherapy: "Chemotherapy_2",
  Radiotherapy: "Radiotherapy_2",
  "Hormone therapy": "Hormone therapy_2",
};

export function fillCancerPdf(h: PdfFormHelpers, raw: unknown) {
  const data = raw as CancerPdfPayload;

  // ─── Patient info ─────────────────────────────────────────────────────────
  h.setText("patient name", data.PatientName ?? "");
  h.setText("DOB", data.DOB ?? "");
  h.setText("age", data.Age ?? "");
  h.setText("HN", data.HN ?? "");
  h.setText("VN", data.VN ?? "");
  h.setText("visit date", data.VisitDate ?? "");
  h.setText("gender", data.Gender ?? "");
  h.setText("allergies", data.Allergies ?? "");

  // ─── Header ───────────────────────────────────────────────────────────────
  h.setText("Diagnosis", data.diagnosis ?? "");
  h.setText("Pain scale", data.painScale ?? "");
  h.setText("UnderlyingDisease", data.underlyingDisease ?? "");

  // Current treatment checkboxes
  const currentTx = data.currentTreatment ?? [];
  for (const [label, field] of Object.entries(CURRENT_TX_MAP)) {
    h.setCheck(field, currentTx.includes(label));
  }
  const hasCurrentOther =
    currentTx.some((t) => !Object.keys(CURRENT_TX_MAP).includes(t)) ||
    !!(data.currentOther && data.currentOther.trim() !== "");
  h.setCheck("Other", hasCurrentOther);
  h.setText("other curent treatment", data.currentOther ?? "");

  // Past treatment checkboxes
  const pastTx = data.pastTreatment ?? [];
  for (const [label, field] of Object.entries(PAST_TX_MAP)) {
    h.setCheck(field, pastTx.includes(label));
  }
  const hasPastOther =
    pastTx.some((t) => !Object.keys(PAST_TX_MAP).includes(t)) ||
    !!(data.pastOther && data.pastOther.trim() !== "");
  h.setCheck("Other_2", hasPastOther);
  h.setText("other past treatment", data.pastOther ?? "");

  // Assessment mode
  h.setCheck("Initial Assessment", data.assessmentMode === "initial");
  h.setCheck("Reassessment", data.assessmentMode === "reassessment");

  // ─── Assessor ─────────────────────────────────────────────────────────────
  h.setText("Physiotherapists", data.physiotherapist ?? "");
  h.setText("Date", data.assessDate ?? "");
  h.setText("Time", data.assessTime ?? "");

  // ─── ROM ──────────────────────────────────────────────────────────────────
  h.setText("RightHead Neck", data.romHeadNeckRight ?? "");
  h.setText("LeftHead Neck", data.romHeadNeckLeft ?? "");
  h.setText("RemarkHead Neck", data.romHeadNeckRemark ?? "");
  h.setText("RightUpper Extremities ROM", data.romUpperRight ?? "");
  h.setText("LeftUpper Extremities", data.romUpperLeft ?? "");
  h.setText("RemarkUpper Extremities ROM", data.romUpperRemark ?? "");
  h.setText("RightLower Extremities", data.romLowerRight ?? "");
  h.setText("LeftLower Extremities", data.romLowerLeft ?? "");
  h.setText("RemarkLower Extremities ROM", data.romLowerRemark ?? "");

  // ─── Circumference ────────────────────────────────────────────────────────
  h.setText(
    "RightUpper Extremities circumference",
    data.circUpperRightPosition ?? "",
  );
  h.setText(
    "RightUpper Extremities circumference cm fill",
    data.circUpperRightCm ?? "",
  );
  h.setText(
    "LeftUpper Extremities circumference",
    data.circUpperLeftPosition ?? "",
  );
  h.setText(
    "LeftUpper Extremities circumference cm fill",
    data.circUpperLeftCm ?? "",
  );
  h.setText(
    "RemarkUpper Extremities circumference",
    data.circUpperRemark ?? "",
  );
  h.setText(
    "RightLower Extremities circumference",
    data.circLowerRightPosition ?? "",
  );
  h.setText(
    "RightLower Extremities circumference cm fill",
    data.circLowerRightCm ?? "",
  );
  h.setText(
    "LeftLower Extremities circumference",
    data.circLowerLeftPosition ?? "",
  );
  h.setText(
    "LeftLower Extremities circumference cm fill",
    data.circLowerLeftCm ?? "",
  );
  h.setText(
    "RemarkLower Extremities circumference",
    data.circLowerRemark ?? "",
  );

  // ─── Handgrip ─────────────────────────────────────────────────────────────
  h.setText("hand grip result", data.handgripResult ?? "");
  h.setCheck("Poor Fair", data.handgripLevel === "Poor, Fair");
  h.setCheck("Good", data.handgripLevel === "Good");
  h.setCheck(
    "Very good Excellent",
    data.handgripLevel === "Very good, Excellent",
  );
  h.setText("hand grip remark", data.handgripRemark ?? "");

  // ─── Reach test ───────────────────────────────────────────────────────────
  h.setText("reach test result", data.reachResult ?? "");
  h.setCheck(
    "Low risk of falling greater than 10 inches",
    data.reachLevel === "low",
  );
  h.setCheck("Moderate risk 710 inches", data.reachLevel === "moderate");
  h.setCheck(
    "High risk of falling 6 inches or below",
    data.reachLevel === "high",
  );
  h.setCheck("Unable to do", data.reachLevel === "unable");
  h.setText("reach test remark", data.reachRemark ?? "");

  // ─── TUG ──────────────────────────────────────────────────────────────────
  h.setText("time up and go test result", data.tugResult ?? "");
  h.setCheck("Normal  10 seconds", data.tugLevel === "normal");
  h.setCheck(
    "Low risk to moderate risk of falling 1120 seconds",
    data.tugLevel === "low",
  );
  h.setCheck("High risk of falling 20 seconds", data.tugLevel === "high");
  h.setCheck("Unable to walk", data.tugLevel === "unable");
  h.setText("time up remark", data.tugRemark ?? "");

  // ─── Other ────────────────────────────────────────────────────────────────
  h.setText("Other problems", data.otherProblems ?? "");
  h.setText("suggestion", data.suggestion ?? "");
}
