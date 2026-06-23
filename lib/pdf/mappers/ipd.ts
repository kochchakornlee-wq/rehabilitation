import type { PdfFormHelpers } from "../formHelpers";
import {
  fillGoalsAndPlan,
  fillPrecautions,
  fillTreatmentItems,
  normalizeTreatmentItems,
  type SharedClinicalPayload,
} from "./shared";

export type IpdPdfPayload = SharedClinicalPayload & {
  mode?: "before" | "after";
  room?: string;
  suggest?: string;
  status?: string;
  therapist?: string;
  treatment_detail?: Record<string, unknown>;
  fall_risk_mode?: string;
};

// ─── IPD patient info (field names ต่างจาก OPD) ─────────────────────────────
function fillIpdPatientInfo(h: PdfFormHelpers, data: IpdPdfPayload) {
  h.setText("patient name", data.patientName ?? "");
  h.setText("DOB", data.dob ?? "");
  h.setText("age", data.age ?? "");
  h.setText("hn", data.hn ?? "");
  h.setText("vn", data.vn ?? "");
  h.setText("visit", data.visitDate ?? "");
  h.setText("gender", data.gender ?? "");
  h.setText("Allergies", data.allergies ?? "");
  if (data.room) h.setText("Room", data.room);
}

// ─── IPD visit info (field names ต่างจาก OPD) ───────────────────────────────
function fillIpdVisitInfo(h: PdfFormHelpers, data: IpdPdfPayload) {
  h.setText("before date", data.date ?? "");
  h.setText("before time", data.time ?? "");
  h.setText("Doctor", data.doctor ?? "");

  h.setCheck("Walk", data.transportation === "walk");
  h.setCheck("Wheelchair", data.transportation === "wheelchair");
  h.setCheck("Stretcher", data.transportation === "Stretcher");
  const isOther =
    !!data.transportation &&
    !["walk", "wheelchair", "Stretcher", ""].includes(data.transportation);
  h.setCheck("transport other check", isOther);
  if (isOther) h.setText("transport other", data.transportation ?? "");

  h.setText("pr", data.pr ?? "");
  h.setText("rr", data.rr ?? "");
  h.setText("bp", data.bp ?? "");
  h.setText("spo2", data.spo2 ?? "");

  h.setText("Chiefcomplaint 1", data.chief ?? "");
  h.setText("Diagnosis", data.diagnosis ?? "");
  h.setText("Physiotherapy Precaution", data.physio_precaution ?? "");
}

// ─── IPD underlying (field names ต่างจาก OPD) ───────────────────────────────
function fillIpdUnderlying(h: PdfFormHelpers, data: IpdPdfPayload) {
  const underlying: string[] = data.underlying ?? [];
  h.setCheck("None", underlying.includes("None"));
  h.setCheck(
    "Heart Disease",
    underlying.some((u) => u.toLowerCase() === "heart disease"),
  );
  h.setCheck("Cancer", underlying.includes("Cancer"));
  h.setCheck("Diabetes Mellitus", underlying.includes("Diabetes Mellitus"));
  h.setCheck("Hypertension", underlying.includes("Hypertension"));

  const known = [
    "None",
    "Heart Disease",
    "Heart disease",
    "Cancer",
    "Diabetes Mellitus",
    "Hypertension",
    "Other",
  ];
  const otherUnd = underlying.filter((u) => !known.includes(u));
  h.setCheck("underly other check before", otherUnd.length > 0);
  h.setText("underly other before", otherUnd.join(", "));
}

