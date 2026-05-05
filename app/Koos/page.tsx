"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { supabase } from "../../lib/supabase"
import type {
  KoosAssessmentType,
  KoosInsert,
  KoosItem,
  KoosScores,
  ScoreOption,
} from "./Koos"

// ============================================================
// Static data — เพิ่ม/ลด item ที่นี่ที่เดียว
// ============================================================

const P1_OPTIONS: ScoreOption[] = [
  { label: "ไม่มีอาการ", score: 0 },
  { label: "ทุกเดือน", score: 1 },
  { label: "ทุกสัปดาห์", score: 2 },
  { label: "ทุกวัน", score: 3 },
  { label: "ตลอดเวลา", score: 4 },
]

// P2-P9 และ A1-A8 ใช้ option ชุดเดียวกัน
const PAIN_ADL_OPTIONS: ScoreOption[] = [
  { label: "ไม่มีอาการ", score: 0 },
  { label: "น้อย", score: 1 },
  { label: "ปานกลาง", score: 2 },
  { label: "รุนแรง", score: 3 },
  { label: "รุนแรงมาก", score: 4 },
]

// P1-P9 รวมกัน — P1 ใช้ option ต่างออกไป จึงแยก items แต่รวม calc ด้วยกัน
const P1_ITEM: KoosItem = { id: "p1", label: "P1 ท่านรู้สึกว่ามีอาการปวดเข่าบ่อยครั้งเพียงใด" }

const P2P9_ITEMS: KoosItem[] = [
  { id: "p2", label: "P2 หมุนบิดขาบนเข้าข้างที่ปวดขณะยืน" },
  { id: "p3", label: "P3 เหยียดเข่าจนสุด" },
  { id: "p4", label: "P4 งอเข่าจนสุด" },
  { id: "p5", label: "P5 เดินบนพื้นราบ" },
  { id: "p6", label: "P6 ขึ้นหรือลงบันได" },
  { id: "p7", label: "P7 ขณะนอนอยู่บนเตียงตอนกลางคืน" },
  { id: "p8", label: "P8 นั่งหรือนอน" },
  { id: "p9", label: "P9 ยืนตรง" },
]

const ADL_ITEMS: KoosItem[] = [
  { id: "a1", label: "A1 เดินลงบันได" },
  { id: "a2", label: "A2 เดินขึ้นบันได" },
  { id: "a3", label: "A3 ลุกขึ้นจากเก้าอี้" },
  { id: "a4", label: "A4 ยืนตรง" },
  { id: "a5", label: "A5 ก้มหยิบของจากพื้น" },
  { id: "a6", label: "A6 เดินบนพื้นราบ" },
  { id: "a7", label: "A7 ก้าวขึ้นหรือลงจากรถ" },
  { id: "a8", label: "A8 เดินไปซื้อของระยะใกล้ๆ" },
]

const ASSESSMENT_TYPE_LABELS: Record<KoosAssessmentType, string> = {
  before: "ก่อนการรักษา",
  after: "หลังการรักษา",
  follow_up: "ติดตามผล",
}

// ── English versions ──────────────────────────────────────────

const P1_OPTIONS_EN: ScoreOption[] = [
  { label: "Never",       score: 0 },
  { label: "Monthly",     score: 1 },
  { label: "Weekly",      score: 2 },
  { label: "Daily",       score: 3 },
  { label: "Always",      score: 4 },
]

const PAIN_ADL_OPTIONS_EN: ScoreOption[] = [
  { label: "None",     score: 0 },
  { label: "Mild",     score: 1 },
  { label: "Moderate", score: 2 },
  { label: "Severe",   score: 3 },
  { label: "Extreme",  score: 4 },
]

const P1_ITEM_EN: KoosItem = { id: "p1", label: "P1 How often do you experience knee pain?" }

const P2P9_ITEMS_EN: KoosItem[] = [
  { id: "p2", label: "P2 Twisting/pivoting on your injured knee" },
  { id: "p3", label: "P3 Straightening knee fully" },
  { id: "p4", label: "P4 Bending knee fully" },
  { id: "p5", label: "P5 Walking on flat surface" },
  { id: "p6", label: "P6 Going up or down stairs" },
  { id: "p7", label: "P7 At night while in bed" },
  { id: "p8", label: "P8 Sitting or lying" },
  { id: "p9", label: "P9 Standing upright" },
]

