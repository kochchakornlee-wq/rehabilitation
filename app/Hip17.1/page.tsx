"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

// ── Types ────────────────────────────────────────────────────────────────────

type Lang = "th" | "en"

type VisitType =
  | "ก่อนผ่าตัด"
  | "หลังผ่าตัด"
  | "หลังผ่าตัด 1 เดือน"

  
type VisitTypeEN =
  | "Before Surgery"
  | "After Surgery"
  | "After Surgery 1 month"

type VisitTypeValue = VisitType | VisitTypeEN
// ── Doctor list ───────────────────────────────────────────────────────────────

const DOCTORS = [
  "เวนิช สว่างแสง",
  "พนิดา รุ่งพิบูลโสภิษฐ์",
  "พิชญา เพชรละเอียด",
  "ธนัชพร วิไลเลิศ",
  "ศิรดา เดิมคลัง",
  "ชัชนันท์ แก่เมือง",
  "จักษณา ชัยราม",
  "ชรินดา ถาวรวรกุล",
]

// ── Options ───────────────────────────────────────────────────────────────────

const OPTIONS_EN = [
  { label: "None",     score: 0 },
  { label: "Mild",     score: 1 },
  { label: "Moderate", score: 2 },
  { label: "Severe",   score: 3 },
  { label: "Extreme",  score: 4 },
]

const OPTIONS_TH = [
  { label: "ไม่มี",      score: 0 },
  { label: "น้อย",       score: 1 },
  { label: "ปานกลาง",   score: 2 },
  { label: "มาก",        score: 3 },
  { label: "รุนแรงมาก", score: 4 },
]

// ── Items ─────────────────────────────────────────────────────────────────────
// pain ids: straightening, bending, p_sitting, p_standing, p_walking
// act  ids: a_lying, a_sitting, a_rising, a_standing, a_walking
// DB col = strip leading "p_" or "a_" → pain_sitting, act_lying etc.

const PAIN_ITEMS = {
  th: [
    { id: "straightening", label: "ยืดสะโพกให้ตรงเต็มที่" },
    { id: "bending",       label: "งอสะโพกเต็มที่" },
    { id: "p_sitting",     label: "นั่งหรือนอน" },
    { id: "p_standing",    label: "ยืนตัวตรง" },
    { id: "p_walking",     label: "เดินบนพื้นราบ" },
  ],
  en: [
    { id: "straightening", label: "Straightening hip fully" },
    { id: "bending",       label: "Bending hip fully" },
    { id: "p_sitting",     label: "Sitting or lying" },
    { id: "p_standing",    label: "Standing upright" },
    { id: "p_walking",     label: "Walking on flat surface" },
  ],
}

const ACT_ITEMS = {
  th: [
    { id: "a_lying",    label: "นอนบนเตียง" },
    { id: "a_sitting",  label: "นั่ง" },
    { id: "a_rising",   label: "ลุกขึ้นจากท่านั่ง" },
    { id: "a_standing", label: "ยืน" },
    { id: "a_walking",  label: "เดินบนพื้นราบ" },
  ],
  en: [
    { id: "a_lying",    label: "Lying in bed" },
    { id: "a_sitting",  label: "Sitting" },
    { id: "a_rising",   label: "Rising from sitting" },
    { id: "a_standing", label: "Standing" },
    { id: "a_walking",  label: "Walking on flat surface" },
  ],
}

// strip p_ or a_ prefix → DB column name
const toCol = (id: string) => id.replace(/^[pa]_/, "")

// ── Translations ──────────────────────────────────────────────────────────────

const T = {
  th: {
    visitLabel: "ช่วงเวลา",
    visitTypes: ["ก่อนผ่าตัด", "หลังผ่าตัด", "หลังผ่าตัด 1 เดือน"] as VisitType[],
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
    hn: "HN", dob: "วันเกิด", admit: "วันแรกรับ", gender: "เพศ", allergies: "การแพ้ยา",
    options: OPTIONS_TH,
    painItems: PAIN_ITEMS.th,
    actItems: ACT_ITEMS.th,
  },
  en: {
    visitLabel: "Visit Type",
    visitTypes: ["before surgery", "After Surgery", "After Sugery 1 month"] as VisitTypeEN[],
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
    hn: "HN", dob: "Date of Birth", admit: "Admit Date", gender: "Gender", allergies: "Allergies",
    options: OPTIONS_EN,
    painItems: PAIN_ITEMS.en,
    actItems: ACT_ITEMS.en,
  },
}

