import type { PdfFormHelpers } from "../formHelpers";

type TreatmentItem = {
  checked?: boolean;
  subOptions?: string[];
  fields?: Record<string, string>;
};

type AssessmentSection = {
  checked?: boolean;
  fields?: Record<string, string>;
};

export type SharedClinicalPayload = {
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
  doctor?: string;
  transportation?: string;
  pr?: string;
  rr?: string;
  bp?: string;
  spo2?: string;
  chief?: string;
  diagnosis?: string;
  physio_precaution?: string;
  underlying?: string[];
  pain_score?: string;
  pain_location?: string;
  pain_assessment?: string;
  characteristic?: string[];
  duration?: string;
  frequency?: string;
  fall_risk?: string;
  fall_risk_items?: string[] | Record<string, unknown>;
  precautions?: string[];
  barthel?: string;
  visit_number?: string;
  assessment?: Record<string, AssessmentSection>;
  treatment_plan?: string;
  short_goal?: string;
  long_goal?: string;
  treatment_items?: Record<string, TreatmentItem>;
  treatment_detail_text?: string;
  room?: string;
};

// ─── OPD patient info ────────────────────────────────────────────────────────
export function fillPatientInfo(
  h: PdfFormHelpers,
  data: SharedClinicalPayload,
) {
  h.setText("patient name", data.patientName ?? "");
  h.setText("date of birth", data.dob ?? "");
  h.setText("age", data.age ?? "");
  h.setText("hn", data.hn ?? "");
  h.setText("vn", data.vn ?? "");
  h.setText("admit date", data.visitDate ?? "");
  h.setText("gender", data.gender ?? "");
  h.setText("allergies", data.allergies ?? "");
}

// ─── OPD visit info ──────────────────────────────────────────────────────────
export function fillVisitInfo(h: PdfFormHelpers, data: SharedClinicalPayload) {
  h.setText("brforedate", data.date ?? "");
  h.setText("beforetime", data.time ?? "");
  h.setText("doctor", data.doctor ?? "");

  const tran = data.transportation ?? "";
  const knownTran = ["walk", "wheelchair", "Stretcher", ""];
  h.setCheck("Walk", tran === "walk");
  h.setCheck("Wheelchair", tran === "wheelchair");
  h.setCheck("Stretcher", tran === "Stretcher");
  h.setCheck("transport other check", !!tran && !knownTran.includes(tran)); // ✅ แก้ชื่อ field
  h.setText("transport other", !knownTran.includes(tran) ? tran : ""); // ✅ เพิ่ม text

  h.setText("pr", data.pr ?? "");
  h.setText("rr", data.rr ?? "");
  h.setText("bp", data.bp ?? "");
  h.setText("sp", data.spo2 ?? "");

  h.setText("Chiefcomplaint 1", data.chief ?? "");
  h.setText("Diagnosis", data.diagnosis ?? "");
  h.setText("Physiotherapy Precaution", data.physio_precaution ?? "");
}

// ─── Underlying ──────────────────────────────────────────────────────────────
export function fillUnderlying(h: PdfFormHelpers, data: SharedClinicalPayload) {
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
  h.setCheck("other underly check", otherUnd.length > 0);
  h.setText("undefined_2", otherUnd.join(", "));
}

// ─── Pain section ─────────────────────────────────────────────────────────────
export function fillPainSection(
  h: PdfFormHelpers,
  data: SharedClinicalPayload,
) {
  h.setText("Pain Score", data.pain_score ?? "");
  h.setText("Location ofPain", data.pain_location ?? "");

  const painTool = data.pain_assessment ?? "";
  h.setCheck(
    "newborn 1 year NIPS",
    painTool.includes("Newborn") || painTool.includes("NIPS"),
  );
  h.setCheck("13 years FLACC", painTool.includes("FLACC"));
  h.setCheck("38 years FRS", painTool.includes("FRS"));
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
  h.setText("character other", otherChar.join(", "));

  h.setText("duration", data.duration ?? "");
  h.setCheck("Constant", data.frequency === "Constant");
  h.setCheck("Intermittent", data.frequency === "Intermittent");
}