// ─── IPD pain section (field names ต่างจาก OPD) ─────────────────────────────
function fillIpdPainSection(h: PdfFormHelpers, data: IpdPdfPayload) {
  h.setText("Pain Score", data.pain_score ?? "");
  h.setText("Location ofPain", data.pain_location ?? "");

  const painTool = data.pain_assessment ?? "";
  h.setCheck(
    "newborn 1 year NIPS",
    painTool.includes("Newborn") || painTool.includes("NIPS"),
  );
  h.setCheck("1-3 years FLACC", painTool.includes("FLACC"));
  h.setCheck("3-8 years FRS", painTool.includes("FRS"));
  h.setCheck("8years NRS", painTool.includes("NRS"));
  h.setCheck(
    "CPOT Critical care Pain Observation Tool",
    painTool.includes("CPOT"),
  );

  const chars: string[] = data.characteristic ?? [];
  h.setCheck("Prick", chars.includes("Prick"));
  h.setCheck("Sharp", chars.includes("Sharp"));
  h.setCheck("Dull", chars.includes("Dull"));
  h.setCheck("Burning", chars.includes("Burning"));
  h.setCheck("Tight", chars.includes("Tight"));
  h.setCheck("Throbbing", chars.includes("Throbbing"));
  h.setCheck("Radiating", chars.includes("Radiating"));
  h.setCheck("Pin  Needles", chars.includes("Pin & Needles"));

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
  h.setCheck("characterist before other check", otherChar.length > 0);
  h.setText("characterist other before", otherChar.join(", "));

  h.setText("duration", data.duration ?? "");
  h.setCheck("Constant", data.frequency === "Constant");
  h.setCheck("Intermittent", data.frequency === "Intermittent");
}

// ─── IPD fall risk (field names ต่างจาก OPD) ────────────────────────────────
function fillIpdFallRisk(h: PdfFormHelpers, data: IpdPdfPayload) {
  h.setCheck("Standard fall", data.fall_risk === "standard");
  h.setCheck("Strict fall", data.fall_risk === "strict");
  h.setCheck("Highly Strict fall", data.fall_risk === "highly");

  if (data.fall_risk_mode) {
    h.setCheck("pediatric fall risk", data.fall_risk_mode === "pediatric");
    h.setCheck("adult fall risk", data.fall_risk_mode === "adult");
    h.setCheck("obstetric fall risk", data.fall_risk_mode === "obstetric");
  }

  const fallItems: string[] = Array.isArray(data.fall_risk_items)
    ? data.fall_risk_items
    : [];
  h.setCheck("Fall", fallItems.includes("Bone (Fracture risk or history)"));
}

// ─── IPD physical exam (field names ต่างจาก OPD) ────────────────────────────
function fillIpdPhysicalExam(h: PdfFormHelpers, data: IpdPdfPayload) {
  // Barthel — IPD มี 2 RadioGroup แยกกัน
  if (data.barthel === "yes") {
    h.setRadio("barthel index yes", "barthel index yes");
  } else if (data.barthel === "no") {
    h.setRadio("barthel index no", "barthel index no");
  }

  h.setText("PhysicalExamination Visit", data.visit_number ?? "");

  const exam = data.assessment ?? {};

  const ortho = exam.orthopedics ?? {};
  h.setCheck("Orthopedics", ortho.checked ?? false);
  h.setText("before ortho obser", ortho.fields?.["Observation"] ?? "");
  h.setText("before ortho palpation", ortho.fields?.["Palpation"] ?? "");
  h.setText("before ortho muscle power", ortho.fields?.["Muscle power"] ?? "");
  h.setText("before ortho range", ortho.fields?.["Range of Motion"] ?? "");
  h.setText("before ortho sensation", ortho.fields?.["Sensation"] ?? "");
  h.setText(
    "before ortho func move",
    ortho.fields?.["Functional movement"] ?? "",
  );

  const cardio = exam.cardiopulmonary ?? {};
  h.setCheck("Cardiopulmonary", cardio.checked ?? false);
  h.setText("before cardio obser", cardio.fields?.["Observation"] ?? "");
  h.setText("before cardio palpation", cardio.fields?.["Palpation"] ?? "");
  h.setText("before cardio percussion", cardio.fields?.["Percussion"] ?? "");
  h.setText("before cardio auscultion", cardio.fields?.["Auscultation"] ?? "");

  const neuro = exam.neurology ?? {};
  h.setCheck("Neurology", neuro.checked ?? false);
  h.setText("before neuro obser", neuro.fields?.["Observation"] ?? "");
  h.setText("before neuro muscle", neuro.fields?.["Muscle Tone"] ?? "");
  h.setText("before neuro balance", neuro.fields?.["Balance"] ?? "");
  h.setText(
    "before neuro bed",
    neuro.fields?.["Bad mobility and Transfering"] ?? "",
  );
  h.setText("before neuro muscle power", neuro.fields?.["Muscle Power"] ?? "");
  h.setText("before neuro sensation", neuro.fields?.["Sensation"] ?? "");
}

