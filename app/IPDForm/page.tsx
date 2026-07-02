"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import PDFPreviewModal from "@/components/PDFPreviewModal";
import { fetchPdfPreview } from "@/lib/pdf/client";
import { useActiveHN } from "@/lib/useActiveHN";

interface HISPatient {
  hn: string;
  hn_formatted?: string;
  prename?: string;
  firstname?: string;
  lastname?: string;
  birthdate?: string;
  gender?: string;
  age?: number;
  admit_date?: string;
  visit_date?: string;
  allergies?: string[];
}

type PatientCardProps = {
  name: string;
  HN: string;
  birth: string;
  admit: string;
  gender: string;
  allergies: string;
};
type Section = {
  id: string;
  label: string;
  fields: string[];
  subOptions?: string[];
  type?: string;
};

function PatientCard({
  name,
  HN,
  birth,
  admit,
  gender,
  allergies,
}: PatientCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border-t-4 border-blue-500">
      <p className="text-2xl font-bold text-slate-800">{name}</p>
      <p className="text-sm text-slate-500 mt-1">HN: {HN}</p>
      <p className="text-sm text-slate-500 mt-1">Birth: {birth}</p>
      <p className="text-sm text-slate-500 mt-1">Admit: {admit}</p>
      <p className="text-sm text-slate-500 mt-1">Gender: {gender}</p>
      <p className="text-sm text-slate-500 mt-1">Allergies: {allergies}</p>
    </div>
  );
}

const sections: Section[] = [
  {
    id: "orthopedics",
    label: "Orthopedics",
    fields: [
      "Observation",
      "Palpation",
      "Muscle power",
      "Range of Motion",
      "Sensation",
      "Functional movement",
    ],
  },
  {
    id: "cardiopulmonary",
    label: "Cardiopulmonary",
    fields: ["Observation", "Palpation", "Percussion", "Auscultation"],
  },
  {
    id: "neurology",
    label: "Neurology",
    fields: [
      "Observation",
      "Muscle Tone",
      "Balance",
      "Bad mobility and Transfering",
      "Muscle Power",
      "Sensation",
    ],
  },
];

const treatmentSection: Section[] = [
  {
    id: "ultrasound",
    label: "Ultrasound",
    type: "section",
    subOptions: ["Pulse", "Continuous"], // ← มี checkbox ย่อย
    fields: ["minutes", "area"],
  },
  {
    id: "Manual",
    label: "Manual",
    type: "checkbox",
    subOptions: [], // ← มี checkbox ย่อย
    fields: [],
  },
  {
    id: "paraffin",
    label: "Paraffin",
    type: "checkbox",
    subOptions: [], // ← มี checkbox ย่อย
    fields: [],
  },
  {
    id: "tilt",
    label: "Tilt Table",
    type: "section",
    subOptions: [], // ← ไม่มี checkbox ย่อย
    fields: ["minutes", "Degree"],
  },
  {
    id: "electrical",
    label: "Electrical",
    type: "section",
    subOptions: [], // ← ไม่มี checkbox ย่อย
    fields: ["minutes", "area"],
  },
  {
    id: "hydrocollator",
    label: "Hydrocollator",
    type: "section",
    subOptions: [], // ← ไม่มี checkbox ย่อย
    fields: ["minutes", "area"],
  },
  {
    id: "cryotherapy",
    label: "Cryotherapy",
    type: "section",
    fields: ["minutes", "area"],
  },
  {
    id: "traction",
    label: "Traction",
    type: "section",
    subOptions: ["Cervical", "Lumbar"], // ← ไม่มี checkbox ย่อย
    fields: ["kilograms", "minutes"],
  },
  {
    id: "laser",
    label: "Laser",
    type: "section",
    subOptions: ["Pulse", "Continuous"], // ← มี checkbox ย่อย
    fields: ["minutes", "area", "Jul/cm2"],
  },
  {
    id: "shockwave",
    label: "Shockwave Diathemy",
    type: "section",
    subOptions: [], // ← มี checkbox ย่อย
    fields: ["area"],
  },
  {
    id: "peripheral",
    label: "Peripheral Diathemy",
    type: "section",
    subOptions: [], // ← มี checkbox ย่อย
    fields: ["Mode", "minutes", "area"],
  },
  {
    id: "shortwave",
    label: "Shortwave Diathemy/Microwave Diathemy",
    type: "section",
    subOptions: ["Pulse", "Continuous"], // ← มี checkbox ย่อย
    fields: ["minutes", "area"],
  },
  {
    id: "motion exercise",
    label: "Range of Motion Exercise",
    type: "checkbox",
    subOptions: [], // ← มี checkbox ย่อย
    fields: [],
  },
  {
    id: "hand",
    label: "Hand Exercise",
    type: "checkbox",
    subOptions: [], // ← มี checkbox ย่อย
    fields: [],
  },
  {
    id: "strengh",
    label: "Strengthening Exercise",
    type: "checkbox",
    subOptions: [], // ← มี checkbox ย่อย
    fields: [],
  },
  {
    id: "balance",
    label: "Balance Training",
    type: "checkbox",
    subOptions: [], // ← มี checkbox ย่อย
    fields: [],
  },
  {
    id: "balance test",
    label: "Balance Test",
    type: "checkbox",
    subOptions: [], // ← มี checkbox ย่อย
    fields: [],
  },
  {
    id: "Bicycle",
    label: "Bicycle Training",
    type: "section",
    subOptions: [], // ← มี checkbox ย่อย
    fields: ["Intensity", "minutes"],
  },
  {
    id: "treadmill",
    label: "Treadmill Training",
    type: "section",
    subOptions: [], // ← มี checkbox ย่อย
    fields: ["speed(km/h)", "minutes", "distance"],
  },
  {
    id: "continuous",
    label: "Continuous Passive Motion",
    type: "section",
    subOptions: [], // ← มี checkbox ย่อย
    fields: ["minutes", " Flexion/Extentsion"],
  },
  {
    id: "percussion",
    label: "Percussion",
    type: "checkbox",
    subOptions: [], // ← มี checkbox ย่อย
    fields: [],
  },
  {
    id: "vibration",
    label: "Vibration",
    type: "checkbox",
    subOptions: [], // ← มี checkbox ย่อย
    fields: [],
  },
  {
    id: "chest",
    label: "Chest Mobilization",
    type: "checkbox",
    subOptions: [], // ← มี checkbox ย่อย
    fields: [],
  },
  {
    id: "breath",
    label: "Breathing Exercise",
    type: "checkbox",
    subOptions: [], // ← มี checkbox ย่อย
    fields: [],
  },
  {
    id: "suction",
    label: "Suction",
    type: "section",
    subOptions: [], // ← มี checkbox ย่อย
    fields: ["suction"],
  },
  {
    id: "am",
    label: "Ambulation",
    type: "section",
    subOptions: [
      "Partial Weight Bearing",
      "Full Weight Bearing",
      "Non Weight Bearing",
    ],
    fields: ["with"],
  },
  {
    id: "othercheck",
    label: "Other",
    type: "section",
    subOptions: [], // ← มี checkbox ย่อย
    fields: ["other"],
  },
];

// ============================================================
// FALL RISK DATA
// ============================================================

// --- Pediatric (Age < 15) ---
const pediatricCategories = [
  {
    id: "ped_age",
    label: "Age",
    options: [
      { label: "Less than 3 years old", score: 4 },
      { label: "3 to less than 7 years old", score: 3 },
      { label: "7 to less than 13 years old", score: 2 },
      { label: "13 years old and above", score: 1 },
    ],
  },
  {
    id: "ped_gender",
    label: "Gender",
    options: [
      { label: "Male", score: 2 },
      { label: "Female", score: 1 },
    ],
  },
  {
    id: "ped_diagnosis",
    label: "Diagnosis",
    options: [
      { label: "Neurological Diagnosis", score: 4 },
      {
        label:
          "Alteration in Oxygenation (Respiratory Diagnosis, Dehydration, Anemia, Anorexia, Syncope/Dizziness, Etc.)",
        score: 3,
      },
      { label: "Psycho/Behavioral disorders", score: 2 },
      { label: "Other Diagnosis", score: 1 },
    ],
  },
  {
    id: "ped_cognitive",
    label: "Cognitive Impairments",
    options: [
      { label: "Not Aware of Limitations", score: 3 },
      { label: "Forget Limitations", score: 2 },
      { label: "Oriented to Own Ability", score: 1 },
    ],
  },
  {
    id: "ped_environment",
    label: "Environment Factors",
    options: [
      { label: "History of Fall or Infant-Toddler Placed in Bed", score: 4 },
      {
        label:
          "Patient uses assistive devices or Infant Toddler in Crib or Furniture/Lighting (Tripled Room)",
        score: 3,
      },
      { label: "Patient Placed in Bed", score: 2 },
      { label: "Outpatient Area (Playground)", score: 1 },
    ],
  },
  {
    id: "ped_surgery",
    label: "Response to Surgery/Sedation/Anesthesia",
    options: [
      { label: "Within 24 hours", score: 3 },
      { label: "Within 48 hours", score: 2 },
      { label: "More than 48 hours / None", score: 1 },
    ],
  },
  {
    id: "ped_medication",
    label: "Medication",
    options: [
      {
        label:
          "Multiple Usage of Sedative, Hypnotics, Barbiturates, Phenothiazines, Antidepressants, Laxatives/Diuretics, Narcotics",
        score: 3,
      },
      { label: "One of Medication Listed Above", score: 2 },
      { label: "Other Medications / None", score: 1 },
    ],
  },
];

// --- Adult (Age ≥ 15) — Morse Fall Scale ---
const adultCategories = [
  {
    id: "adu_history",
    label: "มีประวัติล้มก่อนเข้าโรงพยาบาล หรือภายใน 3 เดือน",
    options: [
      { label: "No", score: 0 },
      { label: "Yes", score: 25 },
    ],
  },
  {
    id: "adu_diagnosis",
    label: "ได้รับการวินิจฉัยโรคมากกว่า 1 โรค",
    options: [
      { label: "No", score: 0 },
      { label: "Yes", score: 15 },
    ],
  },
  {
    id: "adu_ambulatory",
    label: "การใช้เครื่องช่วยเดิน (Ambulatory aid)",
    options: [
      { label: "นอนติดเตียง/ต้องการพยาบาลช่วย/ใช้รถเข็น", score: 0 },
      { label: "ใช้ไม้เท้า/ไม้ค้ำยัน (Crutches/Cane/Walker)", score: 15 },
      { label: "เดินโดยเกาะเฟอร์นิเจอร์ (Furniture)", score: 30 },
    ],
  },
  {
    id: "adu_iv",
    label: "มีสายน้ำเกลือ (IV)",
    options: [
      { label: "No", score: 0 },
      { label: "Yes", score: 20 },
    ],
  },
  {
    id: "adu_gait",
    label: "การเดิน/การเคลื่อนย้าย (Gait/Transferring)",
    options: [
      { label: "เดินปกติ/นอนติดเตียง/ไม่ขยับตัว (Normal/Immobile)", score: 0 },
      { label: "ท่าเดินโดดๆไปข้างหน้า ก้าวเท้าสั้น (Weak)", score: 10 },
      { label: "ท่าเดินผิดปกติ ลุกลำบาก เดินก้มหน้า (Impaired)", score: 20 },
    ],
  },
  {
    id: "adu_mental",
    label: "การรับรู้ (Mental status)",
    options: [
      { label: "รับรู้ความสามารถตนเอง (Orient to Own Ability)", score: 0 },
      { label: "ลืมข้อจำกัดความสามารถตน (Forget Limitations)", score: 15 },
    ],
  },
];

const adultFlags = [
  "A - Memory or cognitive impairment eg. Confusion, DELIRIUM, Brain surgery on this admission: Impaired vision",
  "B - HT and/or CVA or Heart disease (on this admission)",
  "C - Vertigo, Risk for postural hypotension or take medication with high fall risk",
];

