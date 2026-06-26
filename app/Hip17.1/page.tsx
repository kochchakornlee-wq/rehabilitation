"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useParams, useSearchParams } from "next/navigation";
import { fetchPdfPreview } from "@/lib/pdf/client";
import PDFPreviewModal from "@/components/PDFPreviewModal";
import { fillHipPdf, PAIN_IDS, ACT_IDS } from "@/lib/pdf/mappers/hip";
import { useActiveHN } from "@/lib/useActiveHN";

// ── Types ────────────────────────────────────────────────────────────────────
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
function genderLabel(g?: string) {
  if (g === "M" || g === "1") return "Male";
  if (g === "F" || g === "2") return "Female";
  return g ?? "-";
}
type Lang = "th" | "en";

type VisitType = "ก่อนผ่าตัด" | "หลังผ่าตัด" | "หลังผ่าตัด 1 เดือน";

type VisitTypeEN = "Before Surgery" | "After Surgery" | "After Surgery 1 month";

type VisitTypeValue = VisitType | VisitTypeEN;

type VisitTypeValueEN = VisitTypeEN;
// ── Doctor list ───────────────────────────────────────────────────────────────
type VisitData = {
  assessor_date?: string;
  assessor_time?: string;
  pain_total?: number;
  pain_percent?: number;
  act_total?: number;
  act_percent?: number;
} & Record<string, string | number | null | undefined>;

const DOCTORS = [
  "เวนิช สว่างแสง",
  "พนิดา รุ่งพิบูลโสภิษฐ์",
  "พิชญา เพชรละเอียด",
  "ธนัชพร วิไลเลิศ",
  "ศิรดา เดิมคลัง",
  "ชัชนันท์ แก่เมือง",
  "จักษณา ชัยราม",
  "ชรินดา ถาวรวรกุล",
];

// ── Options ───────────────────────────────────────────────────────────────────

const OPTIONS_EN = [
  { label: "None", score: 0 },
  { label: "Mild", score: 1 },
  { label: "Moderate", score: 2 },
  { label: "Severe", score: 3 },
  { label: "Extreme", score: 4 },
];

const OPTIONS_TH = [
  { label: "ไม่มี", score: 0 },
  { label: "น้อย", score: 1 },
  { label: "ปานกลาง", score: 2 },
  { label: "มาก", score: 3 },
  { label: "รุนแรงมาก", score: 4 },
];

// ── Items ─────────────────────────────────────────────────────────────────────
// pain ids: straightening, bending, p_sitting, p_standing, p_walking
// act  ids: a_lying, a_sitting, a_rising, a_standing, a_walking
// DB col = strip leading "p_" or "a_" → pain_sitting, act_lying etc.

const PAIN_ITEMS = {
  th: [
    { id: "straightening", label: "ยืดสะโพกให้ตรงเต็มที่" },
    { id: "bending", label: "งอสะโพกเต็มที่" },
    { id: "p_sitting", label: "นั่งหรือนอน" },
    { id: "p_standing", label: "ยืนตัวตรง" },
    { id: "p_walking", label: "เดินบนพื้นราบ" },
  ],
  en: [
    { id: "straightening", label: "Straightening hip fully" },
    { id: "bending", label: "Bending hip fully" },
    { id: "p_sitting", label: "Sitting or lying" },
    { id: "p_standing", label: "Standing upright" },
    { id: "p_walking", label: "Walking on flat surface" },
  ],
};

const ACT_ITEMS = {
  th: [
    { id: "a_lying", label: "นอนบนเตียง" },
    { id: "a_sitting", label: "นั่ง" },
    { id: "a_rising", label: "ลุกขึ้นจากท่านั่ง" },
    { id: "a_standing", label: "ยืน" },
    { id: "a_walking", label: "เดินบนพื้นราบ" },
  ],
  en: [
    { id: "a_lying", label: "Lying in bed" },
    { id: "a_sitting", label: "Sitting" },
    { id: "a_rising", label: "Rising from sitting" },
    { id: "a_standing", label: "Standing" },
    { id: "a_walking", label: "Walking on flat surface" },
  ],
};

// strip p_ or a_ prefix → DB column name
const toCol = (id: string) => id.replace(/^[pa]_/, "");

// ── Translations ──────────────────────────────────────────────────────────────