// ─── IPD treatment items (field names ต่างจาก OPD) ──────────────────────────
function fillIpdTreatmentItems(h: PdfFormHelpers, data: IpdPdfPayload) {
  const ti = data.treatment_items ?? {};

  h.setCheck("Ultrasound", ti.ultrasound?.checked ?? false);
  h.setCheck(
    "Ultrasound Pulse",
    ti.ultrasound?.subOptions?.includes("Pulse") ?? false,
  );
  h.setCheck(
    "Ultrasound Continuous",
    ti.ultrasound?.subOptions?.includes("Continuous") ?? false,
  );
  h.setText("ultrasound minute", ti.ultrasound?.fields?.["minutes"] ?? "");
  h.setText("ultrasound area", ti.ultrasound?.fields?.["area"] ?? "");

  h.setCheck("ManualTherapy", ti.Manual?.checked ?? false);
  h.setCheck("Paraffin", ti.paraffin?.checked ?? false);

  h.setCheck("Tilt Table", ti.tilt?.checked ?? false);
  h.setText("tilt table minute", ti.tilt?.fields?.["minutes"] ?? "");
  h.setText("tilt table degree", ti.tilt?.fields?.["Degree"] ?? "");

  h.setCheck("ElectricalStimulation", ti.electrical?.checked ?? false);
  h.setText("electric minute", ti.electrical?.fields?.["minutes"] ?? "");
  h.setText("electric area", ti.electrical?.fields?.["area"] ?? "");

  h.setCheck("Hydrocollator", ti.hydrocollator?.checked ?? false);
  h.setText("hydro minute", ti.hydrocollator?.fields?.["minutes"] ?? "");
  h.setText("hydro area", ti.hydrocollator?.fields?.["area"] ?? "");

  h.setCheck("Cryotherapy", ti.cryotherapy?.checked ?? false);
  h.setText("cryotherapy", ti.cryotherapy?.fields?.["minutes"] ?? "");
  h.setText("cryotherapy area", ti.cryotherapy?.fields?.["area"] ?? "");

  h.setCheck("Traction", ti.traction?.checked ?? false);
  h.setCheck(
    "Cervical",
    ti.traction?.subOptions?.includes("Cervical") ?? false,
  );
  h.setCheck("Lumbar", ti.traction?.subOptions?.includes("Lumbar") ?? false);
  h.setText("traction kilogram", ti.traction?.fields?.["kilograms"] ?? "");
  h.setText("traction minute", ti.traction?.fields?.["minutes"] ?? "");

  h.setCheck("Laser", ti.laser?.checked ?? false);
  h.setCheck("Pulse_2", ti.laser?.subOptions?.includes("Pulse") ?? false);
  h.setCheck(
    "Continuous minutes area",
    ti.laser?.subOptions?.includes("Continuous") ?? false,
  );
  h.setText("laser minute", ti.laser?.fields?.["minutes"] ?? "");
  h.setText("laser area", ti.laser?.fields?.["area"] ?? "");

  h.setCheck("Shockwave Diathermy area", ti.shockwave?.checked ?? false);

  h.setCheck("Peripheral Diathermy", ti.peripheral?.checked ?? false);
  h.setText("peripheral mode", ti.peripheral?.fields?.["Mode"] ?? "");
  h.setText("peripheral minute", ti.peripheral?.fields?.["minutes"] ?? "");
  h.setText("peripheral area", ti.peripheral?.fields?.["area"] ?? "");

  h.setCheck("ShortwaveDiathermy", ti.shortwave?.checked ?? false);
  h.setCheck("Pulse_2", ti.shortwave?.subOptions?.includes("Pulse") ?? false);
  h.setCheck(
    "Continuous minutes area",
    ti.shortwave?.subOptions?.includes("Continuous") ?? false,
  );
  h.setText("shortwave minute", ti.shortwave?.fields?.["minutes"] ?? "");
  h.setText("shortwave area", ti.shortwave?.fields?.["area"] ?? "");

  h.setCheck("RangeofMotion Exercise", ti["motion exercise"]?.checked ?? false);
  h.setCheck("Hand Exercise", ti.hand?.checked ?? false);
  h.setCheck("StrengtheningExercise", ti.strengh?.checked ?? false);
  h.setCheck("BalanceTraining", ti.balance?.checked ?? false);
  h.setCheck("BalanceTest", ti["balance test"]?.checked ?? false);
  h.setCheck(
    "Bicycle Training  Intensityminutes",
    ti.Bicycle?.checked ?? false,
  );
  h.setText(
    "bycicle training intensity",
    ti.Bicycle?.fields?.["Intensity"] ?? "",
  );
  h.setText("bycicle training minute", ti.Bicycle?.fields?.["minutes"] ?? "");

  h.setCheck("Treadmill Training Speed", ti.treadmill?.checked ?? false);
  h.setText("treadmill speed", ti.treadmill?.fields?.["speed(km/h)"] ?? "");
  h.setText("treadmill minute", ti.treadmill?.fields?.["minutes"] ?? "");
  h.setText("treadmill distance", ti.treadmill?.fields?.["distance"] ?? "");

  h.setCheck("Continuous Passive Motion", ti.continuous?.checked ?? false);
  h.setText("passive motion minute", ti.continuous?.fields?.["minutes"] ?? "");
  h.setText(
    "flexion degree",
    ti.continuous?.fields?.[" Flexion/Extentsion"] ?? "",
  );

  h.setCheck("Percussion", ti.percussion?.checked ?? false);
  h.setCheck("Vibration", ti.vibration?.checked ?? false);
  h.setCheck("Chest Mobilization", ti.chest?.checked ?? false);
  h.setCheck("BreathingExercise", ti.breath?.checked ?? false);

  h.setCheck("Suction", ti.suction?.checked ?? false);
  h.setText("suction field", ti.suction?.fields?.["suction"] ?? "");

  h.setCheck("Ambulationwith", ti.am?.checked ?? false);
  h.setText("ambulation eith field", ti.am?.fields?.["with"] ?? "");
  const ambSubs: string[] = ti.am?.subOptions ?? [];
  h.setCheck(
    "Partial Weight Bearing",
    ambSubs.includes("Partial Weight Bearing"),
  );
  h.setCheck("Non Weight Bearing", ambSubs.includes("Non Weight Bearing"));
  h.setCheck("Full Weight Bearing", ambSubs.includes("Full Weight Bearing"));

  h.setCheck("Other check physiotherapy", ti.othercheck?.checked ?? false);
  h.setText("other field physiotherapy", data.treatment_detail_text ?? "");
}