// --- Obstetric (ตั้งครรภ์) — OFRAS ---
const obstetricCategories = [
  {
    id: "obs_group1",
    label: "1. ประวัติ",
    items: [
      {
        id: "obs_fall_history",
        label: "มีประวัติกลัดล้มก่อนมาพักรักษาตัวในโรงพยาบาล 3 เดือน",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 2 },
        ],
      },
      {
        id: "obs_sleep_history",
        label: "ประวัติการนอนหลับระหว่างการตั้งครรภ์",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 2 },
        ],
      },
      {
        id: "obs_vision",
        label: "ความบกพร่องทางสายตา",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 2 },
        ],
      },
    ],
  },
  {
    id: "obs_group2",
    label: "2. ระบบหัวใจและหลอดเลือด",
    items: [
      {
        id: "obs_hematocrit",
        label: "มีประวัติซีด ความเข้มข้นของเม็ดเลือดน้อยกว่า 30%",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 2 },
        ],
      },
      {
        id: "obs_eclampsia",
        label: "ประวัติครรภ์เป็นพิษ",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 2 },
        ],
      },
      {
        id: "obs_dizziness",
        label: "อาการเวียนศีรษะ",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 2 },
        ],
      },
      {
        id: "obs_sbp",
        label: "ความดันโลหิตต่ำกว่าที่ค่า SBP < 20 mmHg",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 3 },
        ],
      },
    ],
  },
  {
    id: "obs_group3",
    label: "3. ภาวะตกเลือด",
    items: [
      {
        id: "obs_low_platelet",
        label: "ได้รับการตรวจวินิจฉัยเป็นรกเกาะต่ำ",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 2 },
        ],
      },
      {
        id: "obs_abruption",
        label: "มีภาวะรกลอกหลุด",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 2 },
        ],
      },
      {
        id: "obs_postpartum",
        label: "มีภาวะตกเลือดหลังคลอด",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 3 },
        ],
      },
    ],
  },
  {
    id: "obs_group4",
    label: "4. ระบบประสาท/การใช้ยาชาระงับความรู้สึก",
    items: [
      {
        id: "obs_numbness",
        label: "มีอาการแขน ขาชา",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 1 },
        ],
      },
      {
        id: "obs_block",
        label: "ภายใน 3 ชั่วโมงหลังผ่าตัดคลอด/ผ่าตัด Block หลัง",
        options: [
          { label: "NO", score: 0 },
          { label: "YES", score: 3 },
        ],
      },
    ],
  },
  {
    id: "obs_group5",
    label: "5. การทำกิจกรรม",
    items: [
      {
        id: "obs_mobility",
        label: "การเคลื่อนไหวขา",
        options: [
          { label: "ขาเคลื่อนไหวได้ทั้ง 2 ข้าง (YES)", score: 0 },
          { label: "สามารถถยกขาขึ้นได้ แต่งอเข่าไม่ได้", score: 1 },
          { label: "ไม่สามารถถยกขาได้ 1 ข้าง", score: 2 },
          { label: "ไม่สามารถถยกขาได้ 2 ข้าง", score: 3 },
        ],
      },
    ],
  },
  {
    id: "obs_group6",
    label: "6. การใช้ยา",
    items: [
      {
        id: "obs_medication",
        label: "การรับยา",
        options: [
          {
            label: "ได้รับยาแก้ปวดแบบฉีดทาง IV, IM ภายใน 30 นาทีหลัง Admit",
            score: 1,
          },
          { label: "หลังจากได้รับยาความดันโลหิตสูง", score: 2 },
          { label: "หลังจากได้รับยาทั้งสองชนิดที่กล่าวข้างต้น", score: 3 },
        ],
      },
    ],
  },
];

function getPediatricRisk(score: number) {
  if (score >= 20) return "highly";
  if (score >= 12) return "strict";
  return "standard";
}

function getAdultRisk(score: number, hasFlag: boolean) {
  if (hasFlag || score > 50) return "highly";
  if (score >= 25) return "strict";
  return "standard";
}

function getObstetricRisk(score: number) {
  if (score > 5) return "highly";
  if (score >= 3) return "strict";
  return "standard";
}

