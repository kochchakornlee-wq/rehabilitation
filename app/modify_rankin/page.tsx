"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { fetchPdfPreview } from "@/lib/pdf/client";
import PDFPreviewModal from "@/components/PDFPreviewModal";
import { useActiveHN } from "@/lib/useActiveHN";

// ── Supabase ────────────────────────────────────────────────────────────────

// ── Doctor list ─────────────────────────────────────────────────────────────
// เอาชื่อหมอที่มีอยู่มาใส่ตรงนี้ได้เลย
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

// ── Types ────────────────────────────────────────────────────────────────────

type Stage = "admission" | "dc" | "fu";

interface StageData {
  score: number | null;
  date: string;
}

interface MobilityAssessmentData {
  admission: StageData;
  dc: StageData;
  fu: StageData;
  assessor_name: string;
  assessor_date: string;
  assessor_time: string;
  notes: string;
}

interface MobilityAssessmentGridProps {
  patientId: string;
  formType: "opd" | "ipd" | "discharge";
  initialData?: Partial<MobilityAssessmentData>;
  onSaved?: () => void;
}

// ── Score descriptions ───────────────────────────────────────────────────────

const SCORES: { value: number; label: string; danger?: boolean }[] = [
  { value: 0, label: "ไม่มีความผิดปกติเลย" },
  {
    value: 1,
    label:
      "ไม่มีความผิดปกติที่รุนแรง สามารถประกอบกิจวัตรประจำวันได้ตามปกติทุกอย่าง",
  },
  {
    value: 2,
    label: "มีความผิดปกติเล็กน้อย สามารถประกอบกิจวัตรประจำวันได้เกือบทุกอย่าง",
  },
  {
    value: 3,
    label:
      "มีความผิดปกติพอควร ต้องการคนอื่นช่วยในการทำกิจวัตรประจำวันบางอย่าง แต่เดินได้โดยไม่ต้องมีคนช่วย",
  },
  { value: 4, label: "มีความผิดปกติมาก สามารถเดินได้ แต่ต้องมีคนช่วยพยุง" },
  {
    value: 5,
    label:
      "มีความผิดปกติรุนแรง ต้องนอนบนที่เดียว ปัสสาวะราด ต้องการดูแลอย่างใกล้ชิด",
  },
  { value: 6, label: "เสียชีวิต", danger: true },
];

// ── Score label helper ──────────────────────────────────────────────────────
const getScoreLabel = (score: number | null): string => {
  if (score === null) return "";
  const found = SCORES.find((s) => s.value === score);
  return found ? `${found.label} (${score} คะแนน)` : "";
};

const STAGE_LABELS: Record<Stage, string> = {
  admission: "แรกรับ",
  dc: "D/C",
  fu: "F/U",
};

// ── Default state ────────────────────────────────────────────────────────────

const defaultStage = (): StageData => ({ score: null, date: "" });

const defaultData = (): MobilityAssessmentData => ({
  admission: defaultStage(),
  dc: defaultStage(),
  fu: defaultStage(),
  assessor_name: "",
  assessor_date: "",
  assessor_time: "",
  notes: "",
});

const patient = [
  {
    name: "John Doe",
    HN: "123456",
    birth: "01/01/1980",
    admit: "01/01/2024",
    gender: "Male",
    allergies: "Penicillin",
  },
];

interface ToastModalProps {
  onClose: () => void;
}

