"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { fetchPdfPreview } from "@/lib/pdf/client";
import PDFPreviewModal from "@/components/PDFPreviewModal";
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
function genderLabel(g?: string) {
  if (g === "M" || g === "1") return "Male";
  if (g === "F" || g === "2") return "Female";
  return g ?? "-";
}
// ─── Types ────────────────────────────────────────────────────────────────────

type AssessmentMode = "initial" | "reassessment";

type RomValue =
  | ""
  | "Full ROM"
  | "Limit at inner range"
  | "Limit at middle range"
  | "Limit at outer range";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROM_OPTIONS: RomValue[] = [
  "Full ROM",
  "Limit at inner range",
  "Limit at middle range",
  "Limit at outer range",
];

const ROM_ROWS = [
  { key: "head_neck", label: "Head – Neck" },
  { key: "upper_extremities", label: "Upper Extremities" },
  { key: "lower_extremities", label: "Lower Extremities" },
] as const;

const ADVICE_OPTIONS = [
  "คำแนะนำเรื่อง กายภาพบำบัดเพื่อป้องกันภาวะแทรกซ้อนในผู้ป่วยมะเร็งศีรษะและลำคอ (Head Neck) ตามเอกสาร P/I-BSI-339.1 Rev.0 (01/06/2025)",
  "คำแนะนำเรื่อง กายภาพบำบัดเพื่อป้องกันภาวะแทรกซ้อนในผู้ป่วยมะเร็งเต้านม (Breast cancer) ตามเอกสาร P/I-BSI-323.1 Rev.0 (01/12/2024)",
  "Patient Instruction on physical therapy for prevent complication in Head and neck cancer patient — P/I-BSI-339.2 Rev.0 (01/06/2025)",
  "Patient Instruction on physical therapy for prevent complication in breast cancer patient — P/I-BSI-323.2 Rev.0 (01/02/2025)",
  "ROM exercise",
  "Stretching exercise",
  "Strengthening exercise",
];

const DOCTOR_LIST = [
  "เวนิช สว่างแสง",
  "พนิดา รุ่งพิบูลโสภิษฐ์",
  "พิชญา เพชรละเอียด",
  "ธนัชพร วิไลเลิศ",
  "ศิรดา เดิมคลัง",
  "ชัชนันท์ แก่เมือง",
  "จักษณา ชัยราม",
  "ชรินดา ถาวรวรกุล",
];