const T = {
  th: {
    visitLabel: "ช่วงเวลา",
    visitTypes: [
      "ก่อนผ่าตัด",
      "หลังผ่าตัด",
      "หลังผ่าตัด 1 เดือน",
    ] as VisitType[],
    painHeader: "ความเจ็บปวด (Pain)",
    actHeader: "กิจกรรม (Activities of Daily Living)",
    totalScore: "คะแนนรวม",
    scoreSummary: "สรุปคะแนน",
    assessorDetails: "ข้อมูลผู้ประเมิน",
    assessorName: "ชื่อผู้ประเมิน",
    assessorDate: "วันที่",
    assessorTime: "เวลา",
    notes: "หมายเหตุ",
    notesPlaceholder: "บันทึกเพิ่มเติม...",
    save: "บันทึก",
    saving: "กำลังบันทึก...",
    saveSuccess: "บันทึกสำเร็จ",
    saveSuccessDesc: "ข้อมูล HIP เก็บเรียบร้อยแล้ว",
    backBtn: "กลับสู่แบบฟอร์มผู้ป่วย",
    selectVisit: "กรุณาเลือกช่วงเวลาก่อนบันทึก",
    hn: "HN",
    dob: "วันเกิด",
    admit: "วันแรกรับ",
    gender: "เพศ",
    allergies: "การแพ้ยา",
    options: OPTIONS_TH,
    painItems: PAIN_ITEMS.th,
    actItems: ACT_ITEMS.th,
  },
  en: {
    visitLabel: "Visit Type",
    visitTypes: [
      "before surgery",
      "After Surgery",
      "After Sugery 1 month",
    ] as VisitTypeEN[],
    painHeader: "Pain (ความเจ็บปวด)",
    actHeader: "Activities of Daily Living (กิจกรรม)",
    totalScore: "Total Score",
    scoreSummary: "Score Summary",
    assessorDetails: "Assessor Details",
    assessorName: "Assessor Name",
    assessorDate: "Date",
    assessorTime: "Time",
    notes: "Notes",
    notesPlaceholder: "Enter clinical observations...",
    save: "Save",
    saving: "Saving...",
    saveSuccess: "Saved Successfully",
    saveSuccessDesc: "HIP assessment data has been recorded.",
    backBtn: "Back to Patient Form",
    selectVisit: "Please select a visit type before saving",
    hn: "HN",
    dob: "Date of Birth",
    admit: "Admit Date",
    gender: "Gender",
    allergies: "Allergies",
    options: OPTIONS_EN,
    painItems: PAIN_ITEMS.en,
    actItems: ACT_ITEMS.en,
  },
};

// ── Score formatter ───────────────────────────────────────────────────────────

const formatScore = (label: string, score: number) => `${label} (${score})`;

// ── Toast ─────────────────────────────────────────────────────────────────────

function ToastModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = T[lang];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-80 rounded-2xl bg-white px-8 py-8 text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="ปิด"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-7 w-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="mb-1 text-base font-semibold text-gray-800">
          {t.saveSuccess}
        </p>
        <p className="mb-6 text-sm text-gray-500">{t.saveSuccessDesc}</p>
        <a
          href="/otherform"
          onClick={onClose}
          className="inline-block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          {t.backBtn}
        </a>
      </div>
    </div>
  );
}

// ── Score Grid ────────────────────────────────────────────────────────────────
// Columns: Score badge | Description | None(0) | Mild(1) | Moderate(2) | Severe(3) | Extreme(4)
// วันที่ใส่ใต้ header ของแต่ละ option column (เหมือน modify_rankin)

