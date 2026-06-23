import type { PdfFormHelpers } from "../formHelpers";

type EstimateSection = {
  checked?: boolean;
  subOptions?: string[];
};

export type DischargePdfPayload = {
  patientName?: string;
  dob?: string;
  age?: string;
  hn?: string;
  visitDate?: string;
  gender?: string;
  allergies?: string;
  date?: string;
  time?: string;
  doctor?: string;
  short_goal?: string;
  long_goal?: string;
  plan?: string;
  intime?: string;
  cause?: string;
  pass?: string;
  assessor?: string;
  estimate?: Record<string, EstimateSection>;
};

// ─── map intime key → PDF field name ────────────────────────────────────────
const INTIME_MAP: Record<string, string> = {
  done: "complete",
  "not finished": "uncomplete",
  over: "over time",
};

// ─── map cause key → PDF field name ─────────────────────────────────────────
const CAUSE_MAP: Record<string, string> = {
  better: "Symptoms improved",
  normal: "Symptoms healed normally",
  way: "travel problems",
  finance: "financial problems",
  change: "Change treatment location",
  refrain: "Abstain from physical exercise",
};

// ─── map section id → PDF checkbox field name ────────────────────────────────
const SECTION_MAP: Record<string, string> = {
  Orthopedic: "Orthoped",
  Neurology: "Neuro",
  chest: "Chest",
};

// ─── map subOption string → PDF field name ───────────────────────────────────
// key = subOption string จาก page.tsx sections[]
const SUB_OPTION_MAP: Record<string, string> = {
  // Orthopedic
  "pain score < 2": "pain less than 2",
  "สามารถเดินได้ดีด้วยอุปกรณ์ที่แพทย์ Order ทั้งทางตรง ทางราบ และการขึ้น-ลงบันได":
    "can walk",
  "ผู้เฝ้าดูแลหรือญาติ สามารถให้การดูแลเบื้องต้นได้อย่างถูกต้อง": "take care",
  บรรลุเป้าหมายที่ตั้งไว้ในช่วงเวลาอันสั้น: "short goal achive",

  // Neurology (subOptions ที่ซ้ำกับ Ortho จะถูก map ต่างกันตาม sectionId ด้านล่าง)
  "Barthel index score >= 75 คะแนนหรือมีการเปลี่ยนแปลงของระดับ Barthel index score ร่วมกับผู้เฝ้าดูแลหรือญาติสามารถให้การดูแลได้อย่างถูกต้อง":
    "Barthel > 75",

  // Chest
  ผูเป่วยสามารถหายใจได้เองในห้องปกติโดยปราศจากอุปกรณ์ช่วยหายใจ: "can breath",
  "ระดับค่าออกซิเจนในกระแสเลือด >= 95%": "O2 > 95%",
  ผู้ป่วยสามารถช่วยเหลือตนเองได้หรือมีผู้ช่วยเหลือเล็กน้อย: "help yourself",
};

// subOptions ที่ชื่อซ้ำกันระหว่าง section → ต้อง map ด้วย sectionId
const SUB_OPTION_BY_SECTION: Record<string, Record<string, string>> = {
  Neurology: {
    บรรลุเป้าหมายที่ตั้งไว้ในช่วงเวลาอันสั้น: "neuro short goal achive",
    "ผู้เฝ้าดูแลหรือญาติ สามารถให้การดูแลเบื้องต้นได้อย่างถูกต้อง":
      "neuro take care",
  },
  chest: {
    บรรลุเป้าหมายที่ตั้งไว้ในช่วงเวลาอันสั้น: "chest short goal achive",
    "ผู้เฝ้าดูแลหรือญาติ สามารถให้การดูแลเบื้องต้นได้อย่างถูกต้อง":
      "chest take care",
  },
};

export function fillDischargePdf(h: PdfFormHelpers, raw: unknown) {
  const data = raw as DischargePdfPayload;
  console.log("estimate:", JSON.stringify(data.estimate, null, 2)); // ← เพิ่ม

  for (const [sectionId, section] of Object.entries(data.estimate ?? {})) {
    const field = SECTION_MAP[sectionId];
    console.log(
      `section: ${sectionId} → field: ${field}, checked: ${section.checked}`,
    );
  }
  // ─── Patient info ─────────────────────────────────────────────────────────
  h.setText("patient name", data.patientName ?? "");
  h.setText("DOB", data.dob ?? "");
  h.setText("age", data.age ?? "");
  h.setText("hn", data.hn ?? "");
  h.setText("visit date", data.visitDate ?? "");
  h.setText("gender", data.gender ?? "");
  h.setText("Allergies", data.allergies ?? "");

  // ─── Visit info ───────────────────────────────────────────────────────────
  h.setText("date", data.date ?? "");
  h.setText("time", data.time ?? "");
  h.setText("doctor", data.doctor ?? "");
  h.setText("Long term goa", data.short_goal ?? ""); // field ชื่อนี้ใน PDF คือ short goal
  h.setText("long term goal", data.long_goal ?? "");
  h.setText("plan", data.plan ?? "");
  h.setText("physiotherapist", data.assessor ?? "");

  // ─── Intime checkboxes ────────────────────────────────────────────────────
  for (const [key, fieldName] of Object.entries(INTIME_MAP)) {
    h.setCheck(fieldName, data.intime === key);
  }

  // ─── Cause checkboxes ─────────────────────────────────────────────────────
  const cause = data.cause ?? "";
  const isKnownCause = cause in CAUSE_MAP;
  for (const [key, fieldName] of Object.entries(CAUSE_MAP)) {
    h.setCheck(fieldName, cause === key);
  }
  h.setCheck("other reason check", !isKnownCause && cause.length > 0);
  if (!isKnownCause && cause.length > 0) h.setText("other reason field", cause);

  // ─── Pass / consent ───────────────────────────────────────────────────────
  h.setCheck("achieve objectives", data.pass === "yes");
  h.setCheck("uncomplete discharge check", data.pass === "no");

  // ─── Estimate sections ────────────────────────────────────────────────────
  const estimate = data.estimate ?? {};
  for (const [sectionId, section] of Object.entries(estimate)) {
    // section-level checkbox
    const sectionField = SECTION_MAP[sectionId];
    if (sectionField) h.setCheck(sectionField, section.checked ?? false);

    // sub-option checkboxes
    for (const sub of section.subOptions ?? []) {
      // ลอง section-specific map ก่อน ถ้าไม่มีค่อย fallback generic map
      const field =
        SUB_OPTION_BY_SECTION[sectionId]?.[sub] ?? SUB_OPTION_MAP[sub];
      if (field) h.setCheck(field, true);
    }
  }
}