// ─── Fall risk ───────────────────────────────────────────────────────────────
export function fillFallRisk(h: PdfFormHelpers, data: SharedClinicalPayload) {
  h.setCheck("Standard fall NO ABCS", data.fall_risk === "standard");
  h.setCheck("Strict fall ABC", data.fall_risk === "strict");
  h.setCheck("Highly Strict fallS", data.fall_risk === "highly");

  const fallItems: string[] = Array.isArray(data.fall_risk_items)
    ? data.fall_risk_items
    : [];

  // ✅ แก้ครบทุก field ตาม PDF
  h.setCheck(
    "fall(A)_age < 2 y >85y",
    fallItems.includes("ผู้ป่วยเด็กอายุน้อยกว่า 2 ปี หรือสูงอายุมากกว่า 85"),
  );
  h.setCheck(
    "fall(A)_Bone",
    fallItems.includes("Bone (Fracture risk or history)"),
  );
  h.setCheck(
    "fall(B)_balance",
    fallItems.includes("มีปัญหาเรื่องการทรงตัว วิงเวียน ใช้อุปกรณ์ช่วยเดิน"),
  );
  h.setCheck(
    "fall(B)_pregnant>20",
    fallItems.includes("ตั้งครรภ์มากกว่าหรือเท่ากับ 20 สัปดาห์"),
  );
  h.setCheck(
    "Fall(C)_Coagulation",
    fallItems.includes("ได้รับยากลุ่มต้านการแข็งตัวของเลือด"),
  );
  h.setCheck(
    "fall(S)_Surgery",
    fallItems.includes("ผู้ป่วยได้รับการทำหัตถการ (ใช้ยาสลบ)"),
  );
  h.setCheck("Fall(S)_eye", fallItems.includes("ได้รับยาขยายม่านตา"));
}

// ─── Precautions ─────────────────────────────────────────────────────────────
export function fillPrecautions(
  h: PdfFormHelpers,
  data: SharedClinicalPayload,
) {
  const precs: string[] = data.precautions ?? [];
  h.setCheck("Standard Precaution", precs.includes("Standard Precaution"));
  h.setCheck("Airborne", precs.includes("Airborne"));
  h.setCheck("Droplet", precs.includes("Droplet"));
  h.setCheck("drugResistance", precs.includes("drug-Resistance"));
  h.setCheck("Contact", precs.includes("Contact"));
  h.setCheck("Protective", precs.includes("Protective"));
}

// ─── Physical exam ────────────────────────────────────────────────────────────
export function fillPhysicalExam(
  h: PdfFormHelpers,
  data: SharedClinicalPayload,
) {
  h.setRadio("BarthelIndex", data.barthel === "yes" ? "Yes" : "No");
  h.setText("PhysicalExamination Visit", data.visit_number ?? "");

  const exam = data.assessment ?? {};

  // ✅ แก้ field names ortho ให้ตรงกับ PDF
  const ortho = exam.orthopedics ?? {};
  h.setCheck("Orthopedicsifcondition applied to", ortho.checked ?? false);
  h.setText("before ortho obser", ortho.fields?.["Observation"] ?? "");
  h.setText("before ortho palpation", ortho.fields?.["Palpation"] ?? "");
  h.setText("before ortho muscle power", ortho.fields?.["Muscle power"] ?? "");
  h.setText("before ortho range", ortho.fields?.["Range of Motion"] ?? "");
  h.setText("before ortho sensation", ortho.fields?.["Sensation"] ?? "");
  h.setText("ortho func", ortho.fields?.["Functional movement"] ?? "");

  const cardio = exam.cardiopulmonary ?? {};
  h.setCheck("Cardiopulmonaryifcondition applied to", cardio.checked ?? false);
  h.setText("cardio obser", cardio.fields?.["Observation"] ?? "");
  h.setText("cardio palpation", cardio.fields?.["Palpation"] ?? "");
  h.setText("cardio percussion", cardio.fields?.["Percussion"] ?? "");
  h.setText("cardio auscullation", cardio.fields?.["Auscultation"] ?? "");

  const neuro = exam.neurology ?? {};
  h.setCheck("Neurologyifcondition applied to", neuro.checked ?? false);
  h.setText("neuro obser", neuro.fields?.["Observation"] ?? "");
  h.setText("neuro muscle tone", neuro.fields?.["Muscle Tone"] ?? "");
  h.setText("neuro balance", neuro.fields?.["Balance"] ?? "");
  h.setText(
    "neuro bed mobility",
    neuro.fields?.["Bad mobility and Transfering"] ?? "",
  );
  h.setText("neuro muscle power", neuro.fields?.["Muscle Power"] ?? "");
  h.setText("Neuro sensation", neuro.fields?.["Sensation"] ?? "");
}