const ADL_ITEMS_EN: KoosItem[] = [
  { id: "a1", label: "A1 Descending stairs" },
  { id: "a2", label: "A2 Ascending stairs" },
  { id: "a3", label: "A3 Rising from sitting" },
  { id: "a4", label: "A4 Standing" },
  { id: "a5", label: "A5 Bending to floor/pick up an object" },
  { id: "a6", label: "A6 Walking on flat surface" },
  { id: "a7", label: "A7 Getting in/out of car" },
  { id: "a8", label: "A8 Going shopping" },
]

const ASSESSMENT_TYPE_LABELS_EN: Record<KoosAssessmentType, string> = {
  before:   "Before Treatment",
  after:    "After Treatment",
  follow_up: "Follow Up",
}

// ============================================================
// Score helpers
// ============================================================

/**
 * คำนวณ KOOS subscore
 * สูตร: 100 − (รวมคะแนน × 100) ÷ (จำนวนข้อ × 4)
 * คืน null ถ้ายังไม่ได้ตอบทุกข้อ
 */
function calcScore(ids: Array<keyof KoosScores>, scores: Partial<KoosScores>): number | null {
  const unanswered = ids.filter((id) => scores[id] == null)
  if (unanswered.length > 0) return null
  const sum = ids.reduce((acc, id) => acc + (scores[id] as number), 0)
  return 100 - (sum * 100) / (ids.length * 4)
}

// ============================================================
// Sub-components
// ============================================================

interface RadioGroupProps {
  name: string
  options: ScoreOption[]
  value: number | null
  onChange: (score: number) => void
}