function ScoreGrid({
  sectionKey,
  header,
  items,
  options,
  selections,
  dates,
  onSelect,
  onDateChange,
  totalLabel,
}: {
  sectionKey: string;
  header: string;
  items: { id: string; label: string }[];
  options: { label: string; score: number }[];
  selections: Record<string, number>;
  dates: Record<string, string>;
  onSelect: (id: string, score: number) => void;
  onDateChange: (scoreKey: string, date: string) => void;
  totalLabel: string;
}) {
  const total = Object.values(selections).reduce((s, v) => s + v, 0);
  const totalPossible = items.length * 4;
  const percent =
    items.length === Object.keys(selections).length
      ? Math.round(100 - (total * 100) / totalPossible)
      : null;

  return (
    <div className="bg-white rounded-2xl mx-auto w-250 p-4 shadow-md">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-4 h-4 text-black"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1"
            y="1"
            width="14"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M4 5h8M4 8h8M4 11h5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-xs font-bold text-blue-800 uppercase tracking-widest">
          {header}
        </span>
      </div>

      {/* Grid table */}
      {/* cols: 56px(badge) | 1fr(desc) | 100px x5(options) */}
      <div className="rounded-xl border border-gray-300 bg-gray-100 overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[56px_1fr_100px_100px_100px_100px_100px] border-b border-gray-300">
          <div className="px-2 py-2 text-xs font-bold text-blue-800 border-r border-gray-300 flex items-center justify-center">
            Score
          </div>
          <div className="px-3 py-2 text-xs font-bold text-blue-800 border-r border-gray-300 flex items-center">
            Description
          </div>
          {options.map((opt) => (
            <div
              key={opt.score}
              className="flex flex-col items-center border-l border-gray-300"
            >
              <span className="text-xs font-bold text-blue-800 pt-2 pb-1 text-center px-1">
                {opt.label}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {items.map(({ id, label }, idx) => (
          <div
            key={id}
            className={[
              "grid grid-cols-[56px_1fr_100px_100px_100px_100px_100px] border-b border-gray-300 last:border-b-0",
              idx % 2 === 1 ? "bg-white" : "",
            ].join(" ")}
          >
            {/* Score badge */}
            <div className="px-2 py-3 border-r border-gray-300 flex items-center justify-center">
              {selections[id] !== undefined ? (
                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                  {selections[id]}
                </span>
              ) : (
                <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs">
                  —
                </span>
              )}
            </div>
            {/* Description */}
            <div className="px-3 py-3 text-sm text-gray-600 border-r border-gray-300 self-center leading-relaxed">
              {label}
            </div>
            {/* Radios */}
            {options.map((opt) => (
              <div
                key={opt.score}
                className="flex items-center justify-center border-l border-gray-300 py-3"
              >
                <input
                  type="radio"
                  name={`${sectionKey}-${id}`}
                  value={opt.score}
                  checked={selections[id] === opt.score}
                  onChange={() => onSelect(id, opt.score)}
                  className="w-4 h-4 cursor-pointer accent-blue-600"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-300 bg-gray-100 p-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">{totalLabel}</span>
          <span className="font-bold text-gray-600">
            {total} / {totalPossible}
          </span>
        </div>
        <div className="rounded-xl border border-gray-300 bg-gray-100 p-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">%</span>
          <span className="font-bold text-gray-600">
            {percent !== null ? `${percent}%` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Hip17() {
  type AllVisitData = {
    bf: VisitData | null;
    af: VisitData | null;
    af1m: VisitData | null;
  };
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

  const [allVisitData, setAllVisitData] = useState<AllVisitData>({
    bf: null,
    af: null,
    af1m: null,
  });

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
  const [lang, setLang] = useState<Lang>("th");
  const [visitType, setVisitType] = useState<VisitTypeValue | "">("");
  const [visitTypeEN, setVisitTypeEN] = useState<VisitTypeValueEN | "">("");

  const [painSelections, setPainSelections] = useState<Record<string, number>>(
    {},
  );
  const [actSelections, setActSelections] = useState<Record<string, number>>(
    {},
  );

  // dates per option score: { "0": "2024-01-01", "2": "2024-01-05", ... }
  const [painDates, setPainDates] = useState<Record<string, string>>({});
  const [actDates, setActDates] = useState<Record<string, string>>({});

  const [assessorName, setAssessorName] = useState("");
  const [assessorDate, setAssessorDate] = useState("");
  const [assessorTime, setAssessorTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = T[lang];
  const filtered = DOCTORS.filter((d) =>
    d.toLowerCase().includes(assessorName.toLowerCase()),
  );

  // ── Load ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!visitType) return;

    const fetchData = async () => {
      const res = await fetch(
        `/api/hip17?hn=${patientHN}&visit_type=${visitType}`,
      );
      if (!res.ok) return;
      const row = await res.json();
      if (!row) return;

      const parseVal = (val: unknown): number | null => {
        if (val === null || val === undefined) return null;
        const m = String(val).match(/\((\d)\)$/);
        return m ? parseInt(m[1]) : null;
      };

      const parsedPain: Record<string, number> = {};
      for (const item of PAIN_ITEMS.en) {
        const v = parseVal(row[`pain_${toCol(item.id)}`]);
        if (v !== null) parsedPain[item.id] = v;
      }

      const parsedAct: Record<string, number> = {};
      for (const item of ACT_ITEMS.en) {
        const v = parseVal(row[`act_${toCol(item.id)}`]);
        if (v !== null) parsedAct[item.id] = v;
      }

      const parsedPainDates: Record<string, string> = {};
      const parsedActDates: Record<string, string> = {};
      for (let s = 0; s <= 4; s++) {
        if (row[`pain_date_${s}`])
          parsedPainDates[s.toString()] = row[`pain_date_${s}`];
        if (row[`act_date_${s}`])
          parsedActDates[s.toString()] = row[`act_date_${s}`];
      }

      setPainSelections(parsedPain);
      setActSelections(parsedAct);
      setPainDates(parsedPainDates);
      setActDates(parsedActDates);
      setAssessorName(row.assessor_name ?? "");
      setAssessorDate(row.assessor_date ?? "");
      setAssessorTime(row.assessor_time ?? "");
      setNotes(row.notes ?? "");
    };

    fetchData();
  }, [visitType]);

  useEffect(() => {
    const loadLatestVisit = async () => {
      const res = await fetch(`/api/hip17?hn=${patientHN}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.visit_type) {
        setVisitType(data.visit_type as VisitTypeValue);
      }
    };

    loadLatestVisit();
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────────
  const VISIT_TYPE_EN_TO_TH: Record<string, string> = {
    "Before Surgery": "ก่อนผ่าตัด",
    "After Surgery": "หลังผ่าตัด",
    "After Surgery 1 month": "หลังผ่าตัด 1 เดือน", // ← Sugery → Surgery
  };
  const handleSave = async () => {
    if (!visitType) {
      alert(t.selectVisit);
      return;
    }
    setLoading(true);
    setError(null);

    const payload: Record<string, unknown> = {
      hn: patientHN,
      visit_type: visitType,
      VisitTypeEN: visitTypeEN,
      assessor_name: assessorName,
      assessor_date: assessorDate || null,
      assessor_time: assessorTime || null,
      notes,
    };

    for (const item of PAIN_ITEMS.en) {
      const score = painSelections[item.id];
      const col = toCol(item.id);
      if (score !== undefined) {
        payload[`pain_${col}`] = formatScore(
          OPTIONS_EN.find((o) => o.score === score)?.label ?? "",
          score,
        );
        payload[`pain_${col}_th`] = formatScore(
          OPTIONS_TH.find((o) => o.score === score)?.label ?? "",
          score,
        );
      }
    }
    for (let s = 0; s <= 4; s++)
      payload[`pain_date_${s}`] = painDates[s.toString()] || null;

    for (const item of ACT_ITEMS.en) {
      const score = actSelections[item.id];
      const col = toCol(item.id);
      if (score !== undefined) {
        payload[`act_${col}`] = formatScore(
          OPTIONS_EN.find((o) => o.score === score)?.label ?? "",
          score,
        );
        payload[`act_${col}_th`] = formatScore(
          OPTIONS_TH.find((o) => o.score === score)?.label ?? "",
          score,
        );
      }
    }
    for (let s = 0; s <= 4; s++)
      payload[`act_date_${s}`] = actDates[s.toString()] || null;

    const painTotal = Object.values(painSelections).reduce((s, v) => s + v, 0);
    const actTotal = Object.values(actSelections).reduce((s, v) => s + v, 0);
    payload.pain_total = painTotal;
    payload.pain_percent =
      Object.keys(painSelections).length === PAIN_ITEMS.en.length
        ? Math.round(100 - (painTotal * 100) / (PAIN_ITEMS.en.length * 4))
        : null;
    payload.act_total = actTotal;
    payload.act_percent =
      Object.keys(actSelections).length === ACT_ITEMS.en.length
        ? Math.round(100 - (actTotal * 100) / (ACT_ITEMS.en.length * 4))
        : null;

    const res = await fetch("/api/hip17", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      // parse เฉพาะถ้าเป็น JSON จริงๆ
      const contentType = res.headers.get("content-type") ?? "";
      const errMsg = contentType.includes("application/json")
        ? ((await res.json()).error ?? "เกิดข้อผิดพลาด")
        : `Server error ${res.status}`;
      setError(errMsg);
      return;
    }

    const result = await res.json();

    setShowToast(true);
  };

  const autoSave = async () => {
    //if (!patientHN || !visitType) return
    setAutoSaveStatus("saving");
    try {
      // reuse payload เดียวกับ handleSave เลย
      const payload: Record<string, unknown> = {
        hn: patientHN || "TEST-003",
        visit_type: visitType,
        assessor_name: assessorName,
        assessor_date: assessorDate,
        assessor_time: assessorTime,
        notes,
      };
      for (const item of PAIN_ITEMS.en) {
        const v = painSelections[item.id];
        const col = toCol(item.id);
        if (v != null) {
          const labelEn = OPTIONS_EN.find((o) => o.score === v)?.label ?? "";
          const labelTh = OPTIONS_TH.find((o) => o.score === v)?.label ?? "";
          payload[`pain_${col}`] = formatScore(labelEn, v);
          payload[`pain_${col}_th`] = formatScore(labelTh, v);
        } else {
          payload[`pain_${col}`] = null;
          payload[`pain_${col}_th`] = null;
        }
      }
      for (const item of ACT_ITEMS.en) {
        const v = actSelections[item.id];
        const col = toCol(item.id);
        if (v != null) {
          const labelEn = OPTIONS_EN.find((o) => o.score === v)?.label ?? "";
          const labelTh = OPTIONS_TH.find((o) => o.score === v)?.label ?? "";
          payload[`act_${col}`] = formatScore(labelEn, v);
          payload[`act_${col}_th`] = formatScore(labelTh, v);
        } else {
          payload[`act_${col}`] = null;
          payload[`act_${col}_th`] = null;
        }
      }

      await fetch("/api/hip17", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    } catch {
      setAutoSaveStatus("idle");
    }
  };

  useEffect(() => {
    //if (!patientHN || !visitType) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      autoSave();
    }, 10000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [painSelections, actSelections, assessorName, assessorDate, visitType]);

  const [pdfPreview, setPdfPreview] = useState<{
    show: boolean;
    base64: string | null;
    loading: boolean;
    error: string | null;
  }>({ show: false, base64: null, loading: false, error: null });

  function buildHipPdfPayload() {
    const painTotal = Object.values(painSelections).reduce((s, v) => s + v, 0);
    const actTotal = Object.values(actSelections).reduce((s, v) => s + v, 0);
    const painPercent =
      Object.keys(painSelections).length === PAIN_ITEMS.en.length
        ? Math.round(100 - (painTotal * 100) / (PAIN_ITEMS.en.length * 4))
        : null;
    const actPercent =
      Object.keys(actSelections).length === ACT_ITEMS.en.length
        ? Math.round(100 - (actTotal * 100) / (ACT_ITEMS.en.length * 4))
        : null;

    // ── build currentVisitData จาก form state ──────────────────────────────────
    const currentVisitData: VisitData = {
      assessor_date: assessorDate,
      pain_total: painTotal,
      pain_percent: painPercent ?? undefined,
      act_total: actTotal,
      act_percent: actPercent ?? undefined,
    };
    for (const item of PAIN_ITEMS.en) {
      const col = toCol(item.id);
      const v = painSelections[item.id];
      if (v != null) {
        currentVisitData[`pain_${col}`] = formatScore(
          OPTIONS_EN.find((o) => o.score === v)?.label ?? "",
          v,
        );
        currentVisitData[`pain_${col}_th`] = formatScore(
          OPTIONS_TH.find((o) => o.score === v)?.label ?? "",
          v,
        );
      }
    }
    for (const item of ACT_ITEMS.en) {
      const col = toCol(item.id);
      const v = actSelections[item.id];
      if (v != null) {
        currentVisitData[`act_${col}`] = formatScore(
          OPTIONS_EN.find((o) => o.score === v)?.label ?? "",
          v,
        );
        currentVisitData[`act_${col}_th`] = formatScore(
          OPTIONS_TH.find((o) => o.score === v)?.label ?? "",
          v,
        );
      }
    }

    // ── map visitType → key bf/af/af1m ────────────────────────────────────────
    const visitKey =
      visitType === "ก่อนผ่าตัด" || visitType === "Before Surgery"
        ? "bf"
        : visitType === "หลังผ่าตัด" || visitType === "After Surgery"
          ? "af"
          : visitType === "หลังผ่าตัด 1 เดือน" ||
              visitType === "After Surgery 1 month"
            ? "af1m"
            : null;

    // ── merge current session เข้า allVisitData ───────────────────────────────
    const merged = { ...allVisitData };
    if (visitKey) {
      merged[visitKey] = {
        ...(allVisitData[visitKey] ?? {}),
        ...currentVisitData,
      };
    }

    const { bf, af, af1m } = merged; // ← ใช้ merged แทน allVisitData

    // ── ส่วนที่เหลือเหมือนเดิมทุกบรรทัด ──────────────────────────────────────
    const payload: Record<string, unknown> = {
      lang,
      PatientName: patientName,
      DOB: patientBirth,

      Age: String(hisPatient?.age ?? ""),
      HN: patientHN,
      VN: "",
      VisitDate: patientAdmit,
      Gender: patientGender,
      Allergies: patientAllergy,
      VisitType: VISIT_TYPE_EN_TO_TH[visitType] ?? visitType,
      VisitTypeEN:
        visitType === "ก่อนผ่าตัด"
          ? "Before Surgery"
          : visitType === "หลังผ่าตัด"
            ? "After Surgery"
            : visitType === "หลังผ่าตัด 1 เดือน"
              ? "After Surgery 1 month"
              : "",
      assessor_name: assessorName, // ← snake_case ให้ตรง type
      assessor_date: assessorDate,
      assessor_time: assessorTime,
      notes,
      pain_total: painTotal,
      pain_percent: painPercent,
      act_total: actTotal,
      act_percent: actPercent,
    };

    // format pain selections → pain_xxx_th / pain_xxx
    for (const item of PAIN_ITEMS.en) {
      const col = toCol(item.id);
      const v = painSelections[item.id];
      if (v != null) {
        payload[`pain_${col}`] = formatScore(
          OPTIONS_EN.find((o) => o.score === v)?.label ?? "",
          v,
        );
        payload[`pain_${col}_th`] = formatScore(
          OPTIONS_TH.find((o) => o.score === v)?.label ?? "",
          v,
        );
      }
    }
    payload.pain_total = painTotal;
    payload.pain_percent =
      Object.keys(painSelections).length === PAIN_ITEMS.en.length
        ? Math.round(100 - (painTotal * 100) / (PAIN_ITEMS.en.length * 4)) // ← เพิ่ม 100 -
        : null;

    // format act selections → act_xxx_th / act_xxx
    for (const item of ACT_ITEMS.en) {
      const col = toCol(item.id);
      const v = actSelections[item.id];
      if (v != null) {
        payload[`act_${col}`] = formatScore(
          OPTIONS_EN.find((o) => o.score === v)?.label ?? "",
          v,
        );
        payload[`act_${col}_th`] = formatScore(
          OPTIONS_TH.find((o) => o.score === v)?.label ?? "",
          v,
        );
      }
    }
    payload.act_total = actTotal;
    payload.act_percent =
      Object.keys(actSelections).length === ACT_ITEMS.en.length
        ? Math.round(100 - (actTotal * 100) / (ACT_ITEMS.en.length * 4)) // ← เพิ่ม 100 -
        : null;

    // ─── pain section ──────────────────────────────────────────────────────────
    payload["pain bf date"] = bf?.assessor_date ?? "";
    payload["pain af date"] = af?.assessor_date ?? "";
    payload["pain af1m date"] = af1m?.assessor_date ?? "";

    PAIN_IDS.forEach((id, i) => {
      payload[`bf_${i + 1}`] = bf?.[`pain_${id}_th`] ?? "";
      payload[`af ${i + 1}`] = af?.[`pain_${id}_th`] ?? "";
      payload[`af1m ${i + 1}`] = af1m?.[`pain_${id}_th`] ?? "";
      // EN
      payload[`pain pre ${i + 1}`] = bf?.[`pain_${id}`] ?? "";
      payload[`pain post ${i + 1}`] = af?.[`pain_${id}`] ?? "";
      payload[`pain post 1 month ${i + 1}`] = af1m?.[`pain_${id}`] ?? "";
    });

    // TH totals
    payload["bf total"] = bf?.pain_total ?? "";
    payload["bf percentage"] = bf?.pain_percent ?? "";
    payload["af total"] = af?.pain_total ?? "";
    payload["af percentage"] = af?.pain_percent ?? "";
    payload["af1m total"] = af1m?.pain_total ?? "";
    payload["af1m percentage"] = af1m?.pain_percent ?? "";

    // EN totals
    payload["pain pre total"] = bf?.pain_total ?? "";
    payload["pain pre percentage"] = bf?.pain_percent ?? "";
    payload["pain post total"] = af?.pain_total ?? "";
    payload["pain post percentage"] = af?.pain_percent ?? "";
    payload["pain post 1 month total"] = af1m?.pain_total ?? "";
    payload["pain post 1 month percentage"] = af1m?.pain_percent ?? "";

    // ─── act/daily section ─────────────────────────────────────────────────────
    payload["daily bf date"] = bf?.assessor_date ?? "";
    payload["daily af date"] = af?.assessor_date ?? "";
    payload["daily af1m date"] = af1m?.assessor_date ?? "";

    ACT_IDS.forEach((id, i) => {
      payload[`daily bf ${i + 1}`] = bf?.[`act_${id}_th`] ?? "";
      payload[`daily af ${i + 1}`] = af?.[`act_${id}_th`] ?? "";
      payload[`daily af1m ${i + 1}`] = af1m?.[`act_${id}_th`] ?? "";
      // EN
      payload[`daily pre ${i + 1}`] = bf?.[`act_${id}`] ?? "";
      payload[`daily post ${i + 1}`] = af?.[`act_${id}`] ?? "";
      payload[`daily post 1 month ${i + 1}`] = af1m?.[`act_${id}`] ?? "";
    });

    // TH act totals
    payload["daily bf total"] = bf?.act_total ?? "";
    payload["daily bf percentage"] = bf?.act_percent ?? "";
    payload["daily af total"] = af?.act_total ?? "";
    payload["daily af percentage"] = af?.act_percent ?? "";
    payload["daily af1m total"] = af1m?.act_total ?? "";
    payload["daily af1m percentage"] = af1m?.act_percent ?? "";

    // EN act totals
    payload["daily pre total"] = bf?.act_total ?? "";
    payload["daily pre percentage"] = bf?.act_percent ?? "";
    payload["daily post total"] = af?.act_total ?? "";
    payload["daily post percentage"] = af?.act_percent ?? "";
    payload["daily post 1 month total"] = af1m?.act_total ?? "";
    payload["daily post 1 month percentage"] = af1m?.act_percent ?? "";
    console.log("bf pain_total:", allVisitData.bf?.pain_total);
    console.log("bf pain_percent:", allVisitData.bf?.pain_percent);

    // helper คำนวณ total/percent จาก visit data
    const calcTotal = (visitData: VisitData | null, prefix: "pain" | "act") => {
      if (!visitData) return { total: "", percent: "" };
      const ids = prefix === "pain" ? PAIN_IDS : ACT_IDS;
      const values = ids.map((id) => {
        const raw = (visitData[`${prefix}_${id}`] as string) ?? "";
        const match = raw.match(/\((\d+)\)/);
        return match ? Number(match[1]) : null;
      });
      if (values.some((v) => v === null)) return { total: "", percent: "" };
      const total = values.reduce((s, v) => s! + v!, 0)!;
      const percent = Math.round(100 - (total * 100) / (ids.length * 4));
      return { total: String(total), percent: String(percent) };
    };

    // pain totals
    const bfPain = calcTotal(bf, "pain");
    const afPain = calcTotal(af, "pain");
    const af1mPain = calcTotal(af1m, "pain");

    payload["bf total"] = bfPain.total;
    payload["bf percentage"] = bfPain.percent;
    payload["af total"] = afPain.total;
    payload["af percentage"] = afPain.percent;
    payload["af1m total"] = af1mPain.total;
    payload["af1m percentage"] = af1mPain.percent;

    // EN pain totals
    payload["pain pre total"] = bfPain.total;
    payload["pain pre percentage"] = bfPain.percent;
    payload["pain post total"] = afPain.total;
    payload["pain post percentage"] = afPain.percent;
    payload["pain post 1 month total"] = af1mPain.total;
    payload["pain post 1 month percentage"] = af1mPain.percent;

    // act totals
    const bfAct = calcTotal(bf, "act");
    const afAct = calcTotal(af, "act");
    const af1mAct = calcTotal(af1m, "act");

    payload["daily bf total"] = bfAct.total;
    payload["daily bf percentage"] = bfAct.percent;
    payload["daily af total"] = afAct.total;
    payload["daily af percentage"] = afAct.percent;
    payload["daily af1m total"] = af1mAct.total;
    payload["daily af1m percentage"] = af1mAct.percent;

    // EN act totals
    payload["daily pre total"] = bfAct.total;
    payload["daily pre percentage"] = bfAct.percent;
    payload["daily post total"] = afAct.total;
    payload["daily post percentage"] = afAct.percent;
    payload["daily post 1 month total"] = af1mAct.total;
    payload["daily post 1 month percentage"] = af1mAct.percent;

    console.log("=== allVisitData ===", JSON.stringify(allVisitData, null, 2));
    console.log("=== merged ===", JSON.stringify(merged, null, 2));
    console.log("=== bf ===", bf);
    console.log("=== af ===", af);
    console.log("=== af1m ===", af1m);
    console.log("=== payload bf_1 ===", payload["bf_1"]);
    console.log("=== payload af 1 ===", payload["af 1"]);
    return payload;
  }

  async function handlePreview() {
    const payload = buildHipPdfPayload(); // ← เรียกครั้งเดียว

    setPdfPreview({ show: true, base64: null, loading: true, error: null });
    const result = await fetchPdfPreview("hip17", payload); // ← ใช้ payload ที่เก็บไว้
    setPdfPreview({
      show: true,
      base64: result.ok ? result.pdf : null,
      loading: false,
      error: result.ok ? null : result.error,
    });
  }

  async function handleConfirmSave() {
    setPdfPreview((prev) => ({ ...prev, show: false }));
    await handleSave();
  }

  useEffect(() => {
    if (!hn || hn === "") return; // ← กัน hn ว่าง

    const fetchAllVisits = async () => {
      const fetchVisit = async (visitType: string) => {
        try {
          const r = await fetch(
            `/api/hip17?hn=${encodeURIComponent(hn)}&visit_type=${encodeURIComponent(visitType)}`,
          );
          if (!r.ok) return null;
          const data = await r.json();
          return data ?? null;
        } catch {
          return null;
        }
      };

      const [bf, af, af1m] = await Promise.all([
        fetchVisit("ก่อนผ่าตัด"),
        fetchVisit("หลังผ่าตัด"),
        fetchVisit("หลังผ่าตัด 1 เดือน"),
      ]);

      console.log("fetchAllVisits result:", { bf, af, af1m });
      setAllVisitData({ bf, af, af1m });
    };

    fetchAllVisits();
  }, [hn]); // ← เพิ่ม hn เป็น dependency

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {showToast && (
        <ToastModal lang={lang} onClose={() => setShowToast(false)} />
      )}

      {/* Navbar */}
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

      <div className="mx-auto w-250 space-y-4 pb-10">
        {/* Patient Info */}
        <div className="bg-white rounded-2xl mx-auto w-250 p-4 shadow-md border-t-4 border-blue-500">
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

        {/* Controls */}
        <div className="bg-white rounded-2xl p-4 shadow-md flex flex-wrap items-center gap-4">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {(["th", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                suppressHydrationWarning
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  lang === l
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {l === "th" ? "ภาษาไทย" : "English"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {t.visitLabel}:
            </span>
            <div className="flex flex-wrap gap-2">
              {t.visitTypes.map((vt) => (
                <button
                  key={vt}
                  type="button"
                  onClick={() => setVisitType(vt)}
                  suppressHydrationWarning
                  className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                    visitType === vt
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {vt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pain */}
        <ScoreGrid
          sectionKey="pain"
          header={t.painHeader}
          items={t.painItems}
          options={t.options}
          selections={painSelections}
          dates={painDates}
          onSelect={(id, score) =>
            setPainSelections((prev) => ({ ...prev, [id]: score }))
          }
          onDateChange={(key, date) =>
            setPainDates((prev) => ({ ...prev, [key]: date }))
          }
          totalLabel={t.totalScore}
        />

        {/* Activity */}
        <ScoreGrid
          sectionKey="act"
          header={t.actHeader}
          items={t.actItems}
          options={t.options}
          selections={actSelections}
          dates={actDates}
          onSelect={(id, score) =>
            setActSelections((prev) => ({ ...prev, [id]: score }))
          }
          onDateChange={(key, date) =>
            setActDates((prev) => ({ ...prev, [key]: date }))
          }
          totalLabel={t.totalScore}
        />

        {/* Assessor + Score Summary */}
        <div className="bg-white rounded-2xl mx-auto w-250 p-4 shadow-md">
          <div className="grid grid-cols-2 gap-3">
            {/* Score Summary */}
            <div className="rounded-xl border border-gray-300 bg-gray-100 p-4 space-y-2">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">
                {t.scoreSummary}
              </p>
              {[
                {
                  label: t.painHeader,
                  sel: painSelections,
                  max: PAIN_ITEMS.en.length,
                },
                {
                  label: t.actHeader,
                  sel: actSelections,
                  max: ACT_ITEMS.en.length,
                },
              ].map(({ label, sel, max }) => {
                const total = Object.values(sel).reduce((s, v) => s + v, 0);
                const pct =
                  Object.keys(sel).length === max
                    ? Math.round(100 - (total * 100) / (max * 4))
                    : null;
                return (
                  <div
                    key={label}
                    className="flex items-center justify-between py-1.5 border-b border-gray-200 last:border-b-0"
                  >
                    <span className="text-sm text-gray-500 truncate max-w-[180px]">
                      {label}
                    </span>
                    <span className="text-sm font-bold text-blue-700 ml-2 shrink-0">
                      {pct !== null ? `${pct}%` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Assessor */}
            <div className="rounded-xl border border-gray-300 bg-gray-100 p-4 space-y-3">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">
                {t.assessorDetails}
              </p>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">
                  {t.assessorName}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={assessorName}
                    onChange={(e) => {
                      setAssessorName(e.target.value);
                      setShowDropdown(true);
                    }}
                    suppressHydrationWarning
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    placeholder="Dr. / นพ. / พท."
                    autoComplete="off"
                    className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  {showDropdown && assessorName && filtered.length > 0 && (
                    <ul className="absolute top-full left-0 z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {filtered.map((item) => (
                        <li
                          key={item}
                          onMouseDown={() => {
                            setAssessorName(item);
                            setShowDropdown(false);
                          }}
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">
                    {t.assessorDate}
                  </label>
                  <input
                    type="date"
                    value={assessorDate}
                    onChange={(e) => setAssessorDate(e.target.value)}
                    className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">
                    {t.assessorTime}
                  </label>
                  <input
                    type="time"
                    value={assessorTime}
                    onChange={(e) => setAssessorTime(e.target.value)}
                    className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">{t.notes}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={2}
                  className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 px-1">Error: {error}</p>}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handlePreview}
            disabled={saving}
            className={`px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
      <PDFPreviewModal
        show={pdfPreview.show}
        pdfBase64={pdfPreview.base64}
        loading={pdfPreview.loading}
        error={pdfPreview.error}
        title="ตรวจสอบ Hip disability ก่อนบันทึก"
        downloadFilename="Hip_Disability_Preview.pdf"
        onConfirm={handleConfirmSave}
        onClose={() => setPdfPreview((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
