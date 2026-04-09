"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

// ======================================
// Topic code -> Specify needs mapping
// ======================================

type PatientCardProps = {
  name: string
  HN: string
  birth: string
  admit: string
  gender: string
  allergies: string
}

const topicCodeMap: Record<string, string> = {
  "1": "Disease/Condition",
  "2": "Medication",
  "3": "Plan to care",
  "4": "Food/Drug Interactions",
  "5": "Diet /Nutrition",
  "6": "Pain management",
  "7": "Rehabilitations/Activity",
  "8": "Medical equipment",
  "9": "Investigation & Results",
  "10": "Community resources",
  "11" : "Safety/Enviroment",
  "12" : "Informed Consent",
  "13" : "Fall",
  "14" : "Follow up",
  "15" : "Hand Hygiene",
  "16" : "Isolation Precaution",
  "17" : "Financial/Insurance",
  "18" : "Wound care",
  "19" : "Hygiene",
  "20" : "Healt Promotion",
  "21" : "Emergency management",
  "22" : ""
}

// ======================================
// Provider list (ชื่อ/ตำแหน่ง)
// ======================================
const providerList = [
  "เวนิช สว่างแสง",
      "พนิดา รุ่งพิบูลโสภิษฐ์",
      "พิชญา เพชรละเอียด",
      "ธนัชพร วิไลเลิศ",
      "ศิรดา เดิมคลัง",
      "ชัชนันท์ แก่เมือง",
      "จักษณา ชัยราม",
      "ชรินดา ถาวรวรกุล",
]

