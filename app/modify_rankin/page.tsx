"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@supabase/supabase-js"

// ── Supabase ────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
      "ชรินดา ถาวรวรกุล"
]

// ── Types ────────────────────────────────────────────────────────────────────

type Stage = "admission" | "dc" | "fu"

interface StageData {
  score: number | null
  date: string
}

interface MobilityAssessmentData {
  admission: StageData
  dc: StageData
  fu: StageData
  assessor_name: string
  assessor_date: string
  assessor_time: string
  notes: string
}

interface MobilityAssessmentGridProps {
  patientId: string
  formType: "opd" | "ipd" | "discharge"
  initialData?: Partial<MobilityAssessmentData>
  onSaved?: () => void
}

// ── Score descriptions ───────────────────────────────────────────────────────

const SCORES: { value: number; label: string; danger?: boolean }[] = [
  { value: 0, label: "ไม่มีความผิดปกติเลย" },
  { value: 1, label: "ไม่มีความผิดปกติที่รุนแรง สามารถประกอบกิจวัตรประจำวันได้ตามปกติทุกอย่าง" },
  { value: 2, label: "มีความผิดปกติเล็กน้อย สามารถประกอบกิจวัตรประจำวันได้เกือบทุกอย่าง" },
  { value: 3, label: "มีความผิดปกติพอควร ต้องการคนอื่นช่วยในการทำกิจวัตรประจำวันบางอย่าง แต่เดินได้โดยไม่ต้องมีคนช่วย" },
  { value: 4, label: "มีความผิดปกติมาก สามารถเดินได้ แต่ต้องมีคนช่วยพยุง" },
  { value: 5, label: "มีความผิดปกติรุนแรง ต้องนอนบนที่เดียว ปัสสาวะราด ต้องการดูแลอย่างใกล้ชิด" },
  { value: 6, label: "เสียชีวิต", danger: true },
]

// ── Score label helper ──────────────────────────────────────────────────────
const getScoreLabel = (score: number | null): string => {
  if (score === null) return ""
  const found = SCORES.find((s) => s.value === score)
  return found ? `${found.label} (${score} คะแนน)` : ""
}

const STAGE_LABELS: Record<Stage, string> = {
  admission: "แรกรับ",
  dc: "D/C",
  fu: "F/U",
}

// ── Default state ────────────────────────────────────────────────────────────

const defaultStage = (): StageData => ({ score: null, date: "" })

const defaultData = (): MobilityAssessmentData => ({
  admission: defaultStage(),
  dc: defaultStage(),
  fu: defaultStage(),
  assessor_name: "",
  assessor_date: "",
  assessor_time: "",
  notes: "",
})

const patient = [
    {
      name: "John Doe",
      HN: "123456",
      birth: "01/01/1980",
      admit: "01/01/2024",
      gender: "Male",
      allergies: "Penicillin",
    }
]

interface ToastModalProps {
  onClose: () => void
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
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ไอคอน success */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="mb-1 text-base font-semibold text-gray-800">บันทึกสำเร็จ</p>
        <p className="mb-6 text-sm text-gray-500">ข้อมูล KOOS ถูกบันทึกเรียบร้อยแล้ว</p>