// ─── Status Modal ──────────────────────────────────────────────────────────────

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
          href="/otherform"
          className={`block w-full py-2.5 rounded-xl text-sm font-medium ${type === "success" ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
        >
          Back to Other Forms
        </a>
      </div>
    </div>
  );
}

// ─── Section Label ─────────────────────────────────────────────────────────────

function SectionLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <td className="border border-gray-200 px-4 py-3 bg-slate-50 text-center align-middle min-w-[110px]">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </td>
  );
}

// ─── ROM Select ────────────────────────────────────────────────────────────────

function RomSelect({
  value,
  onChange,
}: {
  value: RomValue;
  onChange: (v: RomValue) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as RomValue)}
      className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 cursor-pointer transition-colors"
    >
      <option value="">— Select —</option>
      {ROM_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// ─── Remark Input ──────────────────────────────────────────────────────────────

function RemarkInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Remark..."
      className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors placeholder:text-gray-300"
    />
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CaAssessmentPage() {
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
  // Meta
  const [mode, setMode] = useState<AssessmentMode>("initial");
  const [assessDate, setAssessDate] = useState("");
  const [assessTime, setAssessTime] = useState("");
  const [physiotherapist, setPhysiotherapist] = useState("");
  const [showPhysioDropdown, setShowPhysioDropdown] = useState(false);
  const filteredPhysio = DOCTOR_LIST.filter((d) =>
    d.toLowerCase().includes(physiotherapist.toLowerCase()),
  );
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

  // ROM state: { [rowKey]: { right: RomValue, left: RomValue, remark: string } }
  const [rom, setRom] = useState<
    Record<string, { right: RomValue; left: RomValue; remark: string }>
  >(
    Object.fromEntries(
      ROM_ROWS.map((r) => [r.key, { right: "", left: "", remark: "" }]),
    ),
  );

  // Circumference state
  const [circ, setCirc] = useState({
    upper_right_position: "",
    upper_right_cm: "",
    upper_left_position: "",
    upper_left_cm: "",
    upper_remark: "",
    lower_right_position: "",
    lower_right_cm: "",
    lower_left_position: "",
    lower_left_cm: "",
    lower_remark: "",
  });

  const CIRC_OPTIONS = [
    "Above elbow 10 cm",
    "Below elbow 10 cm",
    "Above knee 20 cm",
    "Below knee 20 cm",
  ];

  // Muscle power
  const [handgripResult, setHandgripResult] = useState("");
  const [handgripLevel, setHandgripLevel] = useState(""); // "Poor, Fair" | "Good" | "Very good, Excellent"

  // Functional ability
  const [reachResult, setReachResult] = useState("");
  const [reachLevel, setReachLevel] = useState("");
  const [tugResult, setTugResult] = useState("");
  const [tugLevel, setTugLevel] = useState("");
  const [handgripRemark, setHandgripRemark] = useState("");
  const [reachRemark, setReachRemark] = useState("");
  const [tugRemark, setTugRemark] = useState("");

  // Other problems
  const [otherProblems, setOtherProblems] = useState("");

  // Advice
  const [advice, setAdvice] = useState<string[]>([]);
  const [adviceDropdown, setAdviceDropdown] = useState(false);

  // UI
  const [saving, setSaving] = useState(false);
  // ─── Diagnosis & Treatment ────────────────────────────────────────────────
  const [diagnosis, setDiagnosis] = useState("");
  const [painScale, setPainScale] = useState("");
  const [underlyingDisease, setUnderlyingDisease] = useState("");
  const [currentTreatment, setCurrentTreatment] = useState<string[]>([]);
  const [currentOther, setCurrentOther] = useState("");
  const [pastTreatment, setPastTreatment] = useState<string[]>([]);
  const [pastOther, setPastOther] = useState("");

  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraftSaved = useRef(false);

  const [pdfPreview, setPdfPreview] = useState<{
    show: boolean;
    base64: string | null;
    loading: boolean;
    error: string | null;
  }>({ show: false, base64: null, loading: false, error: null });

  // ── Prefill ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const prefill = async () => {
      if (!patientHN) return;
      const res = await fetch(`/api/ca?hn=${patientHN}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      setDiagnosis(data.diagnosis ?? "");
      setPainScale(data.pain_scale ?? "");
      setUnderlyingDisease(data.underlying_disease ?? "");
      setCurrentTreatment(data.current_treatment ?? []);
      setCurrentOther(data.current_other ?? "");
      setPastTreatment(data.past_treatment ?? []);
      setPastOther(data.past_other ?? "");
      setMode(data.assessment_mode ?? "initial");
      setAssessDate(data.assessed_at ?? "");
      setAssessTime(data.assessed_time ?? "");
      setPhysiotherapist(data.physiotherapist ?? "");

      const restoredRom: typeof rom = {};
      for (const row of ROM_ROWS) {
        restoredRom[row.key] = {
          right: data[`rom_${row.key}_right`] ?? "",
          left: data[`rom_${row.key}_left`] ?? "",
          remark: data[`rom_${row.key}_remark`] ?? "",
        };
      }
      setRom(restoredRom);

      setCirc({
        upper_right_position: data.circ_upper_right_position ?? "",
        upper_right_cm: data.circ_upper_right_cm ?? "",
        upper_left_position: data.circ_upper_left_position ?? "",
        upper_left_cm: data.circ_upper_left_cm ?? "",
        upper_remark: data.circ_upper_remark ?? "",
        lower_right_position: data.circ_lower_right_position ?? "",
        lower_right_cm: data.circ_lower_right_cm ?? "",
        lower_left_position: data.circ_lower_left_position ?? "",
        lower_left_cm: data.circ_lower_left_cm ?? "",
        lower_remark: data.circ_lower_remark ?? "",
      });

      setHandgripResult(data.handgrip_result ?? "");
      setHandgripLevel(data.handgrip_level ?? "");
      setReachResult(data.reach_result ?? "");
      setReachLevel(data.reach_level ?? "");
      setTugResult(data.tug_result ?? "");
      setTugLevel(data.tug_level ?? "");
      setOtherProblems(data.other_problems ?? "");

      const raw = data.advice_suggestions;
      setAdvice(
        Array.isArray(raw)
          ? raw
          : typeof raw === "string"
            ? JSON.parse(raw)
            : [],
      );
    };

    prefill();
  }, [patientHN]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const setRomField = (
    key: string,
    side: "right" | "left" | "remark",
    val: string,
  ) => {
    setRom((prev) => ({ ...prev, [key]: { ...prev[key], [side]: val } }));
  };

  const toggleAdvice = (item: string) => {
    setAdvice((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        hn: patientHN,
        patient_name: patientName,
        patientInfo: {
          hn: patientHN,
          name: patientName, // ดึงจาก state ที่ได้จาก HIS API
          gender: patientGender,
          dob: patientBirth,
          allergies: patientAllergy,
        },
        assessment_mode: mode,
        assessed_at: assessDate,
        assessed_time: assessTime,
        physiotherapist: physiotherapist,
        // ROM — flatten จาก object
        ...Object.fromEntries(
          ROM_ROWS.flatMap((row) => [
            [`rom_${row.key}_right`, rom[row.key]?.right ?? null],
            [`rom_${row.key}_left`, rom[row.key]?.left ?? null],
            [`rom_${row.key}_remark`, rom[row.key]?.remark ?? null],
          ]),
        ),
        // Circumference
        circ_upper_right_position: circ.upper_right_position,
        circ_upper_right_cm: circ.upper_right_cm,
        circ_upper_left_position: circ.upper_left_position,
        circ_upper_left_cm: circ.upper_left_cm,
        circ_upper_remark: circ.upper_remark,
        circ_lower_right_position: circ.lower_right_position,
        circ_lower_right_cm: circ.lower_right_cm,
        circ_lower_left_position: circ.lower_left_position,
        circ_lower_left_cm: circ.lower_left_cm,
        circ_lower_remark: circ.lower_remark,
        // Functional
        handgrip_result: handgripResult,
        handgrip_level: handgripLevel,
        reach_result: reachResult,
        reach_level: reachLevel,
        tug_result: tugResult,
        tug_level: tugLevel,
        other_problems: otherProblems,
        advice_suggestions: advice,
        diagnosis: diagnosis || null,
        pain_scale: painScale || null,
        underlying_disease: underlyingDisease || null,
        current_treatment: currentTreatment,
        current_other: currentOther || null,
        past_treatment: pastTreatment,
        past_other: pastOther || null,
      };

      const res = await fetch("/api/ca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let result: any = {};
      try {
        result = await res.json();
      } catch {
        // response ไม่ใช่ JSON ก็ไม่ crash
      }
      setSaving(false);

      // ✅ ใหม่
      if (!res.ok) {
        showModal(
          "เกิดข้อผิดพลาด: " + (result?.error ?? res.statusText),
          "error",
        );
      } else {
        showModal("บันทึกข้อมูลสำเร็จ!");
      }
    } catch (err: any) {
      setSaving(false);
      showModal(
        "เกิดข้อผิดพลาด: " + (err?.message ?? "network error"),
        "error",
      ); // ← เพิ่มตรงนี้ด้วย
    }
  };

  function buildCancerPdfPayload() {
    // เพิ่มตรงนี้ก่อน buildCancerPdfPayload หรือข้างในฟังก์ชันก็ได้
    const REACH_LEVEL_MAP: Record<string, string> = {
      "Low risk of falling (greater than 10 inches)": "low",
      "Moderate risk (7-10 inches)": "moderate",
      "High risk of falling (6 inches or below)": "high",
      "Unable to do": "unable",
    };

    const TUG_LEVEL_MAP: Record<string, string> = {
      "Normal (≤ 10 seconds)": "normal",
      "Low risk to moderate risk of falling (11-20 seconds)": "low",
      "High risk of falling (> 20 seconds)": "high",
      "Unable to walk": "unable",
    };
    return {
      PatientName: patientName,
      DOB: patientBirth ?? "",
      Age: String(hisPatient?.age ?? ""),
      HN: patientHN,
      VN: "",
      VisitDate: hisPatient?.admit_date ?? "",
      Gender: hisPatient?.gender ?? "",
      Allergies: (hisPatient?.allergies ?? []).join(", "),
      assessmentMode: mode, // "initial" | "reassessment"
      physiotherapist,
      assessDate,
      assessTime,
      // ROM
      // ROM
      romHeadNeckRight: rom.head_neck?.right ?? "",
      romHeadNeckLeft: rom.head_neck?.left ?? "",
      romHeadNeckRemark: rom.head_neck?.remark ?? "",
      romUpperRight: rom.upper_extremities?.right ?? "", // ← แก้
      romUpperLeft: rom.upper_extremities?.left ?? "", // ← แก้
      romUpperRemark: rom.upper_extremities?.remark ?? "", // ← แก้
      romLowerRight: rom.lower_extremities?.right ?? "", // ← แก้
      romLowerLeft: rom.lower_extremities?.left ?? "", // ← แก้
      romLowerRemark: rom.lower_extremities?.remark ?? "", // ← แก้
      // Circumference
      circUpperRightPosition: circ.upper_right_position,
      circUpperRightCm: circ.upper_right_cm,
      circUpperLeftPosition: circ.upper_left_position,
      circUpperLeftCm: circ.upper_left_cm,
      circUpperRemark: circ.upper_remark,
      circLowerRightPosition: circ.lower_right_position,
      circLowerRightCm: circ.lower_right_cm,
      circLowerLeftPosition: circ.lower_left_position,
      circLowerLeftCm: circ.lower_left_cm,
      circLowerRemark: circ.lower_remark,
      // Functional
      handgripResult,
      handgripLevel,
      handgripRemark,
      reachResult,
      reachLevel: REACH_LEVEL_MAP[reachLevel] ?? reachLevel,
      reachRemark,
      tugResult,
      tugLevel: TUG_LEVEL_MAP[tugLevel] ?? tugLevel,

      tugRemark,
      otherProblems,
      diagnosis,
      painScale,
      underlyingDisease,
      currentTreatment,
      currentOther,
      pastTreatment,
      pastOther,
      suggestion: advice.join(", "),
    };
  }
  async function handlePreview() {
    const payload = buildCancerPdfPayload();
    console.log("payload:", JSON.stringify(payload));
    setPdfPreview({ show: true, base64: null, loading: true, error: null });
    const result = await fetchPdfPreview("cancer", buildCancerPdfPayload());
    setPdfPreview({
      show: true,
      base64: result.ok ? result.pdf : null,
      loading: false,
      error: result.ok ? null : result.error,
    });
  }

  const handleConfirmSave = async () => {
    setPdfPreview((prev) => ({ ...prev, show: false })); // ← ปิด modal ก่อน
    await handleSave(); // ← แล้วค่อย save
  };

  const autoSaveDraft = async () => {
    // ไม่ save ถ้ายังไม่มี HN หรือ save จริงไปแล้ว
    //if (!patientHN || beforeSaved) return

    setAutoSaveStatus("saving");
    try {
      const body = {
        hn: patientHN,
        patient_name: patientName,
        status: "draft",
        assessment_mode: mode,
        assessed_at: assessDate,
        assessed_time: assessTime,
        physiotherapist: physiotherapist,
        // ROM — flatten จาก object
        ...Object.fromEntries(
          ROM_ROWS.flatMap((row) => [
            [`rom_${row.key}_right`, rom[row.key]?.right ?? null],
            [`rom_${row.key}_left`, rom[row.key]?.left ?? null],
            [`rom_${row.key}_remark`, rom[row.key]?.remark ?? null],
          ]),
        ),
        // Circumference
        circ_upper_right_position: circ.upper_right_position,
        circ_upper_right_cm: circ.upper_right_cm,
        circ_upper_left_position: circ.upper_left_position,
        circ_upper_left_cm: circ.upper_left_cm,
        circ_upper_remark: circ.upper_remark,
        circ_lower_right_position: circ.lower_right_position,
        circ_lower_right_cm: circ.lower_right_cm,
        circ_lower_left_position: circ.lower_left_position,
        circ_lower_left_cm: circ.lower_left_cm,
        circ_lower_remark: circ.lower_remark,
        // Functional
        handgrip_result: handgripResult,
        handgrip_level: handgripLevel,
        reach_result: reachResult,
        reach_level: reachLevel,
        tug_result: tugResult,
        tug_level: tugLevel,
        other_problems: otherProblems,
        advice_suggestions: advice,
        diagnosis: diagnosis || null,
        pain_scale: painScale || null,
        underlying_disease: underlyingDisease || null,
        current_treatment: currentTreatment,
        current_other: currentOther || null,
        past_treatment: pastTreatment,
        past_other: pastOther || null,
      };

      await fetch("/api/ca", {
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
    //if (!patientHN || !visitType) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      autoSaveDraft();
    }, 10000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [
    mode,
    assessDate,
    assessTime,
    physiotherapist,
    ROM_ROWS.map((r) => [
      rom[r.key]?.right,
      rom[r.key]?.left,
      rom[r.key]?.remark,
    ]).flat(),
    circ,
    handgripResult,
    handgripLevel,
    reachResult,
    reachLevel,
    tugResult,
    tugLevel,
    otherProblems,
    advice,
  ]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <StatusModal
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal((prev) => ({ ...prev, show: false }))}
      />

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

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Header card */}
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

        <div className="flex justify-center">
          <div className="bg-white rounded-2xl w-250 border border-gray-100 shadow-sm px-5 py-4 mt-0">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Diagnosis & Treatment
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {/* Diagnosis */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="ระบุการวินิจฉัย..."
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                />
              </div>
              {/* Pain scale */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Pain Scale</label>
                <input
                  type="text"
                  value={painScale}
                  onChange={(e) => setPainScale(e.target.value)}
                  placeholder="0–10"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                />
              </div>
              {/* Underlying disease */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">
                  Underlying Disease
                </label>
                <input
                  type="text"
                  value={underlyingDisease}
                  onChange={(e) => setUnderlyingDisease(e.target.value)}
                  placeholder="โรคประจำตัว..."
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                />
              </div>
            </div>

            {/* Current Treatment */}
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-2">
                Current Treatment
              </label>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {[
                  "None",
                  "Chemotherapy",
                  "Radiotherapy",
                  "Hormone therapy",
                ].map((tx) => (
                  <label
                    key={tx}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={currentTreatment.includes(tx)}
                      onChange={() =>
                        setCurrentTreatment((prev) =>
                          prev.includes(tx)
                            ? prev.filter((v) => v !== tx)
                            : [...prev, tx],
                        )
                      }
                      className="w-3.5 h-3.5 accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">{tx}</span>
                  </label>
                ))}
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      currentTreatment.some(
                        (t) =>
                          ![
                            "None",
                            "Chemotherapy",
                            "Radiotherapy",
                            "Hormone therapy",
                          ].includes(t),
                      ) || currentOther !== ""
                    }
                    onChange={(e) => {
                      if (!e.target.checked) setCurrentOther("");
                    }}
                    className="w-3.5 h-3.5 accent-blue-500"
                  />
                  <span className="text-sm text-gray-600">Other</span>
                </label>
                <input
                  type="text"
                  value={currentOther}
                  onChange={(e) => setCurrentOther(e.target.value)}
                  placeholder="ระบุ..."
                  className="border border-gray-200 rounded-lg px-2.5 py-1 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors w-40"
                />
              </div>
            </div>

            {/* Past Treatment */}
            <div>
              <label className="text-xs text-gray-500 block mb-2">
                Past Treatment
              </label>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {[
                  "None",
                  "Chemotherapy",
                  "Radiotherapy",
                  "Hormone therapy",
                ].map((tx) => (
                  <label
                    key={tx}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={pastTreatment.includes(tx)}
                      onChange={() =>
                        setPastTreatment((prev) =>
                          prev.includes(tx)
                            ? prev.filter((v) => v !== tx)
                            : [...prev, tx],
                        )
                      }
                      className="w-3.5 h-3.5 accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">{tx}</span>
                  </label>
                ))}
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pastOther !== ""}
                    onChange={(e) => {
                      if (!e.target.checked) setPastOther("");
                    }}
                    className="w-3.5 h-3.5 accent-blue-500"
                  />
                  <span className="text-sm text-gray-600">Other</span>
                </label>
                <input
                  type="text"
                  value={pastOther}
                  onChange={(e) => setPastOther(e.target.value)}
                  placeholder="ระบุ..."
                  className="border border-gray-200 rounded-lg px-2.5 py-1 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors w-40"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        {/* Assessment Table */}
        <div className="bg-white  rounded-2xl w-250 border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-sm font-semibold text-slate-700">Assessment</h2>
            <div className="flex items-center gap-5">
              <span className="text-xs text-gray-400">Assessment Type</span>
              <div className="flex gap-4">
                {(
                  [
                    { value: "initial", label: "Initial Assessment" },
                    { value: "reassessment", label: "Reassessment" },
                  ] as { value: AssessmentMode; label: string }[]
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      className="w-4 h-4 accent-blue-500"
                      checked={mode === opt.value}
                      onChange={() => setMode(opt.value)}
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200">
                  <th className="border border-gray-200 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[110px]">
                    Assessment
                  </th>
                  <th className="border border-gray-200 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[160px]">
                    Items
                  </th>
                  <th className="border border-gray-200 px-4 py-2.5 text-xs font-semibold text-red-400 uppercase tracking-wide w-[200px]">
                    Right
                  </th>
                  <th className="border border-gray-200 px-4 py-2.5 text-xs font-semibold text-red-400 uppercase tracking-wide w-[200px]">
                    Left
                  </th>
                  <th className="border border-gray-200 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* ── ROM ── */}
                {ROM_ROWS.map((row, idx) => (
                  <tr
                    key={row.key}
                    className={idx % 2 === 1 ? "bg-slate-50/50" : ""}
                  >
                    {idx === 0 && (
                      <td
                        rowSpan={ROM_ROWS.length}
                        className="border border-gray-200 px-4 py-3 bg-slate-50 text-center align-middle"
                      >
                        <p className="text-sm font-semibold text-slate-700">
                          ROM
                        </p>
                      </td>
                    )}
                    <td className="border border-gray-200 px-4 py-2.5 text-sm text-slate-600">
                      {row.label}
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <RomSelect
                        value={rom[row.key]?.right ?? ""}
                        onChange={(v) => setRomField(row.key, "right", v)}
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <RomSelect
                        value={rom[row.key]?.left ?? ""}
                        onChange={(v) => setRomField(row.key, "left", v)}
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <RemarkInput
                        value={rom[row.key]?.remark ?? ""}
                        onChange={(v) => setRomField(row.key, "remark", v)}
                      />
                    </td>
                  </tr>
                ))}

                {/* ── Circumference ── */}
                {(["upper", "lower"] as const).map((side, idx) => (
                  <tr
                    key={side}
                    className={idx % 2 === 0 ? "bg-blue-50/20" : ""}
                  >
                    {idx === 0 && (
                      <td
                        rowSpan={2}
                        className="border border-gray-200 px-4 py-3 bg-slate-50 text-center align-middle"
                      >
                        <p className="text-sm font-semibold text-slate-700">
                          Circumference
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">(cm)</p>
                      </td>
                    )}
                    <td className="border border-gray-200 px-4 py-2.5 text-sm text-slate-600">
                      {side === "upper"
                        ? "Upper Extremities"
                        : "Lower Extremities"}
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <div className="flex flex-col gap-1.5">
                        <select
                          value={circ[`${side}_right_position`]}
                          onChange={(e) =>
                            setCirc((prev) => ({
                              ...prev,
                              [`${side}_right_position`]: e.target.value,
                              [`${side}_right_cm`]: "",
                            }))
                          }
                          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                        >
                          <option value="">— Select position —</option>
                          {CIRC_OPTIONS.map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                        {circ[`${side}_right_position`] && (
                          <input
                            type="text"
                            placeholder="____ cm"
                            value={circ[`${side}_right_cm`]}
                            onChange={(e) =>
                              setCirc((prev) => ({
                                ...prev,
                                [`${side}_right_cm`]: e.target.value,
                              }))
                            }
                            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors placeholder:text-gray-300"
                          />
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <div className="flex flex-col gap-1.5">
                        <select
                          value={circ[`${side}_left_position`]}
                          onChange={(e) =>
                            setCirc((prev) => ({
                              ...prev,
                              [`${side}_left_position`]: e.target.value,
                              [`${side}_left_cm`]: "",
                            }))
                          }
                          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                        >
                          <option value="">— Select position —</option>
                          {CIRC_OPTIONS.map((opt) => (
                            <option key={opt}>{opt}</option>
                          ))}
                        </select>
                        {circ[`${side}_left_position`] && (
                          <input
                            type="text"
                            placeholder="____ cm"
                            value={circ[`${side}_left_cm`]}
                            onChange={(e) =>
                              setCirc((prev) => ({
                                ...prev,
                                [`${side}_left_cm`]: e.target.value,
                              }))
                            }
                            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors placeholder:text-gray-300"
                          />
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <RemarkInput
                        value={circ[`${side}_remark`]}
                        onChange={(v) =>
                          setCirc((prev) => ({
                            ...prev,
                            [`${side}_remark`]: v,
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}

                {/* ── Muscle power — Hand grip ── */}
                <tr>
                  <td
                    rowSpan={1}
                    className="border border-gray-200 px-4 py-3 bg-slate-50 text-center align-middle"
                  >
                    <p className="text-sm font-semibold text-slate-700">
                      Muscle power
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      and strength
                    </p>
                  </td>
                  <td className="border border-gray-200 px-4 py-2.5 text-sm text-slate-600">
                    Hand grip
                  </td>
                  <td colSpan={2} className="border border-gray-200 px-3 py-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 shrink-0">
                          Result:
                        </span>
                        <input
                          type="text"
                          placeholder="____ Kg"
                          value={handgripResult}
                          onChange={(e) => setHandgripResult(e.target.value)}
                          className="w-32 text-sm border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors placeholder:text-gray-300"
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {["Poor, Fair", "Good", "Very good, Excellent"].map(
                          (opt) => (
                            <label
                              key={opt}
                              className="flex items-center gap-1.5 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="handgrip"
                                value={opt}
                                checked={handgripLevel === opt}
                                onChange={() => setHandgripLevel(opt)}
                                className="w-3.5 h-3.5 focus:ring-blue-400"
                              />
                              <span className="text-xs text-gray-500">
                                {opt}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="border border-gray-200 px-3 py-2">
                    <RemarkInput
                      value={handgripRemark}
                      onChange={setHandgripRemark}
                    />
                  </td>
                </tr>

                {/* ── Functional ability — Reach test ── */}
                <tr className="bg-slate-50/50">
                  <td
                    rowSpan={2}
                    className="border border-gray-200 px-4 py-3 bg-slate-50 text-center align-middle"
                  >
                    <p className="text-sm font-semibold text-slate-700">
                      Functional
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      ability
                    </p>
                  </td>
                  <td className="border border-gray-200 px-4 py-2.5 text-sm text-slate-600">
                    Reach test
                  </td>
                  <td colSpan={2} className="border border-gray-200 px-3 py-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 shrink-0">
                          Result:
                        </span>
                        <input
                          type="text"
                          placeholder="____ inches"
                          value={reachResult}
                          onChange={(e) => setReachResult(e.target.value)}
                          className="w-36 text-sm border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors placeholder:text-gray-300"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {[
                          "Low risk of falling (greater than 10 inches)",
                          "Moderate risk (7-10 inches)",
                          "High risk of falling (6 inches or below)",
                          "Unable to do",
                        ].map((opt) => (
                          <label
                            key={opt}
                            className="flex items-center gap-1.5 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="reach"
                              value={opt}
                              checked={reachLevel === opt}
                              onChange={() => setReachLevel(opt)}
                              className="w-3.5 h-3.5 focus:ring-blue-400"
                            />
                            <span className="text-xs text-gray-500">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="border border-gray-200 px-3 py-2">
                    <RemarkInput
                      value={reachRemark}
                      onChange={setReachRemark}
                    />
                  </td>
                </tr>

                {/* ── Functional ability — Time up and go ── */}
                <tr>
                  <td className="border border-gray-200 px-4 py-2.5 text-sm text-slate-600">
                    Time up and go test
                  </td>
                  <td colSpan={2} className="border border-gray-200 px-3 py-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 shrink-0">
                          Result:
                        </span>
                        <input
                          type="text"
                          placeholder="____ seconds"
                          value={tugResult}
                          onChange={(e) => setTugResult(e.target.value)}
                          className="w-36 text-sm border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors placeholder:text-gray-300"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {[
                          "Normal (≤ 10 seconds)",
                          "Low risk to moderate risk of falling (11-20 seconds)",
                          "High risk of falling (> 20 seconds)",
                          "Unable to walk",
                        ].map((opt) => (
                          <label
                            key={opt}
                            className="flex items-center gap-1.5 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="tug"
                              value={opt}
                              checked={tugLevel === opt}
                              onChange={() => setTugLevel(opt)}
                              className="w-3.5 h-3.5 focus:ring-blue-400"
                            />
                            <span className="text-xs text-gray-500">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="border border-gray-200 px-3 py-2">
                    <RemarkInput value={tugRemark} onChange={setTugRemark} />
                  </td>
                </tr>

                {/* ── Other problems ── */}
                <tr className="bg-slate-50/50">
                  <td className="border border-gray-200 px-4 py-3 bg-slate-50 text-center align-middle">
                    <p className="text-sm font-semibold text-slate-700">
                      Other problems
                    </p>
                  </td>
                  <td className="border border-gray-200 px-4 py-2.5 text-sm text-slate-400 italic text-center">
                    —
                  </td>
                  <td colSpan={3} className="border border-gray-200 px-3 py-2">
                    <textarea
                      rows={2}
                      value={otherProblems}
                      onChange={(e) => setOtherProblems(e.target.value)}
                      placeholder="ระบุปัญหาอื่นๆ..."
                      className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors placeholder:text-gray-300 resize-none"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Advice and suggestions */}
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl w-250 border border-gray-100 shadow-sm px-5 py-4 mt-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Advice and suggestions
          </h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setAdviceDropdown((prev) => !prev)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-left bg-white text-gray-700 flex justify-between items-center hover:border-blue-300 transition-colors focus:outline-none focus:border-blue-400"
            >
              <span
                className={
                  advice.length === 0 ? "text-gray-400" : "text-gray-700"
                }
              >
                {advice.length === 0
                  ? "— เลือกคำแนะนำ (เลือกได้หลายข้อ) —"
                  : `เลือกแล้ว ${advice.length} ข้อ`}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${adviceDropdown ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {adviceDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {ADVICE_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                  >
                    <input
                      type="checkbox"
                      checked={advice.includes(item)}
                      onChange={() => toggleAdvice(item)}
                      className="mt-0.5 w-4 h-4 accent-blue-500 shrink-0"
                    />
                    <span className="text-sm text-gray-700 leading-snug">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Selected advice chips */}
          {advice.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {advice.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5"
                >
                  <span className="text-xs text-blue-700 leading-snug max-w-xs truncate">
                    {item}
                  </span>
                  <button
                    onClick={() => toggleAdvice(item)}
                    className="text-blue-400 hover:text-blue-600 shrink-0 ml-0.5"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer — Physiotherapist + Date + Time + Save */}
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl border w-250 mt-4 border-gray-100 shadow-sm px-5 py-4">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Physiotherapist autocomplete */}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px] relative">
              <label className="text-xs text-gray-500">Physiotherapist</label>
              <input
                type="text"
                value={physiotherapist}
                onChange={(e) => {
                  setPhysiotherapist(e.target.value);
                  setShowPhysioDropdown(true);
                }}
                onBlur={() =>
                  setTimeout(() => setShowPhysioDropdown(false), 150)
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                placeholder="ค้นหาชื่อนักกายภาพ..."
              />
              {showPhysioDropdown &&
                physiotherapist &&
                filteredPhysio.length > 0 && (
                  <div className="absolute top-full left-0 z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
                    {filteredPhysio.map((name) => (
                      <div
                        key={name}
                        onMouseDown={() => {
                          setPhysiotherapist(name);
                          setShowPhysioDropdown(false);
                        }}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Date</label>
              <input
                type="date"
                value={assessDate}
                onChange={(e) => setAssessDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
              />
            </div>

            {/* Time */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Time</label>
              <input
                type="time"
                value={assessTime}
                onChange={(e) => setAssessTime(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
              />
            </div>

            {/* Save */}
            <button
              onClick={handlePreview}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 ml-auto"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </div>
      </div>
      <PDFPreviewModal
        show={pdfPreview.show}
        pdfBase64={pdfPreview.base64}
        loading={pdfPreview.loading}
        error={pdfPreview.error}
        title="ตรวจสอบ Time Up and Go Test ก่อนบันทึก"
        downloadFilename="Time_Up_Preview.pdf"
        onConfirm={handleConfirmSave}
        onClose={() => setPdfPreview((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