const riskLabels: Record<string, string> = {
  standard: "Standard fall Precaution",
  strict: "Strict fall Precaution",
  highly: "Highly Strict fall Precaution",
};
function StatusModal({
  show,
  message,
  type,
  onClose,
}: {
  show: boolean;
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm"
        >
          ✕
        </button>
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl ${type === "success" ? "bg-green-100" : "bg-red-100"}`}
        >
          {type === "success" ? "✅" : "❌"}
        </div>
        <p className="font-medium text-base text-gray-900 mb-1">
          {type === "success" ? "สำเร็จ" : "เกิดข้อผิดพลาด"}
        </p>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <a
          href="/patient"
          className={`block w-full py-2.5 rounded-xl text-sm font-medium ${type === "success" ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
        >
          Back to Main Forms
        </a>
      </div>
    </div>
  );
}
function AutocompleteTextarea({
  value,
  onChange,
  wordBank,
  placeholder = "",
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  wordBank: string[];
  placeholder?: string;
  className?: string;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // ← track ว่า highlight อยู่ที่ไหน

  const getLastSegment = (text: string) => {
    // แยกด้วย comma หรือ newline — เอาส่วนสุดท้าย
    const parts = text.split(/,|\n/);
    return parts[parts.length - 1].trim();
  };

  const updateSuggestions = (text: string) => {
    const lastSeg = getLastSegment(text);
    if (lastSeg.length >= 1) {
      const filtered = wordBank.filter((w) =>
        w.toLowerCase().startsWith(lastSeg.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
    setActiveIndex(-1); // reset highlight ทุกครั้งที่พิมพ์
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    onChange(newVal);
    updateSuggestions(newVal);
  };

  const handleSelect = (word: string) => {
    // แทนที่ segment สุดท้ายด้วยคำที่เลือก แล้วต่อท้ายด้วย ", "
    const parts = value.split(/,|\n/);
    parts[parts.length - 1] = word;
    const newVal = parts.join(", ") + ", "; // ← เว้นให้พิมพ์ต่อได้เลย
    onChange(newVal);
    // อัปเดต suggestions สำหรับคำถัดไป (หลัง ", " segment ใหม่ว่างเปล่า)
    updateSuggestions(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault(); // ไม่ให้ขึ้นบรรทัดใหม่
      if (activeIndex >= 0) {
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        className={className}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder={placeholder}
      />
      {showDropdown && (
        <ul className="absolute z-50 left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={s}
              onMouseDown={() => handleSelect(s)}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                i === activeIndex
                  ? "bg-blue-500 text-white" // ← highlight อันที่เลือกอยู่
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PatientForm() {
  // ─── HIS patient (ดึงจาก URL param) ───
  const searchParams = useSearchParams();
  const hn = useActiveHN();

  const [hisPatient, setHisPatient] = useState<HISPatient | null>(null);
  const [hisLoading, setHisLoading] = useState(true);

  useEffect(() => {
    const fetchHIS = async () => {
      try {
        const res = await fetch(
          `/api/his-patient?hn=${encodeURIComponent(hn)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setHisPatient(data);
        }
      } catch {
        /* ใช้ fallback ด้านล่าง */
      } finally {
        setHisLoading(false);
      }
    };
    fetchHIS();
  }, [hn]);

  const [treatmentDetails, setTreatmentDetails] = useState<string>("");

  // ─── helper ───
  const patientHN = hisPatient?.hn_formatted ?? hisPatient?.hn ?? hn;
  const patientName = hisPatient
    ? [hisPatient.prename, hisPatient.firstname, hisPatient.lastname]
        .filter(Boolean)
        .join("")
    : "";
  const patientBirth = hisPatient?.birthdate ?? "-";
  const patientAdmit = hisPatient?.admit_date ?? hisPatient?.visit_date ?? "-";
  const patientGender = (() => {
    const g = hisPatient?.gender;
    if (!g) return "-";
    if (g === "M" || g === "1") return "Male";
    if (g === "F" || g === "2") return "Female";
    return g;
  })();
  const patientAllergy = hisPatient?.allergies?.join(", ") || "NKDA";

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [beforeSaved, setBeforeSaved] = useState(false);
  const [saveAfter, setSaveAfter] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraftSaved = useRef(false);
  const [subChecked, setSubChecked] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showModal = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setModal({ show: true, message, type });
  };

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const toggleSection = (id: string) => {
    const isChecked = checked[id] ?? false;
    const isActive = activeSection === id;

    if (!isChecked) {
      // ======================================
      // ยังไม่ติ๊ก → ติ๊ก + เปิด section
      // ======================================
      setChecked((prev) => ({ ...prev, [id]: true }));
      setActiveSection(id);
    } else if (isChecked && !isActive) {
      // ======================================
      // ติ๊กแล้ว แต่ section ปิดอยู่ → เปิด section
      // ไม่ untick
      // ======================================
      setActiveSection(id);
    } else if (isChecked && isActive) {
      // ======================================
      // ติ๊กแล้ว และ section เปิดอยู่ → ยุบ section
      // แต่ยังติ๊กน้ำเงินอยู่
      // ======================================
      setActiveSection(null);
    }
  };
  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const togglecheck = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleSub = (sectionId: string, sub: string) => {
    const key = `${sectionId}-${sub}`;
    setSubChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const handleInput = (sectionId: string, field: string, value: string) => {
    setValues((prev) => ({ ...prev, [`${sectionId}-${field}`]: value }));
  };

  const vitalSigns = [
    { key: "pr", label: "PR", unit: "bpm" },
    { key: "rr", label: "RR", unit: "breaths/min" },
    { key: "bp", label: "BP", unit: "mmHg" },
    { key: "spo2", label: "SpO2", unit: "%" },
  ];
  const [Cheif, setChief] = useState("");
  const [physio, setPhysio] = useState("");

  const barthel = [
    { key: "yes", label: "Yes" },
    { key: "no", label: "No" },
  ];
  const doctorList = [
    "เวนิช สว่างแสง",
    "พนิดา รุ่งพิบูลโสภิษฐ์",
    "พิชญา เพชรละเอียด",
    "ธนัชพร วิไลเลิศ",
    "ศิรดา เดิมคลัง",
    "ชัชนันท์ แก่เมือง",
    "จักษณา ชัยราม",
    "ชรินดา ถาวรวรกุล",
  ];

  const [precaution, setPrecaution] = useState("");
  const precautionoptions = [
    "Standard Precaution",
    "Airborne",
    "Droplet",
    "drug-Resistant",
    "Contact",
    "Protective",
  ];
  const goal = [
    { key: "short", label: "Short term goal" },
    { key: "long", label: "Long term goal" },
  ];
  const [checkbarthel, setCheckBarthel] = useState("");
  const physicalExam = sections.reduce(
    (acc, section) => {
      acc[section.id] = {
        checked: checked[section.id] ?? false,
        fields: section.fields.reduce(
          (fieldAcc, field) => {
            fieldAcc[field] = values[`${section.id}-${field}`] ?? "";
            return fieldAcc;
          },
          {} as Record<string, string>,
        ),
      };
      return acc;
    },
    {} as Record<string, { checked: boolean; fields: Record<string, string> }>,
  );

  const [value, setValue] = useState("");
  const [aftervalue, setAfterValue] = useState<Record<string, string>>({});
  const [afterchecked, setAfterChecked] = useState<Record<string, Boolean>>({});
  const [show, setShow] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [time2, setTime2] = useState("");
  const [room, setRoom] = useState("");
  const [doctor1, setDoctor1] = useState("");
  const [show1, setShow1] = useState(false);
  const [doctor2, setDoctor2] = useState("");
  const [show2, setShow2] = useState(false);
  const filtered1 = doctorList.filter((item) => item.includes(doctor1));
  const filtered2 = doctorList.filter((item) => item.includes(doctor2));
  const [transporation, setTransporation] = useState("");
  const option = ["walk", "wheelchair", "Stretcher", "Other"];
  const optionunderly: string[] = [
    "None",
    "Heart disease",
    "Cancer",
    "Diabetes Mellitus",
    "Hypertension",
    "Other",
  ];
  const [vitalData, setVitalData] = useState<Record<string, string>>({
    pr: "",
    rr: "",
    bp: "",
    spo2: "",
  });
  const [aftervitalData, setAftervitalData] = useState<Record<string, string>>({
    pr: "",
    rr: "",
    bp: "",
    spo2: "",
  });
  const [symtom, setSymtom] = useState<Record<string, string>>({
    chief: "",
    phisyo: "",
  });
  const [otherTran, setOtherTran] = useState("");
  const [underlying, setUnderlying] = useState<string[]>([]);
  const [dropdownUnder, setDropdownUnder] = useState(false);
  const [otherUnderly, setOtherUnderly] = useState("");
  const [pain, setPain] = useState("");
  const [painLocation, setPainLocation] = useState("");
  const painAssesment = [
    "Newborn - 1 year (NIPS)",
    ">1-3 years (FLACC)",
    "3-8 years (FRS)",
    ">8 years (NRS)",
    "CPOT (Critical care Pain Observation Tool)",
  ];
  const [painAssesmentTool, setPainAssesmentTool] = useState("");
  const cha = [
    "Prick",
    "Sharp",
    "Dull",
    "Burning",
    "Throbbing",
    "Tight",
    "Radiating",
    "Pin & Needles",
    "Other",
  ];
  const [characteristic, setCharacteristic] = useState<string[]>([]);
  const [chaDropdown, setChaDropdown] = useState(false);
  const [chaOther, setChaOther] = useState("");
  const [duration, setDuration] = useState("");
  const frequencyOptions = ["Constant", "Intermittent"];
  const [frequency, setFrequency] = useState("");
  // Fall risk mode & selections
  const [fallRiskMode, setFallRiskMode] = useState<
    "pediatric" | "adult" | "obstetric"
  >("pediatric");
  const [pedSelections, setPedSelections] = useState<Record<string, number>>(
    {},
  );
  const [aduSelections, setAduSelections] = useState<Record<string, number>>(
    {},
  );
  const [aduFlags, setAduFlags] = useState<Record<string, boolean>>({});
  const [obsSelections, setObsSelections] = useState<Record<string, number>>(
    {},
  );

  const pedTotal = Object.values(pedSelections).reduce((s, v) => s + v, 0);
  const aduTotal = Object.values(aduSelections).reduce((s, v) => s + v, 0);
  const aduHasFlag = Object.values(aduFlags).some(Boolean);
  const obsTotal = Object.values(obsSelections).reduce((s, v) => s + v, 0);

  const computedFallRisk =
    fallRiskMode === "pediatric"
      ? getPediatricRisk(pedTotal)
      : fallRiskMode === "adult"
        ? getAdultRisk(aduTotal, aduHasFlag)
        : getObstetricRisk(obsTotal);
  // const [fallRisk, setFallRisk] = useState("standard")

  const [shortgoal, setShortGoal] = useState("");
  const [longGoal, setLongGoal] = useState("");
  const [activeTab, setActiveTab] = useState<"before" | "after">("before");
  const [afterfallrisk, setAfterfallrisk] = useState("");
  const [afterpain, setAfterpain] = useState("");
  const suggestOption = [
    "การบริหารร่างกาย(P/I-BSI-024.1)",
    "การลดปวด(P/I-BSI-025.1)",
    "Fall",
    "การฝึกเดิน(P/I-BSI-023.1",
    "การเคาะปอด(P/I-BSI-022.1",
    "การออกกำลังกายในผู้ป่วยอัมพาต(P/I-BSI-017.)",
  ];
  const [suggest, setSuggest] = useState<string[]>([]);
  const [suggestDropdown, setSuggestDropdown] = useState(false);
  const statusop = ["รู้สึกดี", "ซึม", "สับสน", "ไม่รู้สึกตัว", "อื่น ๆ"];
  const [discharge, setDischarge] = useState("");
  const [otherDischarge, setOtherDischarge] = useState("");
  const [therapist, setTherapist] = useState("");
  const [afterdate, setAfterDate] = useState("");
  const [aftertime, setAfterTime] = useState("");
  const [afterfrequence, setAfterFrequence] = useState("");
  const [afterduration, setAfterDuration] = useState("");
  const [afterlocationpain, setAfterLocationPain] = useState("");
  const [afterpainAssesmentTool, setAfterPainAssesmentTool] = useState("");
  const [aftercharacter, setAfterCharacter] = useState<string[]>([]);
  const [afterothercharacter, setAfterOtherCharacter] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showTherapist, setShowTherapist] = useState(false);
  const filteredTherapist = doctorList.filter((item) =>
    item.toLowerCase().includes(therapist.toLowerCase()),
  );
  const [treatmentchecked, setTreatmentChecked] = useState<
    Record<string, boolean>
  >({});
  const getTreatmentItems = () => {
    return treatmentSection
      .filter((s) => checked[s.id])
      .map((s) => {
        const item: Record<string, any> = { id: s.id, label: s.label };
        if (s.subOptions && s.subOptions.length > 0) {
          item.subOptions = s.subOptions.filter(
            (sub) => subChecked[`${s.id}-${sub}`],
          );
        }
        if (s.fields && s.fields.length > 0) {
          item.fields = {};
          s.fields.forEach((field) => {
            if (s.id === "am" && field === "with") {
              // ← รวม checkbox selections + text ที่พิมพ์เอง
              const selected = ambWith.join(", ");
              const typed = values["am-with"] ?? "";
              item.fields[field] = [selected, typed].filter(Boolean).join(", ");
            } else {
              item.fields[field] = values[`${s.id}-${field}`] ?? "";
            }
          });
        }
        return item;
      });
  };
  const router = useRouter();
  const [visited, setVisited] = useState("");

  useEffect(() => {
    const checkBeforeSaved = async () => {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `/api/ipd?hn=${patientHN}&type=before&date=${today}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setBeforeSaved(!!data);
    };
    checkBeforeSaved();
  }, []);

  useEffect(() => {
    if (!hn) return;
    const prefillFromLastVisit = async () => {
      const res = await fetch(
        `/api/ipd?hn=${patientHN}&type=before&includeDraft=true`,
      );
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      setDiagnosis(data.diagnosis ?? "");
      setRoom(data.room ?? "");
      setDoctor1(data.doctor ?? "");
      setPain(data.pain_score ?? "");
      setPainLocation(data.location ?? "");
      setPainAssesmentTool(data.pain_assesment ?? "");
      setDuration(data.duration ?? "");
      setFrequency(data.frequence ?? "");
      setChief(data.chief ?? "");
      setPhysio(data.physio_precaution ?? "");
      setCheckBarthel(data.barthel ?? "");
      setShortGoal(data.short_goal ?? "");
      setLongGoal(data.long_goal ?? "");
      const rawVisit = data.physical_exam ?? "";
      const parsedVisit = (() => {
        // ถ้าขึ้นต้นด้วย " แสดงว่าถูก stringify มาแล้ว ให้ parse ออก
        try {
          if (typeof rawVisit === "string" && rawVisit.startsWith('"')) {
            const p = JSON.parse(rawVisit);
            return typeof p === "string" ? p : rawVisit;
          }
          return rawVisit;
        } catch {
          return rawVisit;
        }
      })();
      setVisited(parsedVisit);
      setTreatment(data.treatmentplan ?? "");
      setTreatmentDetails(data.treatment_detail_text_said);

      const rawCha = data.characteristic;
      const parsedCha: string[] = Array.isArray(rawCha)
        ? rawCha
        : (() => {
            try {
              const p = JSON.parse(rawCha ?? "[]");
              return Array.isArray(p) ? p : [];
            } catch {
              return [];
            }
          })();
      setCharacteristic(parsedCha);
      setPrecaution(data.precaution ?? "");

      const tranOptions = ["walk", "wheelchair", "Stretcher"];
      if (tranOptions.includes(data.transporation)) {
        setTransporation(data.transporation);
      } else if (data.transporation) {
        setTransporation("Other");
        setOtherTran(data.transporation);
      }

      const rawUnd = data.underly;
      const parsedUnd: string[] = Array.isArray(rawUnd)
        ? rawUnd
        : (() => {
            try {
              const p = JSON.parse(rawUnd ?? "[]");
              return Array.isArray(p) ? p : [];
            } catch {
              return [];
            }
          })();
      setUnderlying(parsedUnd);

      const vs =
        typeof data.vital_signs === "string"
          ? JSON.parse(data.vital_signs)
          : (data.vital_signs ?? {});
      setVitalData({
        pr: String(vs.pr ?? ""),
        rr: String(vs.rr ?? ""),
        bp: String(vs.bp ?? ""),
        spo2: String(vs.spo2 ?? ""),
      });

      const rawFall =
        typeof data.fall_risk_items === "string"
          ? JSON.parse(data.fall_risk_items)
          : (data.fall_risk_items ?? {});
      if (rawFall.mode) {
        setFallRiskMode(rawFall.mode);
        if (rawFall.mode === "pediatric" && rawFall.pediatric)
          setPedSelections(rawFall.pediatric);
        if (rawFall.mode === "adult") {
          if (rawFall.adult) setAduSelections(rawFall.adult);
          if (rawFall.flags) setAduFlags(rawFall.flags);
        }
        if (rawFall.mode === "obstetric" && rawFall.obstetric)
          setObsSelections(rawFall.obstetric);
      }

      const exam =
        typeof data.assesment === "string"
          ? JSON.parse(data.assesment)
          : data.assesment;
      if (exam) {
        const rChecked: Record<string, boolean> = {};
        const rVals: Record<string, string> = {};
        sections.forEach((s) => {
          rChecked[s.id] = exam[s.id]?.checked ?? false;
          s.fields.forEach((f) => {
            rVals[`${s.id}-${f}`] = exam[s.id]?.fields?.[f] ?? "";
          });
        });
        setChecked((prev) => ({ ...prev, ...rChecked }));
        setValues((prev) => ({ ...prev, ...rVals }));
      }

      const rawTreatment = data.treatmentplan;
      const treatments: any[] = Array.isArray(rawTreatment)
        ? rawTreatment
        : (() => {
            try {
              return JSON.parse(rawTreatment ?? "[]");
            } catch {
              return [];
            }
          })();
      const tChecked: Record<string, boolean> = {};
      const tSub: Record<string, boolean> = {};
      const tVals: Record<string, string> = {};
      treatments.forEach((t) => {
        tChecked[t.id] = true;
        t.subOptions?.forEach((sub: string) => {
          tSub[`${t.id}-${sub}`] = true;
        });
        Object.entries(t.fields ?? {}).forEach(([field, val]) => {
          tVals[`${t.id}-${field}`] = String(val);
        });
      });
      setChecked((prev) => ({ ...prev, ...tChecked }));
      setSubChecked((prev) => ({ ...prev, ...tSub }));
      setValues((prev) => ({ ...prev, ...tVals }));
    };

    prefillFromLastVisit();
  }, [patientHN]);

  useEffect(() => {
    if (activeTab !== "after") return;

    const fetchBeforeData = async () => {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `/api/ipd?hn=${patientHN}&type=before`, // ← เอา date ออก
      );
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      const vs =
        typeof data.vital_signs === "string"
          ? JSON.parse(data.vital_signs)
          : (data.vital_signs ?? {});
      setAftervitalData({
        pr: String(vs.pr ?? ""),
        rr: String(vs.rr ?? ""),
        bp: String(vs.bp ?? ""),
        spo2: String(vs.spo2 ?? ""),
      });

      setAfterfallrisk(data.fall_risk ?? "standard");
      setAfterpain(data.pain_score ?? "");
      setAfterDuration(data.duration ?? "");
      setAfterDate(data.visit_date ?? "");
      setAfterTime(data.visit_time ?? "");
      setAfterFrequence(data.frequence ?? "");
      setAfterLocationPain(data.location ?? "");
      setAfterPainAssesmentTool(data.pain_assesment ?? "");

      const rawCha = data.characteristic;
      const parsedCha: string[] = Array.isArray(rawCha)
        ? rawCha
        : (() => {
            try {
              const p = JSON.parse(rawCha ?? "[]");
              return Array.isArray(p) ? p : [];
            } catch {
              return [];
            }
          })();
      setAfterCharacter((prev) => (prev.length === 0 ? parsedCha : prev));

      setTransporation(
        typeof data.transporation === "string" ? data.transporation : "",
      );
      setUnderlying(
        Array.isArray(data.underly)
          ? data.underly
          : (() => {
              try {
                const p = JSON.parse(data.underly ?? "[]");
                return Array.isArray(p) ? p : [];
              } catch {
                return [];
              }
            })(),
      );

      const exam = data.physical_exam;
      if (exam) {
        const restoredChecked: Record<string, boolean> = {};
        const restoredValues: Record<string, string> = {};
        sections.forEach((section) => {
          restoredChecked[section.id] = exam[section.id]?.checked ?? false;
          section.fields.forEach((field) => {
            restoredValues[`${section.id}-${field}`] =
              exam[section.id]?.fields?.[field] ?? "";
          });
        });
        setAfterChecked(restoredChecked);
        setAfterValue(restoredValues);
      }
    };

    fetchBeforeData();
  }, [activeTab, patientHN]);

  const [treatment, setTreatment] = useState("");

  const [pdfPreview, setPdfPreview] = useState<{
    show: boolean;
    base64: string | null;
    loading: boolean;
    error: string | null;
    mode: "before" | "after";
  }>({
    show: false,
    base64: null,
    loading: false,
    error: null,
    mode: "before",
  });

  function buildBeforePdfPayload() {
    return {
      mode: "before" as const,
      patientName,
      dob: patientBirth,
      age: String(hisPatient?.age ?? ""),
      hn: patientHN,
      visitDate: patientAdmit,
      gender: patientGender,
      allergies: patientAllergy,
      date,
      time,
      doctor: doctor1,
      room,
      transportation: transporation === "Other" ? otherTran : transporation,
      pr: vitalData.pr,
      rr: vitalData.rr,
      bp: vitalData.bp,
      spo2: vitalData.spo2,
      chief: Cheif,
      diagnosis,
      physio_precaution: physio,
      underlying: underlying.includes("Other")
        ? [...underlying.filter((v) => v !== "Other"), otherUnderly].filter(
            Boolean,
          )
        : underlying,
      pain_score: pain,
      pain_location: painLocation,
      pain_assessment: painAssesmentTool,
      characteristic: characteristic.includes("Other")
        ? [...characteristic.filter((v) => v !== "Other"), chaOther].filter(
            Boolean,
          )
        : characteristic,
      duration,
      frequency,
      precautions: precaution ? [precaution] : [],
      fall_risk: computedFallRisk,
      fall_risk_mode: fallRiskMode,
      barthel: checkbarthel,
      visit_number: visited,
      assessment: physicalExam,
      treatment_plan: treatment,
      short_goal: shortgoal,
      long_goal: longGoal,
      treatment_items: getTreatmentItems(),
      // ← Treatment Detail field
    };
  }

  function buildAfterPdfPayload() {
    const afterAssessment = sections.reduce(
      (acc, section) => {
        if (!checked[section.id]) return acc;
        acc[section.id] = {
          checked: true,
          fields: section.fields.reduce(
            (f, field) => {
              f[field] = values[`${section.id}-${field}`] ?? "";
              return f;
            },
            {} as Record<string, string>,
          ),
        };
        return acc;
      },
      {} as Record<string, any>,
    );

    return {
      mode: "full" as const, // ← เปลี่ยนจาก "after"

      // ══ Patient info (เหมือนเดิม) ══
      patientName,
      dob: patientBirth,
      age: String(hisPatient?.age ?? ""),
      hn: patientHN,
      visitDate: patientAdmit,
      gender: patientGender,
      allergies: patientAllergy,

      // ══ BEFORE fields (merge เข้ามาใหม่) ══
      date,
      time,
      doctor: doctor1,
      room,
      transportation: transporation === "อื่น ๆ" ? otherTran : transporation,
      pr: vitalData.pr,
      rr: vitalData.rr,
      bp: vitalData.bp,
      spo2: vitalData.spo2,
      chief: Cheif,
      diagnosis,
      physio_precaution: physio,
      underlying: underlying.includes("Other")
        ? [...underlying.filter((v) => v !== "Other"), otherUnderly].filter(
            Boolean,
          )
        : underlying,
      pain_score: pain,
      pain_location: painLocation,
      pain_assessment: painAssesmentTool,
      characteristic: characteristic.includes("Other")
        ? [...characteristic.filter((v) => v !== "Other"), chaOther].filter(
            Boolean,
          )
        : characteristic,
      duration,
      frequency,
      precautions: precaution ? [precaution] : [],
      fall_risk: computedFallRisk,
      fall_risk_mode: fallRiskMode,
      barthel: checkbarthel,
      visit_number: visited,
      assessment: physicalExam,
      treatment_plan: treatment,
      short_goal: shortgoal,
      long_goal: longGoal,
      treatment_items: getTreatmentItems(),

      // ══ AFTER fields ══
      after_date: afterdate,
      after_time: time2,
      after_pr: aftervitalData.pr,
      after_rr: aftervitalData.rr,
      after_bp: aftervitalData.bp,
      after_spo2: aftervitalData.spo2,
      after_pain_score: afterpain,
      after_pain_location: afterlocationpain,
      after_pain_assessment: afterpainAssesmentTool,
      after_characteristic: aftercharacter.includes("Other")
        ? [
            ...aftercharacter.filter((v) => v !== "Other"),
            afterothercharacter,
          ].filter(Boolean)
        : aftercharacter,
      after_duration: afterduration,
      after_frequency: afterfrequence,
      after_assessment: afterAssessment,
      suggest,
      after_status: discharge === "อื่น ๆ" ? otherDischarge : discharge,
      therapist,
      treatment_detail_text_said: treatmentDetails,
    };
  }

  async function handlePreviewBefore() {
    setPdfPreview({
      show: true,
      base64: null,
      loading: true,
      error: null,
      mode: "before",
    });
    const result = await fetchPdfPreview("ipd", buildBeforePdfPayload());
    setPdfPreview({
      show: true,
      base64: result.ok ? result.pdf : null,
      loading: false,
      error: result.ok ? null : result.error,
      mode: "before",
    });
  }

  async function handlePreviewAfter() {
    setPdfPreview({
      show: true,
      base64: null,
      loading: true,
      error: null,
      mode: "after",
    });
    const result = await fetchPdfPreview("ipd", buildAfterPdfPayload());
    setPdfPreview({
      show: true,
      base64: result.ok ? result.pdf : null,
      loading: false,
      error: result.ok ? null : result.error,
      mode: "after",
    });
  }

  async function handleConfirmSave() {
    setPdfPreview((prev) => ({ ...prev, show: false }));
    if (pdfPreview.mode === "before") await handleSaveBefore();
    else await handleSaveAfter();
  }

  const handleSaveBefore = async () => {
    setSaving(true);

    try {
      const body = {
        hn: patientHN,
        type: "before",
        patientInfo: {
          hn: patientHN,
          name: patientName, // ดึงจาก state ที่ได้จาก HIS API
          gender: patientGender,
          dob: patientBirth,
          allergies: patientAllergy,
        },
        visit_date: date,
        visit_time: time,
        doctor: doctor1,
        diagnosis: diagnosis,
        precaution: precaution ? [precaution] : [],
        pain_score: pain,
        fall_risk: computedFallRisk,
        fall_risk_items: {
          mode: fallRiskMode,
          ...(fallRiskMode === "pediatric" && { pediatric: pedSelections }),
          ...(fallRiskMode === "adult" && {
            adult: aduSelections,
            flags: aduFlags,
          }),
          ...(fallRiskMode === "obstetric" && { obstetric: obsSelections }),
        },
        room,
        transporation: transporation === "Other" ? otherTran : transporation,
        underly: underlying.includes("Other")
          ? [...underlying.filter((v) => v !== "Other"), otherUnderly].filter(
              Boolean,
            )
          : underlying,
        vital_signs: {
          pr: vitalData.pr,
          rr: vitalData.rr,
          bp: vitalData.bp,
          spo2: vitalData.spo2,
        },
        chief: Cheif,
        physio_precaution: physio,
        location: painLocation,
        pain_assesment: painAssesmentTool,
        characteristic: characteristic.includes("Other")
          ? [...characteristic.filter((v) => v !== "Other"), chaOther].filter(
              Boolean,
            )
          : characteristic,
        duration,
        frequence: frequency,
        barthel: checkbarthel,
        physical_exam: visited,
        assesment: physicalExam,
        treatmentplan: treatment,
        short_goal: shortgoal,
        long_goal: longGoal,
        status: "saved",
      };

      const res = await fetch("/api/ipd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (!res.ok) {
        showModal("เกิดข้อผิดพลาด: " + result.error, "error");
        return;
      }

      // upsert patient list (silent)
      fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hn: patientHN,
          hn_formatted: hisPatient?.hn_formatted ?? patientHN,
          name: patientName,
          gender: hisPatient?.gender ?? "",
          age: hisPatient?.age ?? null,
          birthdate: patientBirth,
          admit_date: patientAdmit,
          allergies: hisPatient?.allergies ?? [],
        }),
      }).catch(() => {});

      setBeforeSaved(true);
      setActiveTab("after");
      window.scrollTo({ top: 0, behavior: "smooth" });
      showModal("บันทึกข้อมูลสำเร็จ!");
    } catch (error) {
      console.error(error);
      showModal("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } finally {
      setSaving(false);
    }
  };

  const autoSaveDraft = async () => {
    // ไม่ save ถ้ายังไม่มี HN หรือ save จริงไปแล้ว
    //if (!patientHN || beforeSaved) return

    setAutoSaveStatus("saving");
    try {
      const body = {
        hn: patientHN,
        type: "before",
        status: "draft",
        visit_date: date,
        visit_time: time,
        doctor: doctor1,
        diagnosis: diagnosis,
        pain_score: pain,
        room: room,
        chief: Cheif,
        precaution: precaution ? [precaution] : [],
        physio_precaution: physio,
        location: painLocation,
        pain_assesment: painAssesmentTool,
        // ✅ เพิ่ม characteristic ที่หายไป
        characteristic: characteristic.includes("Other")
          ? [...characteristic.filter((v) => v !== "Other"), chaOther].filter(
              Boolean,
            )
          : characteristic,
        duration: duration,
        frequence: frequency,

        barthel: checkbarthel,
        physical_exam: visited,
        assesment: physicalExam,
        treatmentplan: treatment,
        short_goal: shortgoal,
        long_goal: longGoal,
        transporation: transporation === "Other" ? otherTran : transporation,
        underly: underlying.includes("Other")
          ? [...underlying.filter((v) => v !== "Other"), otherUnderly].filter(
              Boolean,
            )
          : underlying,
        vital_signs: {
          pr: vitalData.pr,
          rr: vitalData.rr,
          bp: vitalData.bp,
          spo2: vitalData.spo2,
        },
        fall_risk: computedFallRisk,
        fall_risk_items: {
          mode: fallRiskMode,
          ...(fallRiskMode === "pediatric" && { pediatric: pedSelections }),
          ...(fallRiskMode === "adult" && {
            adult: aduSelections,
            flags: aduFlags,
          }),
          ...(fallRiskMode === "obstetric" && { obstetric: obsSelections }),
        },
      };

      await fetch("/api/ipd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      isDraftSaved.current = true;
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus("idle"), 3000); // หาย 3 วิ
    } catch {
      setAutoSaveStatus("idle");
    }
  };
  useEffect(() => {
    //if (!patientHN || beforeSaved) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      autoSaveDraft();
    }, 10000); // auto save ทุก 10 วิ หลังจากหยุดพิมพ์

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [
    // ใส่ state ทั้งหมดที่อยากให้ trigger auto save
    date,
    time,
    doctor1,
    diagnosis,
    pain,
    room,
    Cheif,
    physio,
    painLocation,
    duration,
    frequency,
    checkbarthel,
    visited,
    treatment,
    shortgoal,
    longGoal,
    transporation,
    underlying,
  ]);

  const handleSaveAfter = async () => {
    setSaving(true);

    try {
      const body = {
        hn: patientHN,
        type: "after",
        patientInfo: {
          hn: patientHN,
          name: patientName, // ดึงจาก state ที่ได้จาก HIS API
          gender: patientGender,
          dob: patientBirth,
          allergies: patientAllergy,
        },
        status: "saved",
        visit_date: new Date().toISOString().split("T")[0],
        visit_time: time2,
        physical_exam: physicalExam,
        pain_score: afterpain,
        frequence: afterfrequence,
        duration: afterduration,
        fall_risk: computedFallRisk,
        vital_signs: {
          pr: aftervitalData.pr,
          rr: aftervitalData.rr,
          bp: aftervitalData.bp,
          spo2: aftervitalData.spo2,
        },

        precaution: precaution ? [precaution] : [],
        location: afterlocationpain,
        pain_assesment: afterpainAssesmentTool,
        characteristic: aftercharacter.includes("Other")
          ? [
              ...aftercharacter.filter((v) => v !== "Other"),
              afterothercharacter,
            ].filter(Boolean)
          : aftercharacter,
        suggest,
        after_status: discharge === "อื่น ๆ" ? otherDischarge : discharge,
        therapist,
        treatment_detail_text_said: treatmentDetails,
        treatment_items: getTreatmentItems(),
        treatment_detail: treatmentSection
          .filter((s) => checked[s.id])
          .reduce(
            (acc, s) => {
              acc[s.id] = {
                subOptions: s.subOptions?.filter(
                  (sub) => subChecked[`${s.id}-${sub}`],
                ),
                fields: s.fields.reduce(
                  (f, field) => {
                    f[field] = values[`${s.id}-${field}`] ?? "";
                    return f;
                  },
                  {} as Record<string, string>,
                ),
              };
              return acc;
            },
            {} as Record<string, any>,
          ),
      };

      const res = await fetch("/api/ipd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();

      if (!res.ok) showModal("เกิดข้อผิดพลาด: " + result.error, "error");
      else showModal("บันทึกข้อมูลสำเร็จ!");
    } catch (err: any) {
      setSaving(false);
    }
  };

  const ambWithOptions = ["Cane", "Crutches", "Walker", "Canadian Crutches"];
  const [ambWith, setAmbWith] = useState<string[]>([]);
  const [ambWithOther, setAmbWithOther] = useState("");
  const [ambWithDropdownOpen, setAmbWithDropdownOpen] = useState(false);

  // ============================================================
  // AUTOCOMPLETE WORD BANK
  // ============================================================
  const chiefComplaintWords = [
    "Pain at",
    "Limit ROM at",
    "Secretion Retention",
    "Poor Ambulation",
    "Faired Ambulation",
    "Poor Ventilation",
    "Muscle Weakness",
    "Right",
    "Left",
    "Both",
    "Neck",
    "Shoulder",
    "Elbow",
    "Wrist",
    "Hand",
    "Finger",
    "Hip",
    "Knee",
    "Ankle",
    "Chest",
    "Thigh",
    "Back",
    "Thorax",
    "Foot",
  ];

  const locationWords = [
    "Pain at",
    "Limit ROM at",
    "Right",
    "Left",
    "Both",
    "Neck",
    "Shoulder",
    "Elbow",
    "Wrist",
    "Hand",
    "Finger",
    "Hip",
    "Knee",
    "Ankle",
    "Chest",
    "Thigh",
    "Back",
    "Thorax",
    "Foot",
  ];

  const physioWords = ["Dyspnea", "Fall", "Progressive Pain", "None"];

  const treatmentPlanWords = [
    "Pain Relief",
    "Increase ROM",
    "Improve ambulation",
    "Secretion Clearance",
    "Correct Gait Pattern",
    "Improve Ventilation",
    "Improve Breathing pattern",
    "Increase muscle power",
    "Maintain ROM",
    "Maintain muscle power",
    "Prevent Complication",
  ];

  const shortGoalWords = [
    "Pain Relief ≤ 2 within",
    "Improve Ambulation within",
    "Increase ROM within",
    "Secretion Clearance within",
    "Correct Gait Pattern within",
    "Improve Ventilation within",
    "Normal ADL within",
    "Normal lung function within",
    "Improve Breathing pattern within",
    "Increase muscle power within",
    "Maintain ROM without pain",
    "Maintain muscle power within",
    "Prevent complication within",
  ];

  const longGoalWords = [
    "Normal ADL",
    "Normal lung function",
    "Normal Ambulation",
    "Pain Relief",
    "Full ROM",
    "Increase muscle power",
    "Prevent complication",
  ];

  // ============================================================
  // SECTION FIELD WORD BANK — แยกตาม sectionId + fieldName
  // ============================================================
  const sectionFieldWords: Record<string, Record<string, string[]>> = {
    orthopedics: {
      Observation: [
        "On Knee Brace",
        "On Jewett Brace",
        "On Taylor Brace",
        "On Lumbar support",
        "Normal",
        "Swelling",
      ],
      Palpation: [
        "Tenderness",
        "Swelling",
        "Bruise",
        "Tightness",
        "Tension",
        "Normal",
      ],
      "Muscle power": ["Depend on pain", "Normal"],
      "Range of Motion": ["Limit by pain", "Full ROM"],
      Sensation: ["Intact", "Impair", "Loss"],
      "Functional movement": ["Pain on movement", "No Pain on movement"],
    },
    cardiopulmonary: {
      Observation: [
        "On ICD",
        "On Oxygen Cannula",
        "On Oxygen Mask",
        "On High flow",
        "On ET tube",
        "On Tracheostomy",
        "On Foley Catheter",
        "On IV line",
        "Normal",
      ],
      Palpation: [
        "Normal Chest movement",
        "Normal Chest Expansion",
        "Decrease Chest movement",
        "Decrease Chest Expansion",
        "Symmetrical Chest Expansion",
      ],
      Percussion: ["Dullness", "Resonance", "Hyperesonance"],
      Auscultation: [
        "Normal Breath sound",
        "Decrease Breath sound",
        "Secretion sound",
        "Wheezing Sound",
        "Crepitation Sound",
      ],
    },
    neurology: {
      Observation: [
        "On NG",
        "On Shoulder Support",
        "On Foley Catheter",
        "Normal",
        "Abnormal Gait Pattern",
      ],
      "Muscle Tone": ["Normal", "Flaccid Tone", "Hypotone", "Hypertone"],
      Balance: [
        "Normal Static Sitting Balance",
        "Normal Static Standing Balance",
        "Normal Dynamic Sitting Balance",
        "Normal Dynamic Standing Balance",
        "Good",
        "Fair",
        "Poor",
        "Loss",
      ],
      "Bad mobility and Transfering": [
        "Independent",
        "Minimal Assistance",
        "Moderate Assistance",
        "Maximum Assistance",
        "Contact Guarding",
        "Close Guarding",
        "Supervision",
      ],
      "Muscle Power": [
        "Muscle Grade I",
        "Muscle Grade II",
        "Muscle Grade III",
        "Muscle Grade IV",
        "Muscle Grade V",
        "Muscle Grade 0",
      ],
      Sensation: ["Intact", "Impair", "Loss"],
    },
  };

  const AftersectionFieldWords: Record<string, Record<string, string[]>> = {
    orthopedics: {
      Observation: [
        "On Knee Brace",
        "On Jewett Brace",
        "On Taylor Brace",
        "On Lumbar support",
        "On Lumbar support",
        "Normal",
      ],
      Palpation: ["Less Tender", "Improving", "Normal"],
      "Muscle power": ["Improving", "Normal"],
      "Range of Motion": ["Normal", "Improving"],
      Sensation: ["Intact", "Impair", "Loss"],
      "Functional movement": ["Normal", "Improving"],
    },
    cardiopulmonary: {
      Observation: [
        "On ICD",
        "On Oxygen Cannula",
        "On Oxygen Mask",
        "On High flow",
        "On ET tube",
        "On Tracheostomy",
        "On Foley Catheter",
        "On IV line",
        "Normal",
      ],
      Palpation: [
        "Normal Chest movement",
        "Normal Chest Expansion",
        "Improving",
      ],
      Percussion: ["Normal", "Improving"],
      Auscultation: ["Normal", "Improving"],
    },
    neurology: {
      Observation: [
        "On NG",
        "On Shoulder Support",
        "On Foley Catheter",
        "Normal",
        "Abnormal Gait Pattern",
      ],
      "Muscle Tone": ["Normal", "Improving"],
      Balance: ["Normal", "Improving"],
      "Bad mobility and Transfering": ["Independent", "Improving"],
      "Muscle Power": ["Improving"],
      Sensation: ["Intact", "Impair", "Loss"],
    },
  };
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <StatusModal
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal((prev) => ({ ...prev, show: false }))}
      />
      <nav className="bg-white flex justify-start sticky top-0 z-50">
        <div className="flex items-center gap-5 bg-white w-full px-6 py-4 shadow-sm">
          <Image
            src="/Hospital logo.svg"
            alt="Hospital Logo"
            width={100}
            height={50}
          ></Image>
          <a
            href="/"
            className="ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors"
          >
            Home
          </a>
          <a
            href="/patient"
            className="ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors"
          >
            Patient Form
          </a>
          <a
            href="/otherform"
            className="ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors"
          >
            Other Forms
          </a>
          <a
            href="/patientlist"
            className="ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors"
          >
            Patient List
          </a>
          <a
            href="/record"
            className="ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors"
          >
            View All Records
          </a>
          <div className="ml-auto flex items-center gap-2">
            {autoSaveStatus === "saving" && (
              <>
                <svg
                  className="w-4 h-4 text-gray-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span className="text-xs text-gray-400">กำลังบันทึก...</span>
              </>
            )}
            {autoSaveStatus === "saved" && (
              <>
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-xs text-green-500">Auto saved</span>
              </>
            )}
          </div>
        </div>
      </nav>
      <p className="p-2"></p>
      <div className="bg-white rounded-2xl mx-auto w-300 p-4 shadow-md border-t-4 border-blue-500">
        {hisLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-100 rounded w-32" />
            <div className="h-4 bg-gray-100 rounded w-40" />
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-blue-500">
              {patientName || "ไม่พบข้อมูลผู้ป่วย"}
            </h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-blue-800 font-bold">HN</p>
              <p className="text-gray-700">{patientHN}</p>

              <p className="text-blue-800 font-bold">Date of Birth</p>
              <p className="text-gray-700">{patientBirth}</p>

              <p className="text-blue-800 font-bold">Admit</p>
              <p className="text-gray-700">{patientAdmit}</p>

              <p className="text-blue-800 font-bold">Gender</p>
              <p className="text-gray-700">{patientGender}</p>

              <p className="text-blue-800 font-bold">Allergies</p>
              <p className="text-gray-700">{patientAllergy}</p>
            </div>
          </>
        )}
      </div>
      <p className="p-4"></p>
      {/* ----------------------------------------------------------------------------------------------------- */}

      <div className="bg-white rounded-2xl mx-auto w-300 p-4 shadow-md">
        <div className="flex justify-center mb-6">
          <div
            className="inline-flex rounded-lg shadow-xs -space-x-px"
            role="group"
          >
            {/* Before button */}
            <button
              type="button"
              onClick={() => setActiveTab("before")}
              className={`font-medium text-sm px-6 py-2 rounded-l-lg border transition-colors ${
                activeTab === "before"
                  ? "bg-blue-500 text-white border-blue-500" // active → น้ำเงิน
                  : "bg-gray-200 text-gray-500 border-gray-300" // inactive → เทา
              }`}
            >
              Before
            </button>

            {/* After button */}
            <button
              type="button"
              onClick={() => setActiveTab("after")}
              className={`font-medium text-sm px-6 py-2 rounded-r-lg border transition-colors ${
                activeTab === "after"
                  ? "bg-blue-500 text-white border-blue-500" // inactive แต่กดได้ → เทา
                  : "bg-gray-200 text-gray-500 border-gray-200" // ยังกดไม่ได้
              }`}
            >
              After
            </button>
          </div>
        </div>

        {activeTab === "before" && (
          <div>
            <div className="text-base text-gray-500 p-2">
              Diagnosis
              <input
                className="border border-gray-300 rounded-lg px-3 w-80 py-2 text-sm text-gray-500 ml-4 focus:outline-none focus:border-blue-400"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                // // ======================================
                // // onChange — ทุกครั้งที่พิมพ์ เรียก handleInput
                // // e.target.value คือค่าที่พิมพ์ล่าสุด
                // // ======================================
              />
            </div>
            <div className="flex flex-col gap-3">
              {sections.map((section) => {
                // isChecked — ดูว่า section นี้ติ๊กอยู่ไหม
                // ถ้า undefined ให้ถือว่า false
                const isChecked = checked[section.id] ?? false;

                return (
                  <div key={section.id}>
                    {/* ======================================
                  Header row ของแต่ละ section
                  สีเปลี่ยนตาม isChecked
                  ====================================== */}
                    <div
                      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200 ${
                        isChecked
                          ? "bg-green-100 border border-green-400" // ติ๊กแล้ว → เขียว
                          : "bg-gray-100 border border-gray-300" // ยังไม่ติ๊ก → เทา
                      }`}
                      onClick={() => toggle(section.id)} // กดที่แถวเพื่อ toggle
                    >
                      {/* ซ้าย: checkbox + label */}
                      <div className="flex items-center gap-3">
                        {/* Checkbox — เปลี่ยนสีตาม isChecked */}
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors duration-400 ${
                            isChecked
                              ? "bg-green-500 border-green-500" // ติ๊ก → เขียว
                              : "bg-white border-gray-400" // ไม่ติ๊ก → ขาว
                          }`}
                        >
                          {/* checkmark — แสดงเฉพาะตอนติ๊ก */}
                          {isChecked && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>

                        {/* ชื่อ section */}
                        <div>
                          <p
                            className={`font-medium ${isChecked ? "text-green-700" : "text-gray-500"}`}
                          >
                            {section.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            if condition applied to
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ======================================
                  Input fields ข้างใน
                  แสดงเฉพาะตอน isChecked === true
                  isChecked && <div> คือ ถ้าจริงถึงแสดง
                  ====================================== */}
                    {isChecked && (
                      <div className="border border-green-300 border-t-0 rounded-b-xl px-6 py-4 bg-white flex flex-col gap-3">
                        {section.fields.map((field) => (
                          <div key={field} className="flex items-center gap-4">
                            {/* Label ซ้าย */}
                            <label className="text-sm text-gray-500 w-32 shrink-0">
                              {field}
                            </label>

                            {/* Input ขวา */}
                            <AutocompleteTextarea
                              value={values[`${section.id}-${field}`] ?? ""}
                              onChange={(val) =>
                                handleInput(section.id, field, val)
                              }
                              wordBank={
                                sectionFieldWords[section.id]?.[field] ?? []
                              }
                              placeholder={`กรอก ${field}`}
                              className="flex-1 border border-gray-300 text-gray-500 w-full rounded-lg px-3 text-sm focus:outline-none focus:border-green-400 resize-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex items-end gap-7 mt-6 ml-4 w-full pr-4">
                {/* Date */}
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm text-gray-500">Date</label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Time */}
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm text-gray-500">Time</label>
                  <input
                    type="time"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                {/* VN */}
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm text-gray-500">Room</label>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                  />
                </div>
                {/* Doctor */}
                <div className="flex flex-col gap-1 flex-1 relative">
                  {" "}
                  {/* ← เพิ่ม relative */}
                  <label className="text-sm text-gray-500">Doctor</label>
                  <input
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                    value={doctor1}
                    onChange={(e) => {
                      setDoctor1(e.target.value);
                      setShow1(true);
                    }}
                    onBlur={() => setTimeout(() => setShow1(false), 150)}
                  />
                  {/* dropdown ลอยอยู่ใต้ input ไม่บัง */}
                  {show1 && doctor1 && filtered1.length > 0 && (
                    <div className="absolute top-full left-0 z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {filtered1.map((item) => (
                        <div
                          key={item}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                          onClick={() => {
                            setDoctor1(item);
                            setShow1(false);
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                  {show2 && doctor2 && filtered2.length === 0 && (
                    <div className="absolute top-full left-0 z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                      <div className="px-4 py-2 text-sm text-gray-400">
                        ไม่พบข้อมูล
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* transportation */}
              <div className="flex items-end gap-7 mt-10 ml-4 w-full pr-4">
                <div className="text-base font-medium text-gray-500">
                  Transporation
                </div>
                <div className="flex gap-2 items-end w-full">
                  {option.map((option) => (
                    <label
                      key={option}
                      className="flex w-full items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="Transportation"
                        value={option}
                        checked={transporation === option}
                        onChange={(e) => setTransporation(e.target.value)}
                        className="w-4 h-4 accent-blue-500"
                      />
                      <span className="text-sm text-gray-500">{option}</span>
                      {option === "Other" && transporation === "Other" && (
                        <input
                          className="border border-gray-300 rounded-lg text-gray-500 px-3 py-1 text-sm focus:outline-none focus:border-blue-400 w-48"
                          placeholder="โปรดระบุ..."
                          value={otherTran}
                          onChange={(e) => setOtherTran(e.target.value)}
                          autoFocus
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-6 mt-10 ml-4 w-full pr-4">
                {vitalSigns.map((item) => (
                  <div key={item.key} className="flex flex-col gap-1">
                    <label className="text-sm text-gray-500">
                      {item.label}
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        className="w-20 border border-gray-300 text-gray-500 w-full ml-6 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                        value={vitalData[item.key as keyof typeof vitalData]}
                        onChange={(e) =>
                          setVitalData({
                            ...vitalData,
                            [item.key]: e.target.value,
                          })
                        }
                      />
                      <span className="text-sm text-gray-400">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1 pl-4">
                <label className="text-sm text-gray-500 mt-10">
                  Chief Complaint
                </label>
                <div className="flex items-center gap-2">
                  <AutocompleteTextarea
                    value={Cheif}
                    onChange={setChief}
                    wordBank={chiefComplaintWords}
                    placeholder="พิมพ์เพื่อค้นหา..."
                    className="border border-gray-300 rounded-lg py-3 px-3 w-full text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 pl-4">
                <label className="text-sm text-gray-500 mt-10">
                  Physiotherapy Precaution
                </label>
                <div className="flex items-center gap-2">
                  <AutocompleteTextarea
                    value={physio}
                    onChange={setPhysio}
                    wordBank={physioWords}
                    placeholder="พิมพ์เพื่อค้นหา..."
                    className="border border-gray-300 rounded-lg py-3 px-3 w-full text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex gap-6 mt-10 mx-auto w-full px-4">
                {/* Underlying Precaution */}
                <div className="flex flex-col gap-1">
                  <label className="text-medium text-gray-500">
                    Underlying Precaution
                  </label>

                  {/* Trigger button */}
                  <div className="relative w-80">
                    <button
                      type="button"
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-500 bg-white text-left flex justify-between items-center"
                      onClick={() => setDropdownUnder((prev) => !prev)}
                    >
                      <span className="truncate">
                        {underlying.length === 0
                          ? "-- Select --"
                          : underlying.join(", ")}
                      </span>
                      <span className="ml-2 text-gray-400">▾</span>
                    </button>

                    {/* Dropdown list */}
                    {dropdownUnder && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-48 overflow-y-auto">
                        {optionunderly.map((item) => (
                          <label
                            key={item}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={underlying.includes(item)}
                              onChange={() => {
                                setUnderlying(
                                  (prev) =>
                                    prev.includes(item)
                                      ? prev.filter((v) => v !== item) // ถ้ามีแล้ว → เอาออก
                                      : [...prev, item], // ถ้าไม่มี → เพิ่ม
                                );
                              }}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Other input */}
                  {underlying.includes("Other") && (
                    <input
                      className="border border-gray-300 rounded-lg px-3 w-80 py-1.5 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                      value={otherUnderly}
                      onChange={(e) => setOtherUnderly(e.target.value)}
                      placeholder="Please specify..."
                      autoFocus
                    />
                  )}
                </div>
                {/* Pain Score */}
                <div className="flex flex-col gap-1 ml-12">
                  <label className="text-sm text-gray-500">Pain Score</label>
                  <input
                    className="border border-gray-300 rounded-lg px-3 w-80 py-1.5 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                    type="text"
                    value={pain}
                    onChange={(e) => setPain(e.target.value)}
                  />
                </div>
                {/* Location of Pain */}
                <div className="flex flex-col gap-1 ml-12">
                  <label className="text-medium text-gray-500 ">
                    Location of Pain
                  </label>
                  <AutocompleteTextarea
                    value={painLocation}
                    onChange={setPainLocation}
                    wordBank={locationWords}
                    placeholder="พิมพ์เพื่อค้นหา..."
                    className="border border-gray-300 rounded-lg py-0.2 px-3 w-80 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex gap-1 p-4 mt-10 w-full">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-500">
                    Pain Assesment tool
                  </label>
                  <select
                    className="border border-gray-300 w-80 rounded-lg px-3 py-1.5 text-sm text-gray-500"
                    value={painAssesmentTool}
                    onChange={(e) => setPainAssesmentTool(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {painAssesment.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col ml-17">
                  <label className="text-medium text-gray-500">
                    Characteristic
                  </label>

                  {/* Trigger button */}
                  <div className="relative w-80">
                    <button
                      type="button"
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-500 bg-white text-left flex justify-between items-center"
                      onClick={() => setChaDropdown((prev) => !prev)}
                    >
                      <span className="truncate">
                        {characteristic.length === 0
                          ? "-- Select --"
                          : characteristic.join(", ")}
                      </span>
                      <span className="ml-2 text-gray-400">▾</span>
                    </button>

                    {/* Dropdown list */}
                    {chaDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-48 overflow-y-auto">
                        {cha.map((item) => (
                          <label
                            key={item}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={characteristic.includes(item)}
                              onChange={() => {
                                setCharacteristic(
                                  (prev) =>
                                    prev.includes(item)
                                      ? prev.filter((v) => v !== item) // ถ้ามีแล้ว → เอาออก
                                      : [...prev, item], // ถ้าไม่มี → เพิ่ม
                                );
                              }}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Other input */}
                  {characteristic.includes("Other") && (
                    <input
                      className="border border-gray-300 rounded-lg px-3 w-80 py-1.5 text-gray-500 text-sm focus:outline-none focus:border-blue-400"
                      value={chaOther}
                      onChange={(e) => setChaOther(e.target.value)}
                      placeholder="Please specify..."
                      autoFocus
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1 ml-17">
                  <label className="text-sm text-gray-500">Duration</label>
                  <input
                    className="border border-gray-300 text-sm text-gray-500 rounded-lg px-3 py-1.5 w-80 focus:outline-none focus:border-blue-400"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex p-4 gap-4 mt-10">
                <div className="flex gap-4 w-2/3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-medium text-gray-500">
                      Frequency
                    </label>
                    <select
                      className="border border-gray-300 rounded-lg w-full text-sm text-gray-500 px-3 py-1.5 focus:outline-none focus:border-blue-400"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                    >
                      <option value="">--Select--</option>
                      {frequencyOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-medium text-gray-500">
                      Precaution
                    </label>
                    <select
                      className="border border-gray-300 rounded-lg w-full text-sm text-gray-500 px-3 py-1.5 focus:outline-none focus:border-blue-400"
                      value={precaution}
                      onChange={(e) => setPrecaution(e.target.value)}
                    >
                      <option value="">--Select--</option>
                      {precautionoptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Fall risk */}
            {/* Fall risk */}
            <div className="flex flex-col mt-10 gap-4 w-full px-4">
              {/* Toggle 3 โหมด */}
              <div className="flex gap-2">
                {(["pediatric", "adult", "obstetric"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setFallRiskMode(mode)}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors cursor-pointer ${
                      fallRiskMode === mode
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {mode === "pediatric"
                      ? "Pediatric Age < 15 years"
                      : mode === "adult"
                        ? "Adult Age ≥ 15 years"
                        : "ผู้ป่วยตั้งครรภ์และหลังคลอด 6 สัปดาห์"}
                  </button>
                ))}
              </div>

              {/* ====== PEDIATRIC ====== */}
              {fallRiskMode === "pediatric" && (
                <div className="flex flex-col gap-3">
                  {pediatricCategories.map((cat) => (
                    <div key={cat.id} className="border rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-3">{cat.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.options.map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            suppressHydrationWarning
                            onClick={() =>
                              setPedSelections((prev) => ({
                                ...prev,
                                [cat.id]: opt.score,
                              }))
                            }
                            className={`px-4 py-2 rounded-full border text-sm transition-colors cursor-pointer ${
                              pedSelections[cat.id] === opt.score
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">Total</p>
                    <p className="text-lg font-bold text-gray-800">
                      {pedTotal}
                    </p>
                  </div>
                </div>
              )}

              {/* ====== ADULT ====== */}
              {fallRiskMode === "adult" && (
                <div className="flex flex-col gap-3">
                  {/* Flags A, B, C */}
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <p className="text-sm text-gray-500 mb-3">
                      Flags — ถ้าติ๊กข้อใดข้อหนึ่ง = Highly Strict ทันที
                    </p>
                    <div className="flex flex-col gap-2">
                      {adultFlags.map((flag) => (
                        <label
                          key={flag}
                          className="flex items-start gap-2 cursor-pointer text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 accent-blue-500"
                            checked={aduFlags[flag] ?? false}
                            onChange={() =>
                              setAduFlags((prev) => ({
                                ...prev,
                                [flag]: !prev[flag],
                              }))
                            }
                          />
                          {flag}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Categories */}
                  {adultCategories.map((cat) => (
                    <div key={cat.id} className="border rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-3">{cat.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.options.map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            suppressHydrationWarning
                            onClick={() =>
                              setAduSelections((prev) => ({
                                ...prev,
                                [cat.id]: opt.score,
                              }))
                            }
                            className={`px-4 py-2 rounded-full border text-sm transition-colors cursor-pointer ${
                              aduSelections[cat.id] === opt.score
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                            }`}
                          >
                            {opt.label}{" "}
                            {opt.score > 0 && (
                              <span className="text-xs opacity-70">
                                ({opt.score})
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">
                      Total Score
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {aduTotal}
                    </p>
                  </div>
                </div>
              )}

              {/* ====== OBSTETRIC ====== */}
              {fallRiskMode === "obstetric" && (
                <div className="flex flex-col gap-3">
                  {obstetricCategories.map((group) => (
                    <div key={group.id} className="border rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        {group.label}
                      </p>
                      <div className="flex flex-col gap-4">
                        {group.items.map((item) => (
                          <div key={item.id}>
                            <p className="text-sm text-gray-500 mb-2">
                              {item.label}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {item.options.map((opt) => (
                                <button
                                  key={opt.label}
                                  type="button"
                                  suppressHydrationWarning
                                  onClick={() =>
                                    setObsSelections((prev) => ({
                                      ...prev,
                                      [item.id]: opt.score,
                                    }))
                                  }
                                  className={`px-4 py-2 rounded-full border text-sm transition-colors cursor-pointer ${
                                    obsSelections[item.id] === opt.score
                                      ? "bg-blue-500 text-white border-blue-500"
                                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">
                      Total Score
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {obsTotal}
                    </p>
                  </div>
                </div>
              )}

              {/* Result */}
              <div className="flex gap-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mr-4">Fall risk</p>
                {["standard", "strict", "highly"].map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-2 pointer-events-none"
                  >
                    <input
                      type="radio"
                      className="w-4 h-4 accent-blue-500"
                      checked={computedFallRisk === level}
                      readOnly
                    />
                    <span className="text-sm text-gray-700">
                      {riskLabels[level]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-4 p-4 mt-10 w-full items-end">
              <label className="text-sm text-gray-500 w-full ">
                Barthel Index
              </label>

              {barthel.map((item) => (
                <label
                  key={item.key}
                  className="flex w-full items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={item.key}
                    name="CheckBarthel"
                    checked={checkbarthel === item.key}
                    onChange={(e) => setCheckBarthel(e.target.value)}
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-1 mt-10 pr-4">
              <label className="text-sm text-gray-500 p-4">
                Physical Examination Visit
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                value={visited}
                onChange={(e) => {
                  setVisited(e.target.value);
                }}
              />
            </div>

            <div className="flex gap-1 w-full items-end p-4 pr-4">
              <div className="flex flex-col w-full mt-10">
                <label className="text-sm text-gray-500">Treatment Plan</label>
                <div className="flex items-center gap-2">
                  <AutocompleteTextarea
                    value={treatment}
                    onChange={setTreatment}
                    wordBank={treatmentPlanWords}
                    placeholder="พิมพ์เพื่อค้นหา..."
                    className="border border-gray-300 rounded-lg py-3 px-3 w-full text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* participatory */}
            <div className="flex gap-1 w-full pl-4">
              <div className="flex flex-col mt-10 w-full">
                <label className="text-sm text-gray-500">
                  Participatory Goal Setting
                </label>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-500 mt-4">
                    Short term goal
                  </label>
                  <AutocompleteTextarea
                    value={shortgoal}
                    onChange={setShortGoal}
                    wordBank={shortGoalWords}
                    placeholder="พิมพ์เพื่อค้นหา..."
                    className="border border-gray-300 rounded-lg py-3 px-3 w-full text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-1 w-full pl-4">
              <div className="flex flex-col mt-10 w-full">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-500">
                    Long term goal
                  </label>
                  <AutocompleteTextarea
                    value={longGoal}
                    onChange={setLongGoal}
                    wordBank={longGoalWords}
                    placeholder="พิมพ์เพื่อค้นหา..."
                    className="border border-gray-300 rounded-lg py-3 px-3 w-full text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handlePreviewBefore}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg mt-4 hover:bg-blue-700 cursor-pointer"
              >
                บันทึก
              </button>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------------After Tabs-------------------------------------------------------- */}

        {activeTab === "after" && (
          <div>
            <div className="text-gray-500 text-base ml-2">
              Physiotherapy Treatment
            </div>
            <div className="flex flex-wrap gap-4 p-6">
              {treatmentSection.map((section) => {
                const isChecked = checked[section.id] ?? false;

                return (
                  <div key={section.id}>
                    {/* ======================================
                            Header — กดติ๊กได้
                            ====================================== */}
                    <div
                      onClick={() => toggleSection(section.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl cursor-pointer border transition-colors whitespace-nowrap ${
                        checked[section.id]
                          ? "bg-blue-700 text-white border-blue-700" // ติ๊กแล้ว → น้ำเงิน
                          : "bg-white text-gray-600 border-gray-300" // ยังไม่ติ๊ก → ขาว
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                          isChecked
                            ? "bg-white border-white"
                            : "bg-white border-gray-400"
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="w-3 h-3 text-blue-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium">{section.label}</span>
                      {checked[section.id] && (
                        <span
                          className="ml-1 text-white hover:text-red-300 text-xs"
                          onClick={(e) => {
                            e.stopPropagation(); // ไม่ให้ toggle section
                            setChecked((prev) => ({
                              ...prev,
                              [section.id]: false,
                            }));
                            setActiveSection(null);
                          }}
                        >
                          ✕
                        </span>
                      )}
                    </div>

                    {/* ======================================
                            Content — แสดงเฉพาะตอนติ๊ก
                            ====================================== */}
                    {checked[section.id] &&
                      activeSection === section.id &&
                      section.type === "section" && (
                        <div className="bg-blue-600 w-50 rounded-xl px-4 py-1.5 flex flex-col gap-3">
                          {/* ====== Ambulation: with dropdown อยู่บนสุด ====== */}
                          {section.id === "am" && (
                            <div className="relative">
                              <button
                                type="button"
                                className="w-full bg-blue-500 border border-blue-400 rounded-lg px-3 py-1.5 text-sm text-left text-white placeholder-blue-200 focus:outline-none focus:border-white flex justify-between items-center"
                                onClick={() =>
                                  setAmbWithDropdownOpen((p) => !p)
                                }
                              >
                                <span className="truncate">
                                  {ambWith.length === 0
                                    ? "with..."
                                    : ambWith.join(", ")}
                                </span>
                                <span className="ml-1 text-blue-200">▾</span>
                              </button>

                              {ambWithDropdownOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                                  {ambWithOptions.map((opt) => (
                                    <label
                                      key={opt}
                                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={ambWith.includes(opt)}
                                        onChange={() =>
                                          setAmbWith((prev) =>
                                            prev.includes(opt)
                                              ? prev.filter((v) => v !== opt)
                                              : [...prev, opt],
                                          )
                                        }
                                      />
                                      {opt}
                                    </label>
                                  ))}
                                </div>
                              )}

                              {ambWith.includes("Other") && (
                                <input
                                  className="mt-1 w-full bg-blue-500 border border-blue-400 rounded-lg px-3 py-1.5 text-sm text-white placeholder-blue-200 focus:outline-none focus:border-white"
                                  placeholder="ระบุ..."
                                  value={ambWithOther}
                                  onChange={(e) =>
                                    setAmbWithOther(e.target.value)
                                  }
                                  autoFocus
                                />
                              )}
                            </div>
                          )}

                          {/* ====== Sub checkboxes — เรียงแนวตั้งถ้าเป็น am ====== */}
                          {section.subOptions &&
                            section.subOptions.length > 0 && (
                              <div
                                className={
                                  section.id === "am"
                                    ? "flex flex-col gap-2"
                                    : "flex gap-4"
                                }
                              >
                                {section.subOptions.map((sub) => {
                                  const subKey = `${section.id}-${sub}`;
                                  const isSubChecked =
                                    subChecked[subKey] ?? false;
                                  return (
                                    <label
                                      key={sub}
                                      className="flex text-sm items-center gap-1 cursor-pointer"
                                      onClick={() => toggleSub(section.id, sub)}
                                    >
                                      <div
                                        className={`w-4 h-4 rounded flex items-center justify-center border-2 ${
                                          isSubChecked
                                            ? "bg-white border-white"
                                            : "bg-transparent border-white"
                                        }`}
                                      >
                                        {isSubChecked && (
                                          <svg
                                            className="w-3 h-3 text-blue-700"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={3}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                      <span className="text-white font-sm">
                                        {sub}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                          {/* ====== Fields ปกติ (ไม่ใช่ am) ====== */}
                          {section.fields.map((field) => (
                            <input
                              key={field}
                              className="w-full bg-blue-500 border border-blue-400 rounded-lg px-3 py-1.5 text-sm text-white placeholder-blue-200 focus:outline-none focus:border-white"
                              placeholder={field}
                              value={values[`${section.id}-${field}`] ?? ""}
                              onChange={(e) =>
                                handleInput(section.id, field, e.target.value)
                              }
                            />
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
            <div className="border-b-2 border-gray-300 mt-4 mb-10"></div>
            <div className="text-base text-gray-500 p-2">
              Diagnosis
              <input
                className="border border-gray-300 rounded-lg px-3 w-80 py-2 text-sm text-gray-500 ml-4 focus:outline-none focus:border-blue-400"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                // // ======================================
                // // onChange — ทุกครั้งที่พิมพ์ เรียก handleInput
                // // e.target.value คือค่าที่พิมพ์ล่าสุด
                // // ======================================
              />
            </div>

            <div>
              {sections.map((section) => {
                // isChecked — ดูว่า section นี้ติ๊กอยู่ไหม
                // ถ้า undefined ให้ถือว่า false
                const isChecked = checked[section.id] ?? false;

                return (
                  <div key={section.id}>
                    {/* ======================================
                  Header row ของแต่ละ section
                  สีเปลี่ยนตาม isChecked
                  ====================================== */}
                    <div
                      className={`flex items-center mb-4 justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200 ${
                        isChecked
                          ? "bg-green-100 border border-green-400" // ติ๊กแล้ว → เขียว
                          : "bg-gray-100 border border-gray-300" // ยังไม่ติ๊ก → เทา
                      }`}
                      onClick={() => toggle(section.id)} // กดที่แถวเพื่อ toggle
                    >
                      {/* ซ้าย: checkbox + label */}
                      <div className="flex items-center gap-3">
                        {/* Checkbox — เปลี่ยนสีตาม isChecked */}
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors duration-400 ${
                            isChecked
                              ? "bg-green-500 border-green-500" // ติ๊ก → เขียว
                              : "bg-white border-gray-400" // ไม่ติ๊ก → ขาว
                          }`}
                        >
                          {/* checkmark — แสดงเฉพาะตอนติ๊ก */}
                          {isChecked && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>

                        {/* ชื่อ section */}
                        <div>
                          <p
                            className={`font-medium ${isChecked ? "text-green-700" : "text-gray-500"}`}
                          >
                            {section.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            if condition applied to
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ======================================
                  Input fields ข้างใน
                  แสดงเฉพาะตอน isChecked === true
                  isChecked && <div> คือ ถ้าจริงถึงแสดง
                  ====================================== */}
                    {isChecked && (
                      <div className="border border-green-300 mb-2 border-t-0 rounded-b-xl px-6 py-4 bg-white flex flex-col gap-3">
                        {section.fields.map((field) => (
                          <div key={field} className="flex items-center gap-4 ">
                            {/* Label ซ้าย */}
                            <label className="text-sm text-gray-500 w-32 shrink-0">
                              {field}
                            </label>

                            {/* Input ขวา */}
                            <AutocompleteTextarea
                              value={values[`${section.id}-${field}`] ?? ""}
                              onChange={(val) =>
                                handleInput(section.id, field, val)
                              }
                              wordBank={
                                AftersectionFieldWords[section.id]?.[field] ??
                                []
                              }
                              placeholder={`กรอก ${field}`}
                              className="flex-1 border border-gray-300 text-gray-500 w-full rounded-lg px-3 text-sm focus:outline-none focus:border-green-400 resize-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex flex-col ">
                <label className="text-sm text-gray-500 p-4">
                  Treatment Detail
                </label>
                <textarea
                  className="w-287 border rounded-lg ml-4 mr-4 border-gray-300 rounded-b-lg px-3 py-2 text-sm text-gray..."
                  value={treatmentDetails ?? ""}
                  onChange={(e) => setTreatmentDetails(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-7 mt-6 ml-4 pr-4 w-100">
                {/* Time */}
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm text-gray-500">Time</label>
                  <input
                    type="time"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                    value={aftertime}
                    onChange={(e) => setAfterTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-end gap-6 mt-10 ml-4 w-full pr-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm text-gray-500">Pain Score</label>
                  <input
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                    type="text"
                    value={afterpain}
                    onChange={(e) => setAfterpain(e.target.value)}
                  />
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  <label className="text-sm text-gray-500">Frequency</label>
                  <select
                    className="border border-gray-300 rounded-lg text-sm text-gray-500 px-3 py-1.5 focus:outline-none focus:border-blue-400"
                    value={afterfrequence}
                    onChange={(e) => setAfterFrequence(e.target.value)}
                  >
                    <option value="">--Select--</option>
                    {frequencyOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-6 mt-10 ml-4 w-full pr-4">
                {vitalSigns.map((item) => (
                  <div key={item.key} className="flex flex-col gap-1">
                    <label className="text-sm text-gray-500">
                      {item.label}
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        className="w-20 border border-gray-300 text-gray-500 w-full ml-6 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                        value={
                          aftervitalData[
                            item.key as keyof typeof aftervitalData
                          ]
                        }
                        onChange={(e) =>
                          setAftervitalData({
                            ...aftervitalData,
                            [item.key]: e.target.value,
                          })
                        }
                      />
                      <span className="text-sm text-gray-400">{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center w-full gap-4 mt-10">
                <div className="flex flex-col gap-1 ml-4 flex-1">
                  <label className="text-sm text-gray-500">Duration</label>
                  <input
                    className="border border-gray-300 text-sm text-gray-500 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
                    value={afterduration}
                    onChange={(e) => setAfterDuration(e.target.value)}
                  />
                </div>
                {/* Location of Pain */}
                <div className="flex flex-col flex-1 ml-18 gap-1">
                  <label className="text-sm text-gray-500 ">
                    Location of Pain
                  </label>
                  <input
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                    value={afterlocationpain}
                    onChange={(e) => setAfterLocationPain(e.target.value)}
                  />
                </div>
                <div className="flex flex-col ml-12 flex-1 gap-1">
                  <label className="text-sm text-gray-500">
                    Pain Assesment tool
                  </label>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-500"
                    value={afterpainAssesmentTool}
                    onChange={(e) => setAfterPainAssesmentTool(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {painAssesment.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 ml-6">
                  <label className="text-medium text-gray-500">
                    Characteristic
                  </label>

                  {/* Trigger button */}
                  <div className="relative w-80">
                    <button
                      type="button"
                      className="w-50 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-500 bg-white text-left flex justify-between items-center"
                      onClick={() => setChaDropdown((prev) => !prev)}
                    >
                      <span className="truncate">
                        {aftercharacter.length === 0
                          ? "-- Select --"
                          : aftercharacter.join(", ")}
                      </span>
                      <span className="ml-2 text-gray-400">▾</span>
                    </button>

                    {/* Dropdown list */}
                    {chaDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-48 overflow-y-auto">
                        {cha.map((item) => (
                          <label
                            key={item}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={aftercharacter.includes(item)}
                              onChange={() => {
                                setAfterCharacter(
                                  (prev) =>
                                    prev.includes(item)
                                      ? prev.filter((v) => v !== item) // ถ้ามีแล้ว → เอาออก
                                      : [...prev, item], // ถ้าไม่มี → เพิ่ม
                                );
                              }}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Other input */}
                  {characteristic.includes("Other") && (
                    <input
                      className="border border-gray-300 rounded-lg px-3 w-80 py-1.5 text-gray-500 text-sm focus:outline-none focus:border-blue-400"
                      value={chaOther}
                      onChange={(e) => setChaOther(e.target.value)}
                      placeholder="Please specify..."
                      autoFocus
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-6 py-4 justify-between">
              <p className="text-sm ml-4 text-gray-500 mt-10 mr-4">Fall risk</p>
              {[
                { value: "standard", label: "Standard fall (No ABCS)" },
                { value: "strict", label: "Strict fall (A,B,C)" },
                { value: "highly", label: "Highly Strict fall (S)" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex mt-10 justify-between gap-2 pr-4 pointer-events-none"
                >
                  <input
                    type="radio"
                    className="w-4 h-4 accent-blue-500"
                    checked={afterfallrisk === option.value}
                    readOnly
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col mt-10 ml-4 mr-4">
                <label className="text-gray-500 text-medium">
                  คำแนะนำที่ได้รับ
                </label>

                <div className="relative w-80 mt-2">
                  <button
                    type="button"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-500 bg-white text-left flex justify-between items-center"
                    onClick={() => setSuggestDropdown((prev) => !prev)}
                  >
                    <span className="truncate">
                      {suggest.length === 0
                        ? "-- Select --"
                        : suggest.join(", ")}
                    </span>
                    <span className="ml-2 text-gray-400">▾</span>
                  </button>

                  {suggestDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-48 overflow-y-auto">
                      {suggestOption.map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={suggest.includes(item)}
                            onChange={() => {
                              setSuggest((prev) =>
                                prev.includes(item)
                                  ? prev.filter((v) => v !== item)
                                  : [...prev, item],
                              );
                            }}
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col mt-10 ml-4 mr-4">
                <label className="text-gray-500 text-base">
                  Discharge Status
                </label>
                <select
                  className="border border-gray-300 rounded-lg py-1.5 w-80 mt-3 text-gray-500 text-base hover:boder-blue-500"
                  value={discharge}
                  onChange={(e) => setDischarge(e.target.value)}
                >
                  <option value="">---Select---</option>
                  {statusop.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {discharge === "อื่น ๆ" && (
                  <input
                    className="border mt-2 border-gray-300 rounded-lg text-sm text-gray-500 py-1.5 focus: outline-none focus:border-blue-400"
                    value={otherDischarge}
                    onChange={(e) => setOtherDischarge(e.target.value)}
                  ></input>
                )}
              </div>
              <div className="flex flex-col gap-1 flex-1 mt-12 relative">
                {" "}
                {/* ← เพิ่ม relative */}
                <label className="text-sm text-gray-500">PhysioTherapist</label>
                <input
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                  value={therapist}
                  onChange={(e) => {
                    setTherapist(e.target.value);
                    setShowTherapist(true);
                  }}
                  // onBlur={() => setTimeout(() => setShowTherapist(false), 150)}
                />
                {showTherapist && therapist && filteredTherapist.length > 0 && (
                  <div className="absolute top-full left-0 z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredTherapist.map((item) => (
                      <div
                        key={item}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                        onClick={() => {
                          setTherapist(item);
                          setShowTherapist(false);
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full mt-10 ml-4">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm text-gray-500">Date</label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                  value={afterdate}
                  onChange={(e) => setAfterDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1 flex-1 ml-4 pr-4">
                <label className="text-sm text-gray-500">Time</label>
                <input
                  type="time"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                  value={time2}
                  onChange={(e) => setTime2(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-6 py-2 rounded-lg mt-4 cursor-pointer hover:bg-blue-700"
                type="button"
                onClick={handlePreviewAfter}
              >
                บันทึก After
              </button>
            </div>
          </div>
        )}
      </div>

      <PDFPreviewModal
        show={pdfPreview.show}
        pdfBase64={pdfPreview.base64}
        loading={pdfPreview.loading}
        error={pdfPreview.error}
        title={
          pdfPreview.mode === "after"
            ? "ตรวจสอบ IPD (After) ก่อนบันทึก"
            : "ตรวจสอบ IPD (Before) ก่อนบันทึก"
        }
        downloadFilename={
          pdfPreview.mode === "after"
            ? "IPD_After_Preview.pdf"
            : "IPD_Before_Preview.pdf"
        }
        onConfirm={handleConfirmSave}
        onClose={() => setPdfPreview((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