function ToastModal({ onClose }: ToastModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-80 rounded-2xl bg-white px-8 py-8 text-center shadow-xl">
        {/* กากบาทมุมบนขวา */}
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

        {/* ไอคอน success */}
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
          บันทึกสำเร็จ
        </p>
        <p className="mb-6 text-sm text-gray-500">
          ข้อมูล KOOS ถูกบันทึกเรียบร้อยแล้ว
        </p>

        {/* ปุ่มกลับ */}
        <a
          href="/otherform"
          onClick={onClose}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          กลับสู่แบบฟอร์มผู้ป่วย
        </a>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MobilityAssessmentGrid({
  patientId,
  formType,
  initialData,
  onSaved,
}: MobilityAssessmentGridProps) {
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
  const [showToast, setShowToast] = useState(false);

  // ── Assessment state ──────────────────────────────────────────────────────
  const [data, setData] = useState<MobilityAssessmentData>({
    ...defaultData(),
    ...initialData,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraftSaved = useRef(false);

  // ── Doctor autocomplete state ─────────────────────────────────────────────
  const [showDropdown, setShowDropdown] = useState(false);
  const filtered = DOCTORS.filter((d) =>
    d.toLowerCase().includes(data.assessor_name.toLowerCase()),
  );

  // ── Helpers ───────────────────────────────────────────────────────────────

  const setStageScore = (stage: Stage, score: number) =>
    setData((prev) => ({ ...prev, [stage]: { ...prev[stage], score } }));

  const setStageDate = (stage: Stage, date: string) =>
    setData((prev) => ({ ...prev, [stage]: { ...prev[stage], date } }));

  const setField = (field: keyof MobilityAssessmentData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  // ── Load existing data on mount ───────────────────────────────────────────

  useEffect(() => {
    const hn = patientHN;
    if (!hn) return;
    const fetchData = async () => {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `/api/mobility?hn=${hn}&type=before&date=${today}`,
      );
      const row = await res.json();
      if (!res.ok) return;

      if (!row) return;

      setData((prev) => ({
        ...prev,

        admission: {
          score: row.admission_score ?? null,
          date: row.admission_date ?? "",
        },
        dc: {
          score: row.dc_score ?? null,
          date: row.dc_date ?? "",
        },
        fu: {
          score: row.fu_score ?? null,
          date: row.fu_date ?? "",
        },
        assessor_name: row.assessor_name ?? "",
        assessor_date: row.assessor_date ?? "",
        assessor_time: row.assessor_time ?? "",
        notes: row.notes ?? "",
      }));
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientHN]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const hn = patientHN;

      const payload: Record<string, unknown> = {
        hn: hn || "TEST-56890", // ← เผื่อกรณีไม่มี HN จริงๆ จะได้ไม่ error
        assessor_name: data.assessor_name,
        assessor_date: data.assessor_date || null,
        assessor_time: data.assessor_time || null,
        notes: data.notes,
      };

      if (data.admission.score !== null) {
        payload.admission_score = data.admission.score;
        payload.admission_label = getScoreLabel(data.admission.score);
        payload.admission_date = data.admission.date || null;
      }
      if (data.dc.score !== null) {
        payload.dc_score = data.dc.score;
        payload.dc_label = getScoreLabel(data.dc.score);
        payload.dc_date = data.dc.date || null;
      }
      if (data.fu.score !== null) {
        payload.fu_score = data.fu.score;
        payload.fu_label = getScoreLabel(data.fu.score);
        payload.fu_date = data.fu.date || null;
      }

      const res = await fetch("/api/mobility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(result.error ?? "เกิดข้อผิดพลาด");
        return;
      }

      setPdfPreview((prev) => ({ ...prev, show: false })); // ← ปิด PDF ก่อน
      setShowToast(true);
      onSaved?.();
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleConfirmSave = async () => {
    setPdfPreview((prev) => ({ ...prev, show: false })); // ← ปิด modal ก่อน
    await handleSave(); // ← แล้วค่อย save
  };

  const autoSaveDraft = async () => {
    // ไม่ save ถ้ายังไม่มี HN หรือ save จริงไปแล้ว
    //if (!patientHN || beforeSaved) return

    setAutoSaveStatus("saving");
    try {
      const hn = patientHN;

      const payload: Record<string, unknown> = {
        hn: hn,
        assessor_name: data.assessor_name,
        assessor_date: data.assessor_date || null,
        assessor_time: data.assessor_time || null,
        notes: data.notes,
      };

      if (data.admission.score !== null) {
        payload.admission_score = data.admission.score;
        payload.admission_label = getScoreLabel(data.admission.score);
        payload.admission_date = data.admission.date || null;
      }
      if (data.dc.score !== null) {
        payload.dc_score = data.dc.score;
        payload.dc_label = getScoreLabel(data.dc.score);
        payload.dc_date = data.dc.date || null;
      }
      if (data.fu.score !== null) {
        payload.fu_score = data.fu.score;
        payload.fu_label = getScoreLabel(data.fu.score);
        payload.fu_date = data.fu.date || null;
      }

      await fetch("/api/mobility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    data.assessor_name,
    data.assessor_date,
    data.assessor_time,
    data.notes,
    data.admission,
    data.dc,
    data.fu,
    patientHN,
    data.admission.score,
    data.admission.date,
    data.dc.score,
    data.dc.date,
    data.fu.score,
    data.fu.date,
  ]);

  const [pdfPreview, setPdfPreview] = useState<{
    show: boolean;
    base64: string | null;
    loading: boolean;
    error: string | null;
  }>({ show: false, base64: null, loading: false, error: null });

  function buildRankinPdfPayload() {
    return {
      PatientName: patientName,
      DOB: patientBirth,
      Age: String(hisPatient?.age ?? ""),
      HN: patientHN,
      VN: "",
      VisitDate: hisPatient?.admit_date ?? "",
      Gender: hisPatient?.gender ?? "",
      Allergies: hisPatient?.allergies ?? "",
      assessor_name: data.assessor_name,
      assessor_date: data.assessor_date,
      assessor_time: data.assessor_time,
      admission_score: data.admission.score,
      admission_date: data.admission.date,
      dc_score: data.dc.score,
      dc_date: data.dc.date,
      fu_score: data.fu.score,
      fu_date: data.fu.date,
    };
  }

  async function handlePreview() {
    setPdfPreview({ show: true, base64: null, loading: true, error: null });
    const result = await fetchPdfPreview("rankin", buildRankinPdfPayload());
    setPdfPreview({
      show: true,
      base64: result.ok ? result.pdf : null,
      loading: false,
      error: result.ok ? null : result.error,
    });
  }
  // ── Render ────────────────────────────────────────────────────────────────

  const stages: Stage[] = ["admission", "dc", "fu"];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Navbar */}
      {showToast && <ToastModal onClose={() => setShowToast(false)} />}
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
      <p className="mt-10"></p>

      {/* Patient info card */}
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

      <p className="mb-4"></p>

      {/* Assessment card */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl mx-auto w-250 p-4 shadow-md">
          {/* Header */}
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-black mb-4"
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
            <span className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-4">
              Assessment Grid — กิจวัตรประจำวัน
            </span>
          </div>

          {/* Score Grid */}
          <div className="rounded-xl border border-gray-300 bg-gray-100 overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-[70px_1fr_120px_120px_120px] border-b border-gray-300">
              <div className="px-3 py-2 text-medium font-bold text-blue-800 border-r border-gray-300">
                Score
              </div>
              <div className="px-3 py-2 text-base font-bold text-blue-800 border-r border-gray-300">
                Description (กิจวัตรประจำวัน)
              </div>
              {stages.map((stage) => (
                <div
                  key={stage}
                  className="flex flex-col items-center border-l border-gray-300"
                >
                  <span className="text-medium font-bold text-blue-800 pt-2 pb-1">
                    {STAGE_LABELS[stage]}
                  </span>
                  {/* แสดงวันที่จาก DB ถ้ามี พร้อมให้แก้ได้ */}
                  <input
                    type="date"
                    value={data[stage].date}
                    onChange={(e) => setStageDate(stage, e.target.value)}
                    className={`w-full px-2 pb-1.5 text-[11px] text-center font-bold bg-transparent outline-none border-t border-gray-300 focus:bg-white ${
                      data[stage].date ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  {/* label วันที่อ่านง่ายใต้ input */}
                  {data[stage].date && (
                    <span className="text-[10px] text-gray-400 pb-1">
                      {new Date(data[stage].date).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Score rows */}
            {SCORES.map(({ value, label, danger }) => (
              <div
                key={value}
                className={[
                  "grid grid-cols-[70px_1fr_120px_120px_120px] border-b border-gray-300 last:border-b-0",
                  danger ? "bg-red-50" : "",
                ].join(" ")}
              >
                <div
                  className={[
                    "px-3 py-3.5 text-sm font-bold text-center border-r border-gray-300 self-center",
                    danger ? "text-red-600" : "text-gray-500",
                  ].join(" ")}
                >
                  {value}
                </div>
                <div
                  className={[
                    "px-3 py-3.5 text-sm leading-relaxed border-r border-gray-300",
                    danger ? "text-red-600 font-medium" : "text-gray-500",
                  ].join(" ")}
                >
                  {label}
                </div>
                {stages.map((stage) => (
                  <div
                    key={stage}
                    className="flex items-center justify-center border-l border-gray-300 py-3.5"
                  >
                    <input
                      type="radio"
                      name={`mobility-${stage}`}
                      value={value}
                      checked={data[stage].score === value}
                      onChange={() => setStageScore(stage, value)}
                      className="w-4 h-4 cursor-pointer accent-blue-600"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom panels */}
          <p className="mb-4"></p>
          <div className="grid grid-cols-2 gap-3">
            {/* Score Summary */}
            <div className="rounded-xl border border-gray-300 bg-gray-100 p-4 space-y-2">
              <p className="text-medium font-bold text-blue-800 uppercase tracking-widest mb-3">
                Score Summary
              </p>
              {stages.map((stage) => (
                <div
                  key={stage}
                  className="flex items-center justify-between py-1.5 border-b border-gray-300 last:border-b-0"
                >
                  <span className="text-sm text-gray-500">
                    {stage === "admission"
                      ? "แรกรับ (Admission)"
                      : stage === "dc"
                        ? "จำหน่าย (D/C)"
                        : "ติดตาม (F/U)"}
                  </span>
                  {data[stage].score !== null ? (
                    <span
                      className={[
                        "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium",
                        data[stage].score === 6
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700",
                      ].join(" ")}
                    >
                      {data[stage].score}
                    </span>
                  ) : (
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-gray-400 bg-gray-200">
                      —
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Assessor Details */}
            <div className="rounded-xl border border-gray-300 bg-gray-100 p-4 space-y-3">
              <p className="text-medium font-bold text-blue-800 uppercase tracking-widest mb-3">
                Assessor Details
              </p>

              {/* Doctor autocomplete */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400">
                  ชื่อผู้ประเมิน (Assessor Name)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={data.assessor_name}
                    onChange={(e) => {
                      setField("assessor_name", e.target.value);
                      setShowDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    placeholder="Dr. / นพ. / พท."
                    autoComplete="off"
                    className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  {showDropdown &&
                    data.assessor_name &&
                    filtered.length > 0 && (
                      <ul className="absolute top-full left-0 z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {filtered.map((item) => (
                          <li
                            key={item}
                            onMouseDown={() => {
                              setField("assessor_name", item);
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

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">วันที่ (Date)</label>
                  <input
                    type="date"
                    value={data.assessor_date}
                    onChange={(e) => setField("assessor_date", e.target.value)}
                    className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">เวลา (Time)</label>
                  <input
                    type="time"
                    value={data.assessor_time}
                    onChange={(e) => setField("assessor_time", e.target.value)}
                    className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs text-gray-400">
                  หมายเหตุ (Additional Notes)
                </label>
                <textarea
                  value={data.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder="Enter clinical observations..."
                  rows={2}
                  className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-600 mt-2">Error: {error}</p>}

          {/* Save button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      </div>
      <PDFPreviewModal
        show={pdfPreview.show}
        pdfBase64={pdfPreview.base64}
        loading={pdfPreview.loading}
        error={pdfPreview.error}
        title="ตรวจสอบ The_modified_RANKIN Scale ก่อนบันทึก"
        downloadFilename="The_modified_RANKIN_Preview.pdf"
        onConfirm={handleConfirmSave}
        onClose={() => setPdfPreview((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