// ─── IPD after section ───────────────────────────────────────────────────────
function fillIpdAfterSection(h: PdfFormHelpers, data: IpdPdfPayload) {
  if (data.mode !== "after") return;
  h.setText("after date", data.date ?? "");
  h.setText("after time end", data.time ?? "");
  h.setText("after pr", data.pr ?? "");
  h.setText("physiotherapist", data.therapist ?? "");

  const status = data.status ?? "";
  h.setCheck("good", status === "good");
  h.setCheck("upset", status === "upset");
  h.setCheck("Unconscious", status === "Unconscious");
  const isOtherStatus =
    !!status && !["good", "upset", "Unconscious"].includes(status);
  h.setCheck("discharge status other check", isOtherStatus);
  if (isOtherStatus) h.setText("discharge status other field", status);
}

// ─── Main fill function ──────────────────────────────────────────────────────
export function fillIpdPdf(h: PdfFormHelpers, raw: unknown) {
  const data = raw as IpdPdfPayload;
  const payload: IpdPdfPayload = {
    ...data,
    treatment_items: normalizeTreatmentItems(
      data.treatment_items ?? data.treatment_detail,
    ),
  };

  fillIpdPatientInfo(h, payload);
  fillIpdVisitInfo(h, payload);
  fillIpdUnderlying(h, payload);
  fillIpdPainSection(h, payload);
  fillIpdFallRisk(h, payload);
  fillPrecautions(h, payload); // เหมือนกัน ใช้จาก shared
  fillIpdPhysicalExam(h, payload);
  fillGoalsAndPlan(h, payload); // เหมือนกัน ใช้จาก shared
  fillIpdTreatmentItems(h, payload);
  fillIpdAfterSection(h, payload);
}