        {/* ปุ่มกลับ */}
        <a href="/patient"
          onClick={onClose}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          กลับสู่แบบฟอร์มผู้ป่วย
        </a>
      </div>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MobilityAssessmentGrid({
  patientId,
  formType,
  initialData,
  onSaved,
}: MobilityAssessmentGridProps) {
  const [showToast, setShowToast] = useState(false)
  const patient1 = [
    {
      name: "John Doe",
      HN: "123456",
      birth: "01/01/1980",
      admit: "01/01/2024",
      gender: "Male",
      allergies: "Penicillin",
    },
  ]

  // ── Assessment state ──────────────────────────────────────────────────────
  const [data, setData] = useState<MobilityAssessmentData>({
    ...defaultData(),
    ...initialData,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Doctor autocomplete state ─────────────────────────────────────────────
  const [showDropdown, setShowDropdown] = useState(false)
  const filtered = DOCTORS.filter((d) =>
    d.toLowerCase().includes(data.assessor_name.toLowerCase())
  )

  // ── Helpers ───────────────────────────────────────────────────────────────

  const setStageScore = (stage: Stage, score: number) =>
    setData((prev) => ({ ...prev, [stage]: { ...prev[stage], score } }))

  const setStageDate = (stage: Stage, date: string) =>
    setData((prev) => ({ ...prev, [stage]: { ...prev[stage], date } }))

  const setField = (field: keyof MobilityAssessmentData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }))

  // ── Load existing data on mount ───────────────────────────────────────────

  useEffect(() => {
    const hn = patient1[0].HN
    const fetchData = async () => {
      const { data: row } = await supabase
        .from("mobility_assessment")
        .select("*")
        .eq("hn", hn)
        .single()

      if (!row) return

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
      }))
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    const hn = patient1[0].HN

    const payload: Record<string, unknown> = {
      hn: hn,
      assessor_name: data.assessor_name,
      assessor_date: data.assessor_date || null,
      assessor_time: data.assessor_time || null,
      notes: data.notes,
      updated_at: new Date().toISOString(),
    }

    // เก็บทั้ง score number และ label (คำอธิบาย (X คะแนน))
    if (data.admission.score !== null) {
      payload.admission_score = data.admission.score
      payload.admission_label = getScoreLabel(data.admission.score)
      payload.admission_date = data.admission.date || null
    }
    if (data.dc.score !== null) {
      payload.dc_score = data.dc.score
      payload.dc_label = getScoreLabel(data.dc.score)
      payload.dc_date = data.dc.date || null
    }
    if (data.fu.score !== null) {
      payload.fu_score = data.fu.score
      payload.fu_label = getScoreLabel(data.fu.score)
      payload.fu_date = data.fu.date || null
    }

    const { error: sbError } = await supabase
      .from("mobility_assessment")
      .upsert(payload, { onConflict: "hn" })

    setLoading(false)

    if (sbError) {
      setError(sbError.message)
    } else {
      setShowToast(true)
      onSaved?.()
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const stages: Stage[] = ["admission", "dc", "fu"]

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Navbar */}
      {showToast && <ToastModal onClose={() => setShowToast(false)} />}
      <p className='flex items-end gap-5 bg-white w-full px-4 py-4 mb-5'>
                  <Image src='/Hospital logo.svg' alt="Hospital Logo" width={100} height={50}></Image>
                  <a href='/' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                      Home
                  </a>
                  <a href='/patient' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                      Patient Form
                  </a>
                  <a href='/otherform' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                      Other Forms
                  </a>
              </p>
      <p className="mt-10"></p>

      {/* Patient info card */}
      <div className="bg-white rounded-2xl mx-auto w-250 p-4 shadow-md text-red-500">
        <h2 className="text-xl font-bold mb-4">{patient1[0].name}</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p className="font-bold">HN</p>            <p>{patient1[0].HN}</p>
          <p className="font-bold">Date of Birth</p> <p>{patient1[0].birth}</p>
          <p className="font-bold">Admit</p>          <p>{patient1[0].admit}</p>
          <p className="font-bold">Gender</p>         <p>{patient1[0].gender}</p>
          <p className="font-bold">Allergies</p>      <p>{patient1[0].allergies}</p>
        </div>
      </div>

      <p className="mb-4"></p>

      {/* Assessment card */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl mx-auto w-250 p-4 shadow-md">

          {/* Header */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-black mb-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 5h8M4 8h8M4 11h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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
                <div key={stage} className="flex flex-col items-center border-l border-gray-300">
                  <span className="text-medium font-bold text-blue-800 pt-2 pb-1">
                    {STAGE_LABELS[stage]}
                  </span>
                  <input
                    type="date"
                    value={data[stage].date}
                    onChange={(e) => setStageDate(stage, e.target.value)}
                    className="w-full px-2 pb-1.5 text-[11px] text-center text-blue-800 font-bold bg-transparent outline-none border-t border-gray-300 focus:bg-white"
                  />
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
                <div className={[
                  "px-3 py-3.5 text-sm font-bold text-center border-r border-gray-300 self-center",
                  danger ? "text-red-600" : "text-gray-500",
                ].join(" ")}>
                  {value}
                </div>
                <div className={[
                  "px-3 py-3.5 text-sm leading-relaxed border-r border-gray-300",
                  danger ? "text-red-600 font-medium" : "text-gray-500",
                ].join(" ")}>
                  {label}
                </div>
                {stages.map((stage) => (
                  <div key={stage} className="flex items-center justify-center border-l border-gray-300 py-3.5">
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
                <div key={stage} className="flex items-center justify-between py-1.5 border-b border-gray-300 last:border-b-0">
                  <span className="text-sm text-gray-500">
                    {stage === "admission" ? "แรกรับ (Admission)" : stage === "dc" ? "จำหน่าย (D/C)" : "ติดตาม (F/U)"}
                  </span>
                  {data[stage].score !== null ? (
                    <span className={[
                      "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium",
                      data[stage].score === 6
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700",
                    ].join(" ")}>
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
                <label className="text-xs text-gray-400">ชื่อผู้ประเมิน (Assessor Name)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={data.assessor_name}
                    onChange={(e) => {
                      setField("assessor_name", e.target.value)
                      setShowDropdown(true)
                    }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    placeholder="Dr. / นพ. / พท."
                    autoComplete="off"
                    className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  {showDropdown && data.assessor_name && filtered.length > 0 && (
                    <ul className="absolute top-full left-0 z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {filtered.map((item) => (
                        <li
                          key={item}
                          onMouseDown={() => {
                            setField("assessor_name", item)
                            setShowDropdown(false)
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
                <label className="text-xs text-gray-400">หมายเหตุ (Additional Notes)</label>
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
          {error && (
            <p className="text-sm text-red-600 mt-2">Error: {error}</p>
          )}

          {/* Save button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}