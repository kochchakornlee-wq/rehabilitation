"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, ClipboardList, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { fetchPdfPreview } from "@/lib/pdf/client";
import PDFPreviewModal from "@/components/PDFPreviewModal";
// ─── Types ────────────────────────────────────────────────────────────────────

type BarthelItem = {
  key: string;
  label: string;
  labelTh: string;
  options: { value: number; labelTh: string }[];
};

type AssessmentSession = {
  id: string;
  label: string;
  date: string;
  // key → "คำอธิบาย (คะแนน)" e.g. "ตักอาหารและช่วยตัวเองได้เป็นปกติ (10)"
  scores: Record<string, string | null>;
};

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

// ─── Status Modal ─────────────────────────────────────────────────────────────

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
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl ${
            type === "success" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {type === "success" ? "✅" : "❌"}
        </div>
        <p className="font-medium text-base text-gray-900 mb-1">
          {type === "success" ? "สำเร็จ" : "เกิดข้อผิดพลาด"}
        </p>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <a
          href="/otherform"
          className={`block w-full py-2.5 rounded-xl text-sm font-medium ${
            type === "success"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          Back to Other forms
        </a>
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const BARTHEL_ITEMS: BarthelItem[] = [
  {
    key: "feeding",
    label: "Feeding",
    labelTh: "การรับประทานอาหาร",
    options: [
      { value: 0, labelTh: "ไม่สามารถตักอาหารเข้าปากได้ ต้องมีคนป้อนให้" },
      {
        value: 5,
        labelTh:
          "ช่วยใช้ช้อนตักเตรียมไว้ให้ หรือตัดให้เป็นชิ้นเล็กๆ ไว้ล่วงหน้า",
      },
      { value: 10, labelTh: "ตักอาหารและช่วยตัวเองได้เป็นปกติ" },
    ],
  },
  {
    key: "transfers",
    label: "Transfers",
    labelTh: "ลุกนั่งจากที่นอนหรือจากเตียงไปยังเก้าอี้",
    options: [
      { value: 0, labelTh: "ไม่สามารถนั่งได้ (นั่งแล้วจะล้มเสมอ)" },
      {
        value: 5,
        labelTh: "สามารถนั่งได้ แต่ต้องการความช่วยเหลือมากจากคน 1-2 คน",
      },
      {
        value: 10,
        labelTh: "ต้องการความช่วยเหลือบ้าง เช่นบอกให้ทำตามหรือช่วยพยุงเล็กน้อย",
      },
      {
        value: 15,
        labelTh: "ทำได้เอง รวมทั้งสามารถล็อครถเข็นและยกที่วางเท้าขึ้น",
      },
    ],
  },
  {
    key: "grooming",
    label: "Grooming",
    labelTh: "ล้างหน้า หวีผม แปรงฟัน โกนหนวด",
    options: [
      { value: 0, labelTh: "ต้องการความช่วยเหลือ" },
      {
        value: 5,
        labelTh: "ทำได้เอง (รวมทั้งที่ทำได้เองถ้าเตรียมอุปกรณ์ไว้ให้)",
      },
    ],
  },
  {
    key: "toilet_use",
    label: "Toilet Use",
    labelTh: "การใช้ห้องส้วม",
    options: [
      { value: 0, labelTh: "ช่วยตัวเองไม่ได้" },
      { value: 5, labelTh: "ต้องการความช่วยเหลือ แต่สามารถทำบางอย่างได้เอง" },
      {
        value: 10,
        labelTh:
          "ช่วยตัวเองได้ดี (ขึ้นนั่งและลงจากโถส้วมได้เอง ทำความสะอาดได้)",
      },
    ],
  },
  {
    key: "bathing",
    label: "Bathing",
    labelTh: "การอาบน้ำ",
    options: [
      { value: 0, labelTh: "ต้องมีคนช่วยหรือทำให้" },
      { value: 5, labelTh: "อาบน้ำได้เอง (อาบน้ำฝักบัวได้เอง)" },
    ],
  },
  {
    key: "mobility",
    label: "Mobility",
    labelTh: "การเคลื่อนที่ภายในห้องหรือบ้าน",
    options: [
      { value: 0, labelTh: "นั่งบนรถเข็น แต่ไม่สามารถเคลื่อนที่ไปไหนได้" },
      {
        value: 5,
        labelTh: "นั่งบนรถเข็นแล้วเคลื่อนรถเข็นเองได้ ไม่ต้องมีคนเข็นให้",
      },
      { value: 10, labelTh: "เดินหรือเคลื่อนที่ได้โดยมีคนช่วย 1 คน" },
      {
        value: 15,
        labelTh: "เดินหรือเคลื่อนที่ได้เอง (อาจใช้อุปกรณ์ช่วยเดิน)",
      },
    ],
  },
  {
    key: "stairs",
    label: "Stairs",
    labelTh: "การขึ้น-ลงบันได",
    options: [
      { value: 0, labelTh: "ไม่สามารถทำได้" },
      { value: 5, labelTh: "ต้องการคนช่วยเหลือ" },
      {
        value: 10,
        labelTh:
          "ขึ้น-ลงได้เอง (ถ้าต้องใช้อุปกรณ์ช่วยเดิน ต้องเอาขึ้นลงได้ด้วย)",
      },
    ],
  },
  {
    key: "dressing",
    label: "Dressing",
    labelTh: "การสวมใส่เสื้อผ้า",
    options: [
      { value: 0, labelTh: "ต้องมีคนสวมใส่ให้ ช่วยตัวเองไม่ได้เลยหรือได้น้อย" },
      { value: 5, labelTh: "ช่วยตัวเองได้ราวร้อยละ 50 ที่เหลือต้องมีคนช่วย" },
      { value: 10, labelTh: "ช่วยตัวเองได้ดี รวมทั้งการติดกระดุม รูดซิป" },
    ],
  },
  {
    key: "bowels",
    label: "Bowels",
    labelTh: "การกลั้นอุจจาระ (ใน 1 สัปดาห์ที่ผ่านมา)",
    options: [
      { value: 0, labelTh: "กลั้นไม่ได้" },
      {
        value: 5,
        labelTh:
          "กลั้นไม่ได้เป็นบางครั้ง (น้อยกว่า 1 ครั้งต่อสัปดาห์) หรือต้องการช่วยโดยการสวน",
      },
      { value: 10, labelTh: "กลั้นได้เป็นปกติ" },
    ],
  },
  {
    key: "bladder",
    label: "Bladder",
    labelTh: "การกลั้นปัสสาวะ (ใน 1 สัปดาห์ที่ผ่านมา)",
    options: [
      {
        value: 0,
        labelTh: "กลั้นไม่ได้ หรือใส่สายสวนปัสสาวะแต่ไม่สามารถดูแลเองได้",
      },
      { value: 5, labelTh: "กลั้นไม่ได้เป็นบางครั้ง (น้อยกว่าวันละ 1 ครั้ง)" },
      { value: 10, labelTh: "กลั้นได้เป็นปกติ" },
    ],
  },
];

const MAX_SCORE = 100;

function getInterpretation(score: number): {
  text: string;
  color: string;
  bg: string;
} {
  if (score <= 20)
    return {
      text: "สูญเสียความสามารถมากที่สุด",
      color: "text-red-700",
      bg: "bg-red-50 border-red-200",
    };
  if (score <= 45)
    return {
      text: "สูญเสียความสามารถมาก",
      color: "text-orange-700",
      bg: "bg-orange-50 border-orange-200",
    };
  if (score <= 70)
    return {
      text: "สูญเสียความสามารถปานกลาง",
      color: "text-yellow-700",
      bg: "bg-yellow-50 border-yellow-200",
    };
  if (score <= 95)
    return {
      text: "สูญเสียความสามารถน้อย",
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-200",
    };
  return {
    text: "ทำกิจวัตรประจำวันได้เอง ไม่ต้องมีคนช่วย",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
  };
}

// แปลง "ตักอาหารและช่วยตัวเองได้เป็นปกติ (10)" → 10
function parseScore(val: string | null): number {
  if (!val) return 0;
  const match = val.match(/\((\d+)\)$/);
  return match ? Number(match[1]) : 0;
}

// สร้าง label สำหรับเก็บใน DB: "คำอธิบาย (คะแนน)"
function toScoreLabel(labelTh: string, value: number): string {
  return `${labelTh} (${value})`;
}

function newSession(index: number): AssessmentSession {
  return {
    id: Math.random().toString(36).slice(2),
    label: `ครั้งที่ ${index}`,
    date: new Date().toISOString().split("T")[0],
    scores: Object.fromEntries(BARTHEL_ITEMS.map((i) => [i.key, null])),
  };
}

function calcTotal(scores: Record<string, string | null>): number {
  return Object.values(scores).reduce<number>(
    (sum, v) => sum + parseScore(v),
    0,
  );
}

// ─── Patient Header ────────────────────────────────────────────────────────────

interface Patient {
  name: string;
  HN: string;
  birth: string;
  admit: string;
  gender: string;
  allergies: string;
}

function PatientHeader({ patient }: { patient: Patient }) {
  const initials = patient.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-base leading-tight">
            {patient.name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            HN: {patient.HN} · {patient.gender}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-slate-500">
        <div>
          <span className="text-slate-400">DOB </span>
          {patient.birth}
        </div>
        <div>
          <span className="text-slate-400">Admit </span>
          {patient.admit}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-slate-400">Allergy </span>
          <span className="text-red-600 font-medium">{patient.allergies}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Score Badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const interp = getInterpretation(score);
  return (
    <div className={`rounded-xl border px-4 py-3 ${interp.bg}`}>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold tabular-nums ${interp.color}`}>
          {score}
        </span>
        <span className={`text-sm ${interp.color} opacity-60`}>/ {total}</span>
        <span
          className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 ${interp.color}`}
        >
          {pct}%
        </span>
      </div>
      <p className={`text-xs mt-1 ${interp.color}`}>{interp.text}</p>
    </div>
  );
}

// ─── Score Select Cell ─────────────────────────────────────────────────────────

function ScoreSelectCell({
  item,
  val,
  onScoreChange,
}: {
  item: BarthelItem;
  val: string | null;
  onScoreChange: (key: string, value: string | null) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const score = val ? parseScore(val) : null;
  const selectedOption = val
    ? item.options.find((o) => o.value === score)
    : null;

  return (
    <td className="px-3 py-2 border-b border-slate-100 align-middle">
      <div className="relative">
        {/* Select */}
        <div className="relative">
          <select
            value={val ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onScoreChange(item.key, raw === "" ? null : raw);
            }}
            onFocus={() => setShowTooltip(false)}
            className={`w-full appearance-none text-center text-sm font-semibold rounded-lg py-1.5 pl-2 pr-6 border transition-colors focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer ${
              val === null
                ? "border-slate-200 bg-white text-slate-400"
                : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            <option value="">—</option>
            {item.options.map((o) => {
              const label = toScoreLabel(o.labelTh, o.value);
              return (
                <option key={o.value} value={label}>
                  {o.value} — {o.labelTh}
                </option>
              );
            })}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Tooltip: แสดง label ของตัวเลือกที่เลือกอยู่ */}
        {selectedOption && (
          <p className="mt-1 text-[10px] leading-snug text-blue-500 text-center px-1">
            {selectedOption.labelTh}
          </p>
        )}
      </div>
    </td>
  );
}

