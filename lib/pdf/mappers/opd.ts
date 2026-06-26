import type { PdfFormHelpers } from "../formHelpers";
import {
  fillClinicalForm,
  normalizeTreatmentItems,
  type SharedClinicalPayload,
} from "./shared";

export type OpdPdfPayload = SharedClinicalPayload & {
  mode?: "before" | "after" | "full"; // ← เพิ่ม "full"
  suggest?: string;
  status?: string;
  therapist?: string;
  treatment_detail?: Record<string, unknown>;
};

function fillAfterSection(h: PdfFormHelpers, data: OpdPdfPayload) {
  // ← เปลี่ยน guard
  if (data.mode !== "after" && data.mode !== "full") return;

  const d = data as any;

  // Re-assessment vitals
  h.setText("after time", d.after_time ?? d.time ?? "");
  h.setText("after score", d.after_pain_score ?? "");
  h.setText("after pr", d.after_pr ?? "");
  h.setText("after RR", d.after_rr ?? "");
  h.setText("after BP", d.after_bp ?? "");
  h.setText("after spO2", d.after_spo2 ?? "");
  h.setText("after Duration ofPain", d.after_duration ?? "");
  h.setText("after Location of Pain", d.after_pain_location ?? "");

  // Pain assessment tool (after)
  const painTool = d.after_pain_assessment ?? "";
  h.setCheck(
    "newborn 1 year NIPS_2",
    painTool.includes("NIPS") || painTool.includes("Newborn"),
  );
  h.setCheck("13 years FLACC_2", painTool.includes("FLACC"));
  h.setCheck("38 years FRS_2", painTool.includes("FRS"));
  h.setCheck("8years NRS_2", painTool.includes("NRS"));
  h.setCheck("CPOT Critical care Pain Observation", painTool.includes("CPOT"));

  // Characteristic (after)
  const chars: string[] = d.after_characteristic ?? [];
  h.setCheck("Throbbing_2", chars.includes("Throbbing"));
  h.setCheck("Radiating_2", chars.includes("Radiating"));
  h.setCheck("Pin  Needles_2", chars.includes("Pin & Needles"));
  h.setCheck("Prick_2", chars.includes("Prick"));
  h.setCheck("Sharp_2", chars.includes("Sharp"));
  h.setCheck("Dull_2", chars.includes("Dull"));
  h.setCheck("Burning_2", chars.includes("Burning"));
  h.setCheck("Tight_2", chars.includes("Tight"));
  const knownChars = [
    "Prick",
    "Sharp",
    "Dull",
    "Burning",
    "Tight",
    "Throbbing",
    "Radiating",
    "Pin & Needles",
    "Other",
  ];
  const otherChar = chars.filter((c) => !knownChars.includes(c));
  const treatmentItems = normalizeTreatmentItems(
    d.treatment_items ?? d.treatment_detail,
  );
  const hasTreatmentOther =
    !!treatmentItems.othercheck?.checked ||
    !!treatmentItems.othercheck?.fields?.["other"];
  if (!hasTreatmentOther) {
    h.setCheck("after other check", otherChar.length > 0);
    h.setText("after other describe", otherChar.join(", "));
  }

  // Frequency (after)
  h.setCheck("Constant_2", d.after_frequency === "Constant");
  h.setCheck("Intermittent_2", d.after_frequency === "Intermittent");

  // Fall risk (after)
  h.setCheck("Standard fall NO ABCS_2", d.after_fall_risk === "standard");
  h.setCheck("Strict fall ABC_2", d.after_fall_risk === "strict");
  h.setCheck("Highly Strict fallS_2", d.after_fall_risk === "highly");

  // Treatment detail
  h.setText("treatment detail", d.treatment_detail_text ?? "");

  // Discharge
  h.setText("after date end", d.after_date ?? d.date ?? "");
  h.setText("after time end", d.after_time ?? d.time ?? "");

  const suggests: string[] = Array.isArray(d.suggest)
    ? d.suggest
    : (d.suggest ?? "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
  h.setCheck(
    "pain relief",
    suggests.some((s) => s.includes("การลดปวด")),
  );
  h.setCheck(
    "Physical exercise",
    suggests.some((s) => s.includes("การบริหารร่างกาย")),
  );
  h.setCheck(
    "Fall",
    suggests.some((s) => s.includes("Fall")),
  );
  h.setCheck(
    "walk_practice",
    suggests.some((s) => s.includes("การฝึกเดิน")),
  );
  h.setCheck(
    "lung",
    suggests.some((s) => s.includes("การเคาะปอด")),
  );
  h.setCheck(
    "toggle_119",
    suggests.some((s) => s.includes("การออกกำลังกายในผู้ป่วยอัมพาต")),
  );

  // Discharge status
  const status = d.status ?? "";
  h.setText("other discharge status", status);
  h.setText("physioTherapist", d.therapist ?? "");
  h.setCheck("good", status === "รู้สึกดี");
  h.setCheck("upset", status === "ซึม");
  h.setCheck("confuse", status === "สับสน");
  h.setCheck("no response", status === "ไม่รู้สึกตัว");
  h.setCheck(
    "discharge statue other check",
    !!status &&
      !["รู้สึกดี", "ซึม", "สับสน", "ไม่รู้สึกตัว", ""].includes(status),
  );

  // Physical exam (after)
  const afterExam = d.after_assessment ?? {};

  const afterOrtho = afterExam.orthopedics ?? {};
  h.setCheck(
    "Orthopedicsifcondition applied to_2",
    afterOrtho.checked ?? false,
  );
  h.setText("after ortho obser", afterOrtho.fields?.["Observation"] ?? "");
  h.setText("after ortho palpation", afterOrtho.fields?.["Palpation"] ?? "");
  h.setText(
    "after ortho muscle power",
    afterOrtho.fields?.["Muscle power"] ?? "",
  );
  h.setText(
    "after ortho range of motion",
    afterOrtho.fields?.["Range of Motion"] ?? "",
  );
  h.setText("after ortho sensation", afterOrtho.fields?.["Sensation"] ?? "");
  h.setText(
    "after ortho func",
    afterOrtho.fields?.["Functional movement"] ?? "",
  );

  const afterCardio = afterExam.cardiopulmonary ?? {};
  h.setCheck(
    "Cardiopulmonaryifcondition applied to_2",
    afterCardio.checked ?? false,
  );
  h.setText("after cardio obser", afterCardio.fields?.["Observation"] ?? "");
  h.setText("after cardio palpation", afterCardio.fields?.["Palpation"] ?? "");
  h.setText(
    "after cardio percussion",
    afterCardio.fields?.["Percussion"] ?? "",
  );
  h.setText(
    "after cardio auscultion",
    afterCardio.fields?.["Auscultation"] ?? "",
  );

  const afterNeuro = afterExam.neurology ?? {};
  h.setCheck("Neurologyifcondition applied to_2", afterNeuro.checked ?? false);
  h.setText("after neuro obser", afterNeuro.fields?.["Observation"] ?? "");
  h.setText(
    "after neuro muscle tone",
    afterNeuro.fields?.["Muscle Tone"] ?? "",
  );
  h.setText("after neuro balance", afterNeuro.fields?.["Balance"] ?? "");
  h.setText(
    "after neuro bed mobility",
    afterNeuro.fields?.["Bad mobility and Transfering"] ?? "",
  );
  h.setText(
    "after neuro muscle power",
    afterNeuro.fields?.["Muscle Power"] ?? "",
  );
  h.setText("after neuro sensation", afterNeuro.fields?.["Sensation"] ?? "");
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