function RadioGroup({ name, options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {options.map((opt) => (
        <label
          key={opt.score}
          className={`
            cursor-pointer select-none rounded-md border px-3 py-1.5 text-xs transition-colors
            ${
              value === opt.score
                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
            }
          `}
        >
          <input
            type="radio"
            name={name}
            value={opt.score}
            checked={value === opt.score}
            onChange={() => onChange(opt.score)}
            className="sr-only"
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}

interface ScoreRowProps {
  item: KoosItem
  options: ScoreOption[]
  value: number | null
  onChange: (id: keyof KoosScores, score: number) => void
}

function ScoreRow({ item, options, value, onChange }: ScoreRowProps) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-100 py-2.5 last:border-0">
      <span className="flex-1 text-sm text-gray-700">{item.label}</span>
      <RadioGroup
        name={item.id}
        options={options}
        value={value}
        onChange={(score) => onChange(item.id, score)}
      />
    </div>
  )
}

interface ScoreSummaryProps {
  label: string
  formula: string
  score: number | null
}

function ScoreSummary({ label, formula, score }: ScoreSummaryProps) {
  return (
    <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{formula}</p>
      </div>
      <div className="text-right">
        {score !== null ? (
          <span className="text-2xl font-semibold text-gray-800">
            {score.toFixed(1)}
            <span className="ml-1 text-sm font-normal text-gray-500">%</span>
          </span>
        ) : (
          <span className="text-sm text-gray-400">กรอกให้ครบก่อน</span>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Toast Modal
// ============================================================

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
        <a href="/otherform"
          onClick={onClose}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          Back to Other Forms
        </a>
      </div>
    </div>
  )
}



// ============================================================
// Main Page
// ============================================================


export default function KoosPage() {
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
  const ipdFormId = patient1[0].HN
  const doctorList = [
    "เวนิช สว่างแสง",
    "พนิดา รุ่งพิบูลโสภิษฐ์",
    "พิชญา เพชรละเอียด",
    "ธนัชพร วิไลเลิศ",
    "ศิรดา เดิมคลัง",
    "ชัชนันท์ แก่เมือง",
    "จักษณา ชัยราม",
    "ชรินดา ถาวรวรกุล",
  ]
  const [doctor, setDoctor] = useState("")
  const [show, setShow] = useState(false)
  const filtered = doctorList.filter((item) => item.includes(doctor))

  // --- Meta state ---
  const [assessmentType, setAssessmentType] = useState<KoosAssessmentType>("before")
  const [assessedAt, setAssessedAt] = useState<string>(
    new Date().toISOString().split("T")[0]   // วันนี้ default
  )
  const [assessedBy, setAssessedBy] = useState("")

  // --- Score state ---
  const [scores, setScores] = useState<Partial<KoosScores>>({})

  // --- UI state ---
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [showToast, setShowToast] = useState(false)

  // เพิ่มหลัง useState ทั้งหมด บรรทัดประมาณ 261 ก่อน handleScoreChange
useEffect(() => {
  const prefillFromLastVisit = async () => {
    const { data, error } = await supabase
      .from("koos_assessments")
      .select("*")
      .eq("ipd_form_id", ipdFormId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return

    // restore meta
    setAssessmentType(data.assessment_type ?? "before")
    setAssessedAt(data.assessed_at ?? new Date().toISOString().split("T")[0])
    setAssessedBy(data.assessed_by ?? "")

    // restore scores
    setScores({
      p1: data.p1 ?? null,
      p2: data.p2 ?? null,
      p3: data.p3 ?? null,
      p4: data.p4 ?? null,
      p5: data.p5 ?? null,
      p6: data.p6 ?? null,
      p7: data.p7 ?? null,
      p8: data.p8 ?? null,
      p9: data.p9 ?? null,
      a1: data.a1 ?? null,
      a2: data.a2 ?? null,
      a3: data.a3 ?? null,
      a4: data.a4 ?? null,
      a5: data.a5 ?? null,
      a6: data.a6 ?? null,
      a7: data.a7 ?? null,
      a8: data.a8 ?? null,
    })
  }

  prefillFromLastVisit()
}, [])

  // --- Handlers ---
  function handleScoreChange(id: keyof KoosScores, score: number) {
    setScores((prev) => ({ ...prev, [id]: score }))
    setSubmitStatus("idle")
  }

  // --- Computed scores ---
  // P1-P9 รวมกันทั้ง 9 ข้อ (จำนวนข้อ × 4 = 9 × 4 = 36)
  const allPainIds = ["p1", ...P2P9_ITEMS.map((i) => i.id)] as Array<keyof KoosScores>
  const adlIds = ADL_ITEMS.map((i) => i.id) as Array<keyof KoosScores>
  const painScore = calcScore(allPainIds, scores)
  const adlScore = calcScore(adlIds, scores)

  // --- Validation ---
  const allPainAnswered = allPainIds.every((id) => scores[id] != null)
  const allAdlAnswered = adlIds.every((id) => scores[id] != null)
  const canSubmit = allPainAnswered && allAdlAnswered && !submitting

  // --- Submit ---
  async function handleSubmit() {
    if (!canSubmit) return

    setSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    const payload: KoosInsert = {
      ipd_form_id: ipdFormId,
      assessment_type: assessmentType,
      assessed_at: assessedAt,
      assessed_by: assessedBy || null,

      p1: scores.p1 ?? null,
      p2: scores.p2 ?? null,
      p3: scores.p3 ?? null,
      p4: scores.p4 ?? null,
      p5: scores.p5 ?? null,
      p6: scores.p6 ?? null,
      p7: scores.p7 ?? null,
      p8: scores.p8 ?? null,
      p9: scores.p9 ?? null,
      pain_score: painScore,

      a1: scores.a1 ?? null,
      a2: scores.a2 ?? null,
      a3: scores.a3 ?? null,
      a4: scores.a4 ?? null,
      a5: scores.a5 ?? null,
      a6: scores.a6 ?? null,
      a7: scores.a7 ?? null,
      a8: scores.a8 ?? null,
      adl_score: adlScore,
    }

    const { error } = await supabase.from("koos_assessments").insert(payload)

    if (error) {
      setSubmitStatus("error")
      setErrorMessage(error.message)
    } else {
      setShowToast(true)
    }

    setSubmitting(false)
  }

  const [lang, setLang] = useState<"th" | "en">("th")

// computed จาก lang
const p1Item       = lang === "th" ? P1_ITEM        : P1_ITEM_EN
const p2p9Items    = lang === "th" ? P2P9_ITEMS      : P2P9_ITEMS_EN
const adlItems     = lang === "th" ? ADL_ITEMS        : ADL_ITEMS_EN
const p1Opts       = lang === "th" ? P1_OPTIONS       : P1_OPTIONS_EN
const painAdlOpts  = lang === "th" ? PAIN_ADL_OPTIONS : PAIN_ADL_OPTIONS_EN
const typeLabels   = lang === "th" ? ASSESSMENT_TYPE_LABELS : ASSESSMENT_TYPE_LABELS_EN

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Toast Modal */}
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
                  
        <div className="bg-white rounded-2xl mx-auto w-250 p-4 shadow-md">
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          แบบประเมิน KOOS
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Knee injury and Osteoarthritis Outcome Score
        </p>

        {/* Lang toggle */}
      
      </div>

      <div className="flex items-center gap-1 ml-auto">
          {(["th", "en"] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                lang === l
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {l === "th" ? "ภาษาไทย" : "English"}
            </button>
          ))}
        </div>

      {/* Meta section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-400">
          ข้อมูลการประเมิน
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Assessment type */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">ประเภทการประเมิน</label>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value as KoosAssessmentType)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {(Object.keys(typeLabels) as KoosAssessmentType[]).map((key) => (
                <option key={key} value={key}>
                  {typeLabels[key]}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">วันที่ประเมิน</label>
            <input
              type="date"
              value={assessedAt}
              onChange={(e) => setAssessedAt(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Assessed by */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">ผู้ประเมิน</label>
                <input
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 focus:outline-none focus:border-blue-400"
                    value={doctor}
                    onChange={(e) => {
                    setDoctor(e.target.value)
                    setShow(true)
                    }}
                    onBlur={() => setTimeout(() => setShow(false), 150)}
                />

                    {/* dropdown ลอยอยู่ใต้ input ไม่บัง */}
                    {show && doctor && filtered.length > 0 && (
                        <div className="absolute top-140 z-5 w-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {filtered.map((item) => (
                            <div
                            key={item}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                            onClick={() => {
                                setDoctor(item)
                                setShow(false)
                            }}
                            >
                            {item}
                            </div>
                        ))}
                        </div>
                    )}
                
          </div>
        </div>
      </div>

      {/* Pain Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-gray-400">
          กิจกรรมด้านอาการปวด
        </h2>

        {/* P1 — option ต่างจาก P2-P9 */}
        <ScoreRow
          item={p1Item}
          options={p1Opts}
          value={scores.p1 ?? null}
          onChange={handleScoreChange}
        />

        {/* P2–P9 */}
        <p className="mb-1 mt-3 text-xs font-medium text-gray-400">
          ระดับอาการปวดขณะทำกิจกรรม (P2–P9)
        </p>
        {p2p9Items.map((item) => (
          <ScoreRow
            key={item.id}
            item={item}
            options={painAdlOpts}
            value={scores[item.id] ?? null}
            onChange={handleScoreChange}
          />
        ))}

        <ScoreSummary
          label={lang === "th" ? "คะแนนอาการปวด (Pain Score)" : "Pain Score"}
          formula="100 − (รวมคะแนน P1–P9 × 100) ÷ (9 × 4)"
          score={painScore}
        />
      </div>

      {/* ADL Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-gray-400">
          กิจกรรมด้านกิจวัตรประจำวัน (ADL)
        </h2>
        {adlItems.map((item) => (
          <ScoreRow
            key={item.id}
            item={item}
            options={painAdlOpts}
            value={scores[item.id] ?? null}
            onChange={handleScoreChange}
          />
        ))}

        <ScoreSummary
          label={lang === "th" ? "คะแนน ADL" : "ADL Score"}
          formula="100 − (รวมคะแนน A1–A8 × 100) ÷ (8 × 4)"
          score={adlScore}
        />
      </div>

      {/* Submit */}
      <div className="flex flex-col items-end gap-3">
        {/* Validation hint */}
        {!allPainAnswered && (
          <p className="text-xs text-amber-500">
            ยังกรอกข้อมูลอาการปวด (P2–P9) ไม่ครบ
          </p>
        )}
        {!allAdlAnswered && (
          <p className="text-xs text-amber-500">
            ยังกรอกข้อมูล ADL (A1–A8) ไม่ครบ
          </p>
        )}

        {/* Error feedback */}
        {submitStatus === "error" && (
          <p className="text-sm text-red-500">
            เกิดข้อผิดพลาด: {errorMessage}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`
            rounded-lg px-6 py-2.5 text-sm font-medium transition-colors
            ${
              canSubmit
                ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                : "cursor-not-allowed bg-gray-100 text-gray-400"
            }
          `}
        >
          {submitting ? "กำลังบันทึก..." : "บันทึกการประเมิน"}
        </button>
        </div>
      </div>
      </div>
    </div>
    
  )
}