// ======================================
// Autocomplete input สำหรับ provider
// ======================================
function AutocompleteInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false)
  const filtered = providerList.filter((p) =>
    p.toLowerCase().includes(value.toLowerCase())
  )
  return (
    <div className="relative w-full">
      <input
        className="w-full text-xs text-gray-600 focus:outline-none bg-transparent"
        value={value}
        onChange={(e) => { onChange(e.target.value); setShow(true) }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        placeholder="ค้นหาชื่อ..."
      />
      {show && value && filtered.length > 0 && (
        <div className="absolute top-full left-0 z-20 w-56 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
          {filtered.map((item) => (
            <div
              key={item}
              className="px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer"
              onMouseDown={() => { onChange(item); setShow(false) }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ======================================
// Readiness color mapping
// ======================================
const readinessColor: Record<string, string> = {
  Willing: "bg-green-100 text-green-600 font-bold",
  Refuse: "bg-red-100 text-red-800 font-bold",
  "Unwilling": "bg-yellow-100 text-yellow-800 font-bold",
}

// ======================================
// Column definitions
// ======================================
const columns = [
  { key: "datetime",   label: "Date/Time",                          type: "datetime"  },
  { key: "topics",     label: "Topics code needs",                  type: "text"      },
  { key: "specify",    label: "Specify needs",                      type: "text"      },
  { key: "education",  label: "Education given to",                 type: "dropdown",
    options: ["Patient", "Spouse", "Mother","Father","Daugther","Son","Caregiver","Other"] },
  { key: "readiness",  label: "Readiness",                         type: "readiness",
    options: ["Willing", "Refuse", "Unwilling"] },
  { key: "barriers",   label: "Barriers",                           type: "dropdown",
    options: ["None", "Language", "Culture","Religious","Emotional","Physical","Phychological","Cognitive","Reading","Hearing","Vision","Speaking","Educational Level","Motivation","Others"] },
  { key: "methods",    label: "Method/s used",                      type: "dropdown",
    options: ["Audio", "Video","Printed","Oral","Group"] },
  { key: "evaluation", label: "Evaluation",                         type: "dropdown",
    options: ["Petient is not receptive to teaching", "Verbalized basic concepts with assistance", "Verbalized understanding","Return demonstration poor", "Return demonstration Good"] },
  { key: "provider",   label: "Education Provider (Name/Position)", type: "text"      },
]

type Row = Record<string, string>

const emptyRow = (): Row =>
  Object.fromEntries(columns.map((col) => [col.key, ""]))

function StatusModal({ show, message, type, onClose }: { show: boolean; message: string; type: "success" | "error"; onClose: () => void }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm">✕</button>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl ${type === "success" ? "bg-green-100" : "bg-red-100"}`}>
          {type === "success" ? "✅" : "❌"}
        </div>
        <p className="font-medium text-base text-gray-900 mb-1">{type === "success" ? "สำเร็จ" : "เกิดข้อผิดพลาด"}</p>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <a href="/patient" className={`block w-full py-2.5 rounded-xl text-sm font-medium ${type === "success" ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}`}>
          Back to home
        </a>
      </div>
    </div>
  )
}


export default function EducationTable() {
  const [row, setRow] = useState<Row[]>([
    emptyRow(), emptyRow(), emptyRow(), emptyRow(), emptyRow(),
  ])

  const updateCell = (rowIndex: number, key: string, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row
        const updated = { ...row, [key]: value }
        // Auto-fill "specify" when "topics" changes
        if (key === "topics") {
          updated.specify = topicCodeMap[value.trim()] ?? row.specify
        }
        return updated
      })
    )
  }

  const addRow = () => setRows((prev) => [...prev, emptyRow()])

  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
  show: false, message: "", type: "success"
  })

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type })
  }

  const patient = {
    name: "John Doe",
    HN: "777777",
    birth: "01/01/1980",
    admit: "01/01/2024",
    gender: "Male",
    allergies: "Penicillin",
  }
  const patient1 = {
    name: "Cerina Doe",
    HN: "777777",
    birth: "01/01/1980",
    admit: "01/01/2024",
    gender: "Male",
    allergies: "Penicillin",
  }
  const [rows, setRows] = useState<Row[]>([emptyRow()])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // ── โหลดข้อมูลเก่าตาม HN ──
  useEffect(() => {
    async function fetchRecords() {
      setLoading(true)
      const { data, error } = await supabase
        .from("education_records")
        .select("*")
        .eq("hn", patient1.HN)
        .order("created_at", { ascending: true })

      if (data && data.length > 0) {
        setRows(data.map(({ id, hn, created_at, ...rest }) => rest as Row))
      }
      setLoading(false)
    }
    fetchRecords()
  }, [patient1.HN])

  // ── บันทึกทุก row ──
  const saveAll = async () => {
    setSaving(true)

    // ลบแถวเก่าของ HN นี้ก่อน แล้ว insert ใหม่ทั้งหมด
    await supabase.from("education_records").delete().eq("hn", patient1.HN)

    const records = rows
      .filter(row => Object.values(row).some(v => v !== "")) // กรองแถวว่าง
      .map(row => ({ hn: patient1.HN, ...row }))

    const { error } = await supabase.from("education_records").insert(records)

    setSaving(false)
    if (error) showToast("เกิดข้อผิดพลาด: " + error.message, "error")
    else showToast("บันทึกสำเร็จ! 🎉")
  }

  if (loading) return <div>กำลังโหลด...</div>

  return (
    <div className="overflow-x-auto mt-6 min-h-screen bg-gray-100">
      <StatusModal show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
      {/* Header / Logo */}
      <p className='flex items-end gap-5 bg-white px-4 py-4 mb-5'>
                      <Image src='/Hospital logo.svg' alt="Hospital Logo" width={100} height={50}></Image>
                      <a href='/' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                          Home
                      </a>
                      <a href='/patient' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                          Patient Form
                      </a>
                  </p>

      {/* Patient Info Card */}
      <div className="bg-white rounded-2xl mx-auto w-300 p-4 shadow-md text-blue-900">
        <h2 className="text-xl font-bold mb-4">{patient1.name}</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p className="font-bold">HN</p>            <p>{patient1.HN}</p>
          <p className="font-bold">Date of Birth</p> <p>{patient1.birth}</p>
          <p className="font-bold">Admit</p>          <p>{patient1.admit}</p>
          <p className="font-bold">Gender</p>         <p>{patient1.gender}</p>
          <p className="font-bold">Allergies</p>      <p>{patient1.allergies}</p>
        </div>
      </div>

      {/* Education Table Card */}
      <div className="bg-white rounded-2xl mx-auto w-300 p-4 mt-4 shadow-md">
        <table className="w-full border-collapse text-sm">

          {/* Header */}
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-2 py-2 text-center text-xs font-medium text-gray-400 min-w-[120px]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="border-b border-gray-200 p-1 h-12">

                    {/* ── DateTime picker ── */}
                    {col.type === "datetime" && (
                      <div className="flex flex-col gap-0.5">
                        <input
                          type="date"
                          className="w-full font-bold text-blue-800 focus:outline-none bg-transparent cursor-pointer"
                          value={row[col.key]?.split("T")[0] ?? ""}
                          onChange={(e) => {
                            const time = row[col.key]?.split("T")[1] ?? "00:00"
                            updateCell(rowIndex, col.key, `${e.target.value}T${time}`)
                          }}
                        />
                        <input
                          type="time"
                          className="w-full text-xs text-gray-300 focus:outline-none bg-transparent cursor-pointer"
                          value={row[col.key]?.split("T")[1] ?? ""}
                          onChange={(e) => {
                            const date = row[col.key]?.split("T")[0] ?? ""
                            updateCell(rowIndex, col.key, `${date}T${e.target.value}`)
                          }}
                        />
                      </div>
                    )}

                    {/* ── Readiness dropdown with color ── */}
                    {col.type === "readiness" && (
                      <select
                        className={`w-full text-xs focus:outline-none rounded px-1 py-0.5 ${
                          readinessColor[row[col.key]] ?? "bg-transparent text-gray-600"
                        }`}
                        value={row[col.key]}
                        onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                      >
                        <option value=""></option>
                        {col.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {/* ── Regular dropdown ── */}
                    {col.type === "dropdown" && (
                      <select
                        className="w-full text-xs text-gray-600 focus:outline-none bg-transparent"
                        value={row[col.key]}
                        onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                      >
                        <option value=""></option>
                        {col.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {/* ── Text input (topics / specify / provider) ── */}
                    {col.type === "text" && col.key !== "provider" && (
                      <input
                        className="w-full text-xs text-gray-600 focus:outline-none bg-transparent"
                        value={row[col.key]}
                        onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                        placeholder={col.key === "topics" ? "e.g. 1, 2 …" : ""}
                      />
                    )}

                    {/* ── Autocomplete สำหรับ provider ── */}
                    {col.key === "provider" && (
                      <AutocompleteInput
                        value={row[col.key]}
                        onChange={(v) => updateCell(rowIndex, col.key, v)}
                      />
                    )}

                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add row button */}
        <button
          onClick={addRow}
          className="mt-2 text-sm text-blue-500 hover:underline"
        >
          + เพิ่มแถว
        </button>

        {/* Topic code legend */}
        <details className="mt-4 text-xs text-gray-400">
          <summary className="cursor-pointer hover:text-gray-600">Topic code reference</summary>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 pl-2">
            {Object.entries(topicCodeMap).map(([code, label]) => (
              <li key={code}><span className="font-semibold text-gray-500">{code}</span> — {label}</li>
            ))}
          </ul>
        </details>
        <div className="flex justify-end mt-10 pr-4">
        <button
        onClick={saveAll}
        disabled={saving}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "กำลังบันทึก..." : "💾 บันทึก"}
      </button>
      </div>
      </div>
      
    </div>
  )
}