// ── Score formatter ───────────────────────────────────────────────────────────

const formatScore = (label: string, score: number) => `${label} (${score})`

// ── Toast ─────────────────────────────────────────────────────────────────────

function ToastModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = T[lang]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-80 rounded-2xl bg-white px-8 py-8 text-center shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="ปิด">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mb-1 text-base font-semibold text-gray-800">{t.saveSuccess}</p>
        <p className="mb-6 text-sm text-gray-500">{t.saveSuccessDesc}</p>
        <a href="/patient" onClick={onClose} className="inline-block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors">
          {t.backBtn}
        </a>
      </div>
    </div>
  )
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
  sectionKey: string
  header: string
  items: { id: string; label: string }[]
  options: { label: string; score: number }[]
  selections: Record<string, number>
  dates: Record<string, string>
  onSelect: (id: string, score: number) => void
  onDateChange: (scoreKey: string, date: string) => void
  totalLabel: string
}) {
  const total = Object.values(selections).reduce((s, v) => s + v, 0)
  const totalPossible = items.length * 4
  const percent =
    items.length === Object.keys(selections).length
      ? Math.round(100 - (total * 100) / totalPossible)
      : null

  return (
    <div className="bg-white rounded-2xl mx-auto w-250 p-4 shadow-md">

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-black" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 5h8M4 8h8M4 11h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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
            <div key={opt.score} className="flex flex-col items-center border-l border-gray-300">
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
                <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs">—</span>
              )}
            </div>
            {/* Description */}
            <div className="px-3 py-3 text-sm text-gray-600 border-r border-gray-300 self-center leading-relaxed">
              {label}
            </div>
            {/* Radios */}
            {options.map((opt) => (
              <div key={opt.score} className="flex items-center justify-center border-l border-gray-300 py-3">
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
          <span className="font-bold text-gray-600">{total} / {totalPossible}</span>
        </div>
        <div className="rounded-xl border border-gray-300 bg-gray-100 p-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">%</span>
          <span className="font-bold text-gray-600">{percent !== null ? `${percent}%` : "—"}</span>
        </div>
      </div>
    </div>
  )
}

// ── Patient placeholder ───────────────────────────────────────────────────────

const patient1 = {
  name: "John Doe",
  HN: "123456",
  birth: "01/01/1980",
  admit: "01/01/2024",
  gender: "Male",
  allergies: "Penicillin",
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Hip17() {
  const [lang, setLang] = useState<Lang>("th")
  const [visitType, setVisitType] = useState<VisitTypeValue | "">("")

  const [painSelections, setPainSelections] = useState<Record<string, number>>({})
  const [actSelections,  setActSelections]  = useState<Record<string, number>>({})

  // dates per option score: { "0": "2024-01-01", "2": "2024-01-05", ... }
  const [painDates, setPainDates] = useState<Record<string, string>>({})
  const [actDates,  setActDates]  = useState<Record<string, string>>({})

  const [assessorName, setAssessorName] = useState("")
  const [assessorDate, setAssessorDate] = useState("")
  const [assessorTime, setAssessorTime] = useState("")
  const [notes,        setNotes]        = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  const t = T[lang]
  const filtered = DOCTORS.filter((d) =>
    d.toLowerCase().includes(assessorName.toLowerCase())
  )

  // ── Load ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!visitType) return

    const fetchData = async () => {
      const { data: row } = await supabase
        .from("hip17_assessments")
        .select("*")
        .eq("hn", patient1.HN)
        .eq("visit_type", visitType)
        .single()

      // ✅ ลบ if (!row) { clear... } ออกทั้งหมด
      if (!row) return

      const parseVal = (val: unknown): number | null => {
        if (val === null || val === undefined) return null
        const m = String(val).match(/\((\d)\)$/)
        return m ? parseInt(m[1]) : null
      }

      const parsedPain: Record<string, number> = {}
      for (const item of PAIN_ITEMS.en) {
        const v = parseVal(row[`pain_${toCol(item.id)}`])
        if (v !== null) parsedPain[item.id] = v
      }

      const parsedAct: Record<string, number> = {}
      for (const item of ACT_ITEMS.en) {
        const v = parseVal(row[`act_${toCol(item.id)}`])
        if (v !== null) parsedAct[item.id] = v
      }

      const parsedPainDates: Record<string, string> = {}
      const parsedActDates:  Record<string, string> = {}
      for (let s = 0; s <= 4; s++) {
        if (row[`pain_date_${s}`]) parsedPainDates[s.toString()] = row[`pain_date_${s}`]
        if (row[`act_date_${s}`])  parsedActDates[s.toString()]  = row[`act_date_${s}`]
      }

      setPainSelections(parsedPain)
      setActSelections(parsedAct)
      setPainDates(parsedPainDates)
      setActDates(parsedActDates)
      setAssessorName(row.assessor_name ?? "")
      setAssessorDate(row.assessor_date ?? "")
      setAssessorTime(row.assessor_time ?? "")
      setNotes(row.notes ?? "")
    }

    fetchData()
  }, [visitType])

  useEffect(() => {
  const loadLatestVisit = async () => {
    const { data } = await supabase
      .from("hip17_assessments")
      .select("visit_type")
      .eq("hn", patient1.HN)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data?.visit_type) {
      setVisitType(data.visit_type as VisitTypeValue)
      // useEffect [visitType] จะ trigger เองแล้วดึงข้อมูลมาให้
    }
  }

  loadLatestVisit()
}, [])

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!visitType) { alert(t.selectVisit); return }
    setLoading(true); setError(null)

    const payload: Record<string, unknown> = {
      hn: patient1.HN,
      visit_type: visitType,
      updated_at: new Date().toISOString(),
      assessor_name: assessorName,
      assessor_date: assessorDate || null,
      assessor_time: assessorTime || null,
      notes,
    }

    for (const item of PAIN_ITEMS.en) {
      const score = painSelections[item.id]
      const col = toCol(item.id)
      if (score !== undefined) {
        payload[`pain_${col}`]    = formatScore(OPTIONS_EN.find(o => o.score === score)?.label ?? "", score)
        payload[`pain_${col}_th`] = formatScore(OPTIONS_TH.find(o => o.score === score)?.label ?? "", score)
      }
    }
    for (let s = 0; s <= 4; s++) payload[`pain_date_${s}`] = painDates[s.toString()] || null

    for (const item of ACT_ITEMS.en) {
      const score = actSelections[item.id]
      const col = toCol(item.id)
      if (score !== undefined) {
        payload[`act_${col}`]    = formatScore(OPTIONS_EN.find(o => o.score === score)?.label ?? "", score)
        payload[`act_${col}_th`] = formatScore(OPTIONS_TH.find(o => o.score === score)?.label ?? "", score)
      }
    }
    for (let s = 0; s <= 4; s++) payload[`act_date_${s}`] = actDates[s.toString()] || null

    const painTotal = Object.values(painSelections).reduce((s, v) => s + v, 0)
    const actTotal  = Object.values(actSelections).reduce((s, v) => s + v, 0)
    payload.pain_total   = painTotal
    payload.pain_percent = Object.keys(painSelections).length === PAIN_ITEMS.en.length
      ? Math.round(100 - (painTotal * 100) / (PAIN_ITEMS.en.length * 4)) : null
    payload.act_total    = actTotal
    payload.act_percent  = Object.keys(actSelections).length === ACT_ITEMS.en.length
      ? Math.round(100 - (actTotal * 100) / (ACT_ITEMS.en.length * 4)) : null

    const { error: sbError } = await supabase
      .from("hip17_assessments")
      .upsert(payload, { onConflict: "hn,visit_type" })

    setLoading(false)
    if (sbError) setError(sbError.message)
    else setShowToast(true)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {showToast && <ToastModal lang={lang} onClose={() => setShowToast(false)} />}

      {/* Navbar */}
      <p className="flex items-end gap-5 bg-white w-full px-4 py-4 mb-5">
        <Image src="/Hospital logo.svg" alt="Hospital Logo" width={100} height={50} />
        <a href="/" className="ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors">Home</a>
        <a href="/patient" className="ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors">Patient Form</a>
        <a href="/otherform" className="ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors">Other Forms</a>
      </p>

      <div className="mx-auto w-250 space-y-4 pb-10">

        {/* Patient Info */}
        <div className="bg-white rounded-2xl p-4 shadow-md text-red-500">
          <h2 className="text-xl font-bold mb-4">{patient1.name}</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="font-bold">{t.hn}</p>        <p>{patient1.HN}</p>
            <p className="font-bold">{t.dob}</p>       <p>{patient1.birth}</p>
            <p className="font-bold">{t.admit}</p>     <p>{patient1.admit}</p>
            <p className="font-bold">{t.gender}</p>    <p>{patient1.gender}</p>
            <p className="font-bold">{t.allergies}</p> <p>{patient1.allergies}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl p-4 shadow-md flex flex-wrap items-center gap-4">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {(["th", "en"] as Lang[]).map((l) => (
              <button
                key={l} type="button" onClick={() => setLang(l)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  lang === l ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {l === "th" ? "ภาษาไทย" : "English"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">{t.visitLabel}:</span>
            <div className="flex flex-wrap gap-2">
              {t.visitTypes.map((vt) => (
                <button
                  key={vt} type="button" onClick={() => setVisitType(vt)}
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
          onSelect={(id, score) => setPainSelections((prev) => ({ ...prev, [id]: score }))}
          onDateChange={(key, date) => setPainDates((prev) => ({ ...prev, [key]: date }))}
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
          onSelect={(id, score) => setActSelections((prev) => ({ ...prev, [id]: score }))}
          onDateChange={(key, date) => setActDates((prev) => ({ ...prev, [key]: date }))}
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
                { label: t.painHeader, sel: painSelections, max: PAIN_ITEMS.en.length },
                { label: t.actHeader,  sel: actSelections,  max: ACT_ITEMS.en.length  },
              ].map(({ label, sel, max }) => {
                const total = Object.values(sel).reduce((s, v) => s + v, 0)
                const pct = Object.keys(sel).length === max
                  ? Math.round(100 - (total * 100) / (max * 4)) : null
                return (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-200 last:border-b-0">
                    <span className="text-sm text-gray-500 truncate max-w-[180px]">{label}</span>
                    <span className="text-sm font-bold text-blue-700 ml-2 shrink-0">
                      {pct !== null ? `${pct}%` : "—"}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Assessor */}
            <div className="rounded-xl border border-gray-300 bg-gray-100 p-4 space-y-3">
              <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">
                {t.assessorDetails}
              </p>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">{t.assessorName}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={assessorName}
                    onChange={(e) => { setAssessorName(e.target.value); setShowDropdown(true) }}
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
                          onMouseDown={() => { setAssessorName(item); setShowDropdown(false) }}
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
                  <label className="text-xs text-gray-400">{t.assessorDate}</label>
                  <input type="date" value={assessorDate} onChange={(e) => setAssessorDate(e.target.value)}
                    className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">{t.assessorTime}</label>
                  <input type="time" value={assessorTime} onChange={(e) => setAssessorTime(e.target.value)}
                    className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">{t.notes}</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder} rows={2}
                  className="w-full text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-gray-200 text-gray-500 outline-none focus:ring-1 focus:ring-blue-400 resize-none" />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 px-1">Error: {error}</p>}

        <div className="flex justify-end">
          <button
            type="button" onClick={handleSave} disabled={loading}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t.saving : t.save}
          </button>
        </div>

      </div>
    </div>
  )
}