// ─── Goals and plan ───────────────────────────────────────────────────────────
export function fillGoalsAndPlan(
  h: PdfFormHelpers,
  data: SharedClinicalPayload,
) {
  h.setText("Treatment Plan 1", data.treatment_plan ?? "");
  h.setText("Short term goal 1", data.short_goal ?? "");
  h.setText("Long term goal 1", data.long_goal ?? "");
}

// ─── Treatment items ──────────────────────────────────────────────────────────
export function fillTreatmentItems(
  h: PdfFormHelpers,
  data: SharedClinicalPayload,
) {
  const ti = data.treatment_items ?? {};

  // Ultrasound
  h.setCheck("Ultrasound", ti.ultrasound?.checked ?? false);
  h.setCheck(
    "Ultrasound Pulse",
    ti.ultrasound?.subOptions?.includes("Pulse") ?? false,
  );
  h.setCheck(
    "Continuous",
    ti.ultrasound?.subOptions?.includes("Continuous") ?? false,
  );
  h.setText("minute ultrasound", ti.ultrasound?.fields?.["minutes"] ?? "");
  h.setText("minutes area ultrasound", ti.ultrasound?.fields?.["area"] ?? "");

  // Manual / Paraffin
  h.setCheck("Manual Therapy", ti.Manual?.checked ?? false);
  h.setCheck("Paraffin", ti.paraffin?.checked ?? false);

  // Tilt Table
  h.setCheck("Tilt Table", ti.tilt?.checked ?? false);
  h.setText("tilt minute", ti.tilt?.fields?.["minutes"] ?? "");
  h.setText("tilt degree", ti.tilt?.fields?.["Degree"] ?? "");

  // Electrical Stimulation
  h.setCheck("Electrical Stimulation", ti.electrical?.checked ?? false);
  h.setText("electrical minute", ti.electrical?.fields?.["minutes"] ?? "");
  h.setText("elec area_2", ti.electrical?.fields?.["area"] ?? "");

  // Hydrocollator ✅ เพิ่ม field ครบ
  h.setCheck("Hydrocollator", ti.hydrocollator?.checked ?? false);
  h.setText(
    "hydrocollator minute",
    ti.hydrocollator?.fields?.["minutes"] ?? "",
  );
  h.setText("hydro area", ti.hydrocollator?.fields?.["area"] ?? "");

  // Cryotherapy
  h.setCheck("Cryotherapy", ti.cryotherapy?.checked ?? false);
  h.setText("cryotherapy minute", ti.cryotherapy?.fields?.["minutes"] ?? "");
  h.setText("cryotheraphy area", ti.cryotherapy?.fields?.["area"] ?? "");

  // Traction
  h.setCheck("Traction", ti.traction?.checked ?? false);
  h.setCheck(
    "Cervical",
    ti.traction?.subOptions?.includes("Cervical") ?? false,
  );
  h.setCheck("Lumbar", ti.traction?.subOptions?.includes("Lumbar") ?? false);
  h.setText("Tractiton kilo", ti.traction?.fields?.["kilograms"] ?? "");
  h.setText("traction minute", ti.traction?.fields?.["minutes"] ?? "");

  // Laser ✅ เพิ่ม Jul/cm2
  h.setCheck("Laser", ti.laser?.checked ?? false);
  h.setCheck("laser Pulse", ti.laser?.subOptions?.includes("Pulse") ?? false);
  h.setCheck(
    "Continuous minutes area",
    ti.laser?.subOptions?.includes("Continuous") ?? false,
  );
  h.setText("laser minute", ti.laser?.fields?.["minutes"] ?? "");
  h.setText("laser area", ti.laser?.fields?.["area"] ?? "");
  h.setText("Jul/cm2", ti.laser?.fields?.["Jul/cm2"] ?? ""); // ✅ เพิ่ม

  // Shockwave Diathermy ✅ รับแค่ area (ไม่มี minutes)
  h.setCheck("Shockwave Diathermy area", ti.shockwave?.checked ?? false);
  h.setText("shortwave area", ti.shockwave?.fields?.["area"] ?? ""); // ✅ เพิ่ม

  // Peripheral Diathermy
  h.setCheck("Peripheral Diathermy", ti.peripheral?.checked ?? false);
  h.setText("pheripheral mode", ti.peripheral?.fields?.["Mode"] ?? "");
  h.setText("pheripheral minute", ti.peripheral?.fields?.["minutes"] ?? "");
  h.setText("pheripheral area", ti.peripheral?.fields?.["area"] ?? "");

  // Shortwave/Microwave Diathermy
  h.setCheck(
    "Shortwave DiathermyMicrowave Diathermy",
    ti.shortwave?.checked ?? false,
  );
  h.setCheck(
    "shortwave pulse",
    ti.shortwave?.subOptions?.includes("Pulse") ?? false,
  );
  h.setCheck(
    "Continuous_2",
    ti.shortwave?.subOptions?.includes("Continuous") ?? false,
  );
  h.setText("shortwave minute", ti.shortwave?.fields?.["minutes"] ?? "");
  h.setText("shortwave area", ti.shortwave?.fields?.["area"] ?? "");

  // Exercise
  h.setCheck(
    "Range of Motion Exercise",
    ti["motion exercise"]?.checked ?? false,
  );
  h.setCheck("Hand Exercise", ti.hand?.checked ?? false);
  h.setCheck("Strengthening Exercise", ti.strengh?.checked ?? false);
  h.setCheck("Balance Training", ti.balance?.checked ?? false);
  h.setCheck("Balance Test", ti["balance test"]?.checked ?? false);

  // Bicycle
  h.setCheck(
    "Bicycle Training  Intensityminutes",
    ti.Bicycle?.checked ?? false,
  );
  h.setText("balance intensity", ti.Bicycle?.fields?.["Intensity"] ?? "");
  h.setText("balance minute", ti.Bicycle?.fields?.["minutes"] ?? "");

  // Treadmill
  h.setCheck("Treadmill Training Speed", ti.treadmill?.checked ?? false);
  h.setText("treadmill speed", ti.treadmill?.fields?.["speed(km/h)"] ?? "");
  h.setText("treadmill minute", ti.treadmill?.fields?.["minutes"] ?? "");
  h.setText("treadmill distance", ti.treadmill?.fields?.["distance"] ?? "");

  // Continuous Passive Motion
  h.setCheck("Continuous Passive Motion", ti.continuous?.checked ?? false);
  h.setText(
    "continuous passive minute",
    ti.continuous?.fields?.["minutes"] ?? "",
  );
  h.setText(
    "flexion degree",
    ti.continuous?.fields?.[" Flexion/Extentsion"] ?? "",
  );

  // Chest / Breathing
  h.setCheck("Percussion", ti.percussion?.checked ?? false);
  h.setCheck("Vibration", ti.vibration?.checked ?? false);
  h.setCheck("Chest Mobilization", ti.chest?.checked ?? false);
  h.setCheck("BreathingExercise", ti.breath?.checked ?? false);

  // Suction
  h.setCheck("Suction", ti.suction?.checked ?? false);
  h.setText("suction", ti.suction?.fields?.["suction"] ?? "");

  // Ambulation ✅ fields["with"] — ต้องเพิ่ม fields: ["with"] ใน page.tsx treatmentSection am
  h.setCheck("Ambulation with", ti.am?.checked ?? false);
  h.setText("ambulation with", ti.am?.fields?.["with"] ?? "");
  const ambSubs: string[] = ti.am?.subOptions ?? [];
  h.setCheck(
    "Partial Weight Bearing",
    ambSubs.includes("Partial Weight Bearing"),
  );
  h.setCheck("Non Weight Bearing", ambSubs.includes("Non Weight Bearing"));
  h.setCheck("Full Weight Bearing", ambSubs.includes("Full Weight Bearing"));

  // Other ✅ แก้ field names
  h.setCheck("transport other check", ti.othercheck?.checked ?? false);
  h.setText("transport other", ti.othercheck?.fields?.["other"] ?? "");
}

/** Normalize treatment_items from array format to record format. */
export function normalizeTreatmentItems(
  raw: unknown,
): Record<string, TreatmentItem> {
  if (!raw) return {};
  if (Array.isArray(raw)) {
    return raw.reduce(
      (acc, item) => {
        if (item?.id) {
          acc[item.id] = {
            checked: true,
            subOptions: item.subOptions,
            fields: item.fields,
          };
        }
        return acc;
      },
      {} as Record<string, TreatmentItem>,
    );
  }
  return raw as Record<string, TreatmentItem>;
}

export function fillClinicalForm(
  h: PdfFormHelpers,
  data: SharedClinicalPayload,
) {
  fillPatientInfo(h, data);
  fillVisitInfo(h, data);
  fillUnderlying(h, data);
  fillPainSection(h, data);
  fillFallRisk(h, data);
  fillPrecautions(h, data);
  fillPhysicalExam(h, data);
  fillGoalsAndPlan(h, data);
  fillTreatmentItems(h, data);
}
