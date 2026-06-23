import type { PdfFormHelpers } from "../formHelpers";
import {
  fillClinicalForm,
  normalizeTreatmentItems,
  type SharedClinicalPayload,
} from "./shared";

export type OpdPdfPayload = SharedClinicalPayload & {
  mode?: "before" | "after";
  suggest?: string;
  status?: string;
  therapist?: string;
  treatment_detail?: Record<string, unknown>;
};

function fillAfterSection(h: PdfFormHelpers, data: OpdPdfPayload) {
  if (data.mode !== "after") return;

  h.setText("afterdate", data.date ?? "");
  h.setText("aftertime", data.time ?? "");
  h.setText("after pain score", data.pain_score ?? "");
  h.setText("after duration", data.duration ?? "");
  h.setText("after location", data.pain_location ?? "");
  h.setText("suggest", data.suggest ?? "");
  h.setText("discharge status", data.status ?? "");
  h.setText("therapist", data.therapist ?? "");

  h.setCheck("Standard fall NO ABCS", data.fall_risk === "standard");
  h.setCheck("Strict fall ABC", data.fall_risk === "strict");
  h.setCheck("Highly Strict fallS", data.fall_risk === "highly");
}

export function fillOpdPdf(h: PdfFormHelpers, raw: unknown) {
  const data = raw as OpdPdfPayload;
  const payload: SharedClinicalPayload = {
    ...data,
    treatment_items: normalizeTreatmentItems(
      data.treatment_items ?? data.treatment_detail,
    ),
  };

  fillClinicalForm(h, payload);
  fillAfterSection(h, data);
}