// ─── Assessment Table ──────────────────────────────────────────────────────────

function AssessmentTable({
  sessions,
  onScoreChange,
  onDateChange,
  onRemove,
  onAdd,
}: {
  sessions: AssessmentSession[];
  onScoreChange: (id: string, key: string, value: string | null) => void;
  onDateChange: (id: string, date: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {/* Activity label header */}
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-[280px] min-w-[240px]">
              กิจกรรม / รายการ
            </th>
            {/* Session headers */}
            {sessions.map((session, idx) => (
              <th
                key={session.id}
                className="px-3 py-2 min-w-[200px] w-[220px] border-l border-slate-100"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      ครั้งที่ {idx + 1}
                    </span>
                    {sessions.length > 1 && (
                      <button
                        onClick={() => onRemove(session.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors p-0.5 rounded"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={session.date}
                    onChange={(e) => onDateChange(session.id, e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 font-normal"
                  />
                </div>
              </th>
            ))}
            {/* Add session button */}
            {sessions.length < 6 && (
              <th className="px-4 border-l border-slate-100">
                <button
                  onClick={onAdd}
                  className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors group mx-auto"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 group-hover:border-blue-400 flex items-center justify-center transition-colors">
                    <Plus size={16} />
                  </div>
                  <span className="text-[10px] text-center leading-tight font-normal">
                    เพิ่มครั้ง
                  </span>
                </button>
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {BARTHEL_ITEMS.map((item, idx) => (
            <tr
              key={item.key}
              className="hover:bg-slate-50/50 transition-colors"
            >
              {/* Activity label */}
              <td className="px-4 py-3 border-b border-slate-100 border-r border-r-slate-200 align-middle">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-slate-400 tabular-nums shrink-0 mt-0.5">
                    {idx + 1}.
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-700 leading-tight">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400 leading-tight mt-0.5">
                      {item.labelTh}
                    </p>
                  </div>
                </div>
              </td>
              {/* Score cells — one per session */}
              {sessions.map((session) => (
                <ScoreSelectCell
                  key={session.id}
                  item={item}
                  val={session.scores[item.key]}
                  onScoreChange={onScoreChange.bind(null, session.id)}
                />
              ))}
              {sessions.length < 6 && (
                <td className="border-b border-slate-100" />
              )}
            </tr>
          ))}
        </tbody>

        {/* Total row */}
        <tfoot>
          <tr className="bg-slate-50 border-t border-slate-200">
            <td className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-r border-slate-200">
              คะแนนรวม
            </td>
            {sessions.map((session) => {
              const total = calcTotal(session.scores);
              return (
                <td
                  key={session.id}
                  className="px-3 py-2 border-l border-slate-100"
                >
                  <ScoreBadge score={total} total={MAX_SCORE} />
                </td>
              );
            })}
            {sessions.length < 6 && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Main Form ─────────────────────────────────────────────────────────────────

export default function BarthelIndexForm() {
  const searchParams = useSearchParams();
  const hn = searchParams.get("hn") ?? "";

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
  const [sessions, setSessions] = useState<AssessmentSession[]>([
    newSession(1),
  ]);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraftSaved = useRef(false);
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

  const addSession = () => {
    if (sessions.length >= 6) return;
    setSessions((prev) => [...prev, newSession(prev.length + 1)]);
  };

  const removeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const updateScore = (id: string, key: string, value: string | null) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, scores: { ...s.scores, [key]: value } } : s,
      ),
    );
  };

  const [pdfPreview, setPdfPreview] = useState<{
    show: boolean;
    base64: string | null;
    loading: boolean;
    error: string | null;
  }>({ show: false, base64: null, loading: false, error: null });

  const updateDate = (id: string, date: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, date } : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const rows = sessions.map((s, idx) => ({
        hn: patientHN,
        session_number: idx + 1,
        assessed_at: s.date,
        total_score: calcTotal(s.scores),
        feeding: s.scores.feeding ?? null,
        transfers: s.scores.transfers ?? null,
        grooming: s.scores.grooming ?? null,
        toilet_use: s.scores.toilet_use ?? null,
        bathing: s.scores.bathing ?? null,
        mobility: s.scores.mobility ?? null,
        stairs: s.scores.stairs ?? null,
        dressing: s.scores.dressing ?? null,
        bowels: s.scores.bowels ?? null,
        bladder: s.scores.bladder ?? null,
      }));

      const res = await fetch("/api/barthel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });

      const result = await res.json();
      setSaving(false);

      if (!res.ok) showModal("เกิดข้อผิดพลาด: " + result.error, "error");
      else setPdfPreview((prev) => ({ ...prev, show: false })); // ← ปิด PDF ก่อน
      showModal("บันทึกข้อมูลสำเร็จ!");
    } catch (err: any) {
      setSaving(false);
      showModal(err.message ?? "เกิดข้อผิดพลาด", "error");
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
      const rows = sessions.map((s, idx) => ({
        hn: patientHN || "TEST-002",
        type: "before",
        status: "draft", // ← draft เท่านั้น
        session_number: idx + 1,
        assessed_at: s.date,
        total_score: calcTotal(s.scores),
        feeding: s.scores.feeding ?? null,
        transfers: s.scores.transfers ?? null,
        grooming: s.scores.grooming ?? null,
        toilet_use: s.scores.toilet_use ?? null,
        bathing: s.scores.bathing ?? null,
        mobility: s.scores.mobility ?? null,
        stairs: s.scores.stairs ?? null,
        dressing: s.scores.dressing ?? null,
        bowels: s.scores.bowels ?? null,
        bladder: s.scores.bladder ?? null,
      }));

      await fetch("/api/barthel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
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
  }, [sessions]);

  useEffect(() => {
    const prefillFromLastVisit = async () => {
      const res = await fetch(`/api/barthel?hn=${patientHN}`);
      if (!res.ok) return;

      const data = await res.json();
      if (!data || data.length === 0) return;

      const restored: AssessmentSession[] = data.map(
        (row: any, idx: number) => ({
          id: `session-${Date.now()}-${idx}`,
          label: `ครั้งที่ ${idx + 1}`,
          date: row.assessed_at ?? "",
          scores: {
            feeding: row.feeding ?? null,
            transfers: row.transfers ?? null,
            grooming: row.grooming ?? null,
            toilet_use: row.toilet_use ?? null,
            bathing: row.bathing ?? null,
            mobility: row.mobility ?? null,
            stairs: row.stairs ?? null,
            dressing: row.dressing ?? null,
            bowels: row.bowels ?? null,
            bladder: row.bladder ?? null,
          },
        }),
      );

      setSessions(restored);
    };

    prefillFromLastVisit();
  }, []);

  function buildBarthelPdfPayload() {
    return {
      PatientName: patientName,
      DOB: hisPatient?.birthdate ?? "",
      Age: String(hisPatient?.age ?? ""),
      HN: patientHN,
      VN: "",
      VisitDate: hisPatient?.admit_date ?? "",
      Gender: hisPatient?.gender ?? "",
      Allergies: (hisPatient?.allergies ?? []).join(", "),
      sessions: sessions.map((s) => ({
        assessed_at: s.date,
        total_score: calcTotal(s.scores),
        feeding: s.scores.feeding ?? null,
        transfers: s.scores.transfers ?? null,
        grooming: s.scores.grooming ?? null,
        toilet_use: s.scores.toilet_use ?? null,
        bathing: s.scores.bathing ?? null,
        mobility: s.scores.mobility ?? null,
        stairs: s.scores.stairs ?? null,
        dressing: s.scores.dressing ?? null,
        bowels: s.scores.bowels ?? null,
        bladder: s.scores.bladder ?? null,
      })),
    };
  }
  async function handlePreview() {
    setPdfPreview({ show: true, base64: null, loading: true, error: null });
    const result = await fetchPdfPreview("barthel", buildBarthelPdfPayload());
    setPdfPreview({
      show: true,
      base64: result.ok ? result.pdf : null,
      loading: false,
      error: result.ok ? null : result.error,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* StatusModal */}
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
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Page header */}
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
        <p className="p-2"></p>

        {/* Main assessment table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <AssessmentTable
            sessions={sessions}
            onScoreChange={updateScore}
            onDateChange={updateDate}
            onRemove={removeSession}
            onAdd={addSession}
          />
        </div>

        {/* Score interpretation guide */}
        <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            การแปลผลคะแนน (0–100)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              {
                range: "0–20",
                text: "สูญเสียความสามารถมากที่สุด",
                color: "text-red-700 bg-red-50 border-red-200",
              },
              {
                range: "25–45",
                text: "สูญเสียความสามารถมาก",
                color: "text-orange-700 bg-orange-50 border-orange-200",
              },
              {
                range: "50–70",
                text: "ปานกลาง",
                color: "text-yellow-700 bg-yellow-50 border-yellow-200",
              },
              {
                range: "75–95",
                text: "สูญเสียความสามารถน้อย",
                color: "text-blue-700 bg-blue-50 border-blue-200",
              },
              {
                range: "100",
                text: "ทำได้เองทั้งหมด",
                color: "text-green-700 bg-green-50 border-green-200",
              },
            ].map((item) => (
              <div
                key={item.range}
                className={`rounded-xl border px-3 py-2 ${item.color}`}
              >
                <p className="text-sm font-bold tabular-nums">{item.range}</p>
                <p className="text-xs mt-0.5 leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handlePreview}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-blue-200"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
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
