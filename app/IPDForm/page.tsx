"use client"
import Image from 'next/image'
import {use, useState, useEffect} from 'react'
import { supabase } from "@/lib/supabase"
import { useRouter } from 'next/navigation'


type PatientCardProps = {
  name: string
  HN: string
  birth: string
  admit: string
  gender: string
  allergies: string
}
type Section = {
  id: string
  label: string
  fields: string[]
  subOptions?: string[];
  type?: string
}

function PatientCard({name, HN, birth, admit, gender, allergies}: PatientCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border-t-4 border-blue-500">
      <p className="text-2xl font-bold text-slate-800">{name}</p>
      <p className="text-sm text-slate-500 mt-1">HN: {HN}</p>
      <p className="text-sm text-slate-500 mt-1">Birth: {birth}</p>
      <p className="text-sm text-slate-500 mt-1">Admit: {admit}</p>
      <p className="text-sm text-slate-500 mt-1">Gender: {gender}</p>
      <p className="text-sm text-slate-500 mt-1">Allergies: {allergies}</p>
    </div>
  )
}   

const sections: Section[] = [
  {
    id: "orthopedics",
    label: "Orthopedics",
    fields: ["Observation", "Palpation", "Muscle power", "Range of Motion","Sensation", "Functional movement"],
  },
  {
    id: "cardiopulmonary",
    label: "Cardiopulmonary",
    fields: ["Observation", "Palpation", "Percussion", "Auscultation"],
  },
  {
    id: "neurology",
    label: "Neurology",
    fields: ["Observation", "Muscle Tone", "Balance", "Bad mobility and Transfering","Muscle Power", "Sensation"],
  },
]

const treatmentSection: Section[] =[
  {
    id: "ultrasound",
    label: "Ultrasound",
    type: "section",
    subOptions: ["Pulse", "Continuous"],  // ← มี checkbox ย่อย
    fields: ["minutes", "area"]
  },
  {
    id: "Manual",
    label: "Manual",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "paraffin",
    label: "Paraffin",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "tilt",
    label: "Tilt Table",
    type: "section",
    subOptions: [],                        // ← ไม่มี checkbox ย่อย
    fields: ["minutes", "Degree"],
  },
  {
    id: "electrical",
    label: "Electrical",
    type: "section",
    subOptions: [],                        // ← ไม่มี checkbox ย่อย
    fields: ["minutes", "area"],
  },
  {
    id: "cryotherapy",
    label: "Cryotherapy",
    type: "section",
    fields: ["minutes", "area"]
  },
  {
    id: "traction",
    label: "Traction",
    type: "section",
    subOptions: ["Cervical", "Lumbar"],                        // ← ไม่มี checkbox ย่อย
    fields: ["kilograms", "minutes"],
  },
  {
    id: "laser",
    label: "Laser",
    type: "section",
    subOptions: ["Pulse", "Continuous"],  // ← มี checkbox ย่อย
    fields: ["minutes", "area"]
  },
  {
    id: "shockwave",
    label: "Shockwave Diathemy",
    type: "section",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: ["minutes", "area"]
  },
  {
    id: "peripheral",
    label: "Peripheral Diathemy",
    type: "section",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: ["Mode","minutes", "area"]
  },
  {
    id: "shortwave",
    label: "Shortwave Diathemy/Microwave Diathemy",
    type: "section",
    subOptions: ["Pulse", "Continuous"],  // ← มี checkbox ย่อย
    fields: ["minutes", "area"]
  },
  {
    id: "motion exercise",
    label: "Range of Motion Exercise",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "hand",
    label: "Hand Exercise",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "strengh",
    label: "Strengthening Exercise",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "balance",
    label: "Balance Training",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "balance test",
    label: "Balance Test",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "Bicycle",
    label: "Bicycle Training",
    type: "section",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: ["Intensity","minutes"]
  },
  {
    id: "treadmill",
    label: "Treadmill Training",
    type: "section",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: ["speed(km/h)","minutes","distance"]
  },
  {
    id: "continuous",
    label: "Continuous Passive Motion",
    type: "section",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: ["minutes"," Flexion/Extentsion"]
  },
  {
    id: "percussion",
    label: "Percussion",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "vibration",
    label: "Vibration",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "chest",
    label: "Chest Mobilization",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "breath",
    label: "Breathing Exercise",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "suction",
    label: "Suction",
    type: "section",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: ["suction"]
  },
  {
    id: "am",
    label: "Ambulance",
    type: "section",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: ["with"]
  },
  {
    id: "partial",
    label: "Partial Weight Bearing",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "Non",
    label: "Non Weight Bearing",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "full",
    label: "Full Weight Bearing",
    type: "checkbox",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: []
  },
  {
    id: "othercheck",
    label: "Other",
    type: "section",
    subOptions: [],  // ← มี checkbox ย่อย
    fields: ["other"]
  },

  
  
]


// ============================================================
// FALL RISK DATA
// ============================================================

// --- Pediatric (Age < 15) ---
const pediatricCategories = [
  {
    id: "ped_age", label: "Age",
    options: [
      { label: "Less than 3 years old", score: 4 },
      { label: "3 to less than 7 years old", score: 3 },
      { label: "7 to less than 13 years old", score: 2 },
      { label: "13 years old and above", score: 1 },
    ],
  },
  {
    id: "ped_gender", label: "Gender",
    options: [
      { label: "Male", score: 2 },
      { label: "Female", score: 1 },
    ],
  },
  {
    id: "ped_diagnosis", label: "Diagnosis",
    options: [
      { label: "Neurological Diagnosis", score: 4 },
      { label: "Alteration in Oxygenation (Respiratory Diagnosis, Dehydration, Anemia, Anorexia, Syncope/Dizziness, Etc.)", score: 3 },
      { label: "Psycho/Behavioral disorders", score: 2 },
      { label: "Other Diagnosis", score: 1 },
    ],
  },
  {
    id: "ped_cognitive", label: "Cognitive Impairments",
    options: [
      { label: "Not Aware of Limitations", score: 3 },
      { label: "Forget Limitations", score: 2 },
      { label: "Oriented to Own Ability", score: 1 },
    ],
  },
  {
    id: "ped_environment", label: "Environment Factors",
    options: [
      { label: "History of Fall or Infant-Toddler Placed in Bed", score: 4 },
      { label: "Patient uses assistive devices or Infant Toddler in Crib or Furniture/Lighting (Tripled Room)", score: 3 },
      { label: "Patient Placed in Bed", score: 2 },
      { label: "Outpatient Area (Playground)", score: 1 },
    ],
  },
  {
    id: "ped_surgery", label: "Response to Surgery/Sedation/Anesthesia",
    options: [
      { label: "Within 24 hours", score: 3 },
      { label: "Within 48 hours", score: 2 },
      { label: "More than 48 hours / None", score: 1 },
    ],
  },
  {
    id: "ped_medication", label: "Medication",
    options: [
      { label: "Multiple Usage of Sedative, Hypnotics, Barbiturates, Phenothiazines, Antidepressants, Laxatives/Diuretics, Narcotics", score: 3 },
      { label: "One of Medication Listed Above", score: 2 },
      { label: "Other Medications / None", score: 1 },
    ],
  },
]

// --- Adult (Age ≥ 15) — Morse Fall Scale ---
const adultCategories = [
  {
    id: "adu_history", label: "มีประวัติล้มก่อนเข้าโรงพยาบาล หรือภายใน 3 เดือน",
    options: [
      { label: "No", score: 0 },
      { label: "Yes", score: 25 },
    ],
  },
  {
    id: "adu_diagnosis", label: "ได้รับการวินิจฉัยโรคมากกว่า 1 โรค",
    options: [
      { label: "No", score: 0 },
      { label: "Yes", score: 15 },
    ],
  },
  {
    id: "adu_ambulatory", label: "การใช้เครื่องช่วยเดิน (Ambulatory aid)",
    options: [
      { label: "นอนติดเตียง/ต้องการพยาบาลช่วย/ใช้รถเข็น", score: 0 },
      { label: "ใช้ไม้เท้า/ไม้ค้ำยัน (Crutches/Cane/Walker)", score: 15 },
      { label: "เดินโดยเกาะเฟอร์นิเจอร์ (Furniture)", score: 30 },
    ],
  },
  {
    id: "adu_iv", label: "มีสายน้ำเกลือ (IV)",
    options: [
      { label: "No", score: 0 },
      { label: "Yes", score: 20 },
    ],
  },
  {
    id: "adu_gait", label: "การเดิน/การเคลื่อนย้าย (Gait/Transferring)",
    options: [
      { label: "เดินปกติ/นอนติดเตียง/ไม่ขยับตัว (Normal/Immobile)", score: 0 },
      { label: "ท่าเดินโดดๆไปข้างหน้า ก้าวเท้าสั้น (Weak)", score: 10 },
      { label: "ท่าเดินผิดปกติ ลุกลำบาก เดินก้มหน้า (Impaired)", score: 20 },
    ],
  },
  {
    id: "adu_mental", label: "การรับรู้ (Mental status)",
    options: [
      { label: "รับรู้ความสามารถตนเอง (Orient to Own Ability)", score: 0 },
      { label: "ลืมข้อจำกัดความสามารถตน (Forget Limitations)", score: 15 },
    ],
  },
]

const adultFlags = [
  "A - Memory or cognitive impairment eg. Confusion, DELIRIUM, Brain surgery on this admission: Impaired vision",
  "B - HT and/or CVA or Heart disease (on this admission)",
  "C - Vertigo, Risk for postural hypotension or take medication with high fall risk",
]

// --- Obstetric (ตั้งครรภ์) — OFRAS ---
const obstetricCategories = [
  {
    id: "obs_group1", label: "1. ประวัติ",
    items: [
      { id: "obs_fall_history",  label: "มีประวัติกลัดล้มก่อนมาพักรักษาตัวในโรงพยาบาล 3 เดือน", options: [{ label: "NO", score: 0 }, { label: "YES", score: 2 }] },
      { id: "obs_sleep_history", label: "ประวัติการนอนหลับระหว่างการตั้งครรภ์", options: [{ label: "NO", score: 0 }, { label: "YES", score: 2 }] },
      { id: "obs_vision",        label: "ความบกพร่องทางสายตา", options: [{ label: "NO", score: 0 }, { label: "YES", score: 2 }] },
    ],
  },
  {
    id: "obs_group2", label: "2. ระบบหัวใจและหลอดเลือด",
    items: [
      { id: "obs_hematocrit", label: "มีประวัติซีด ความเข้มข้นของเม็ดเลือดน้อยกว่า 30%", options: [{ label: "NO", score: 0 }, { label: "YES", score: 2 }] },
      { id: "obs_eclampsia",  label: "ประวัติครรภ์เป็นพิษ", options: [{ label: "NO", score: 0 }, { label: "YES", score: 2 }] },
      { id: "obs_dizziness",  label: "อาการเวียนศีรษะ", options: [{ label: "NO", score: 0 }, { label: "YES", score: 2 }] },
      { id: "obs_sbp",        label: "ความดันโลหิตต่ำกว่าที่ค่า SBP < 20 mmHg", options: [{ label: "NO", score: 0 }, { label: "YES", score: 3 }] },
    ],
  },
  {
    id: "obs_group3", label: "3. ภาวะตกเลือด",
    items: [
      { id: "obs_low_platelet", label: "ได้รับการตรวจวินิจฉัยเป็นรกเกาะต่ำ", options: [{ label: "NO", score: 0 }, { label: "YES", score: 2 }] },
      { id: "obs_abruption",   label: "มีภาวะรกลอกหลุด", options: [{ label: "NO", score: 0 }, { label: "YES", score: 2 }] },
      { id: "obs_postpartum",  label: "มีภาวะตกเลือดหลังคลอด", options: [{ label: "NO", score: 0 }, { label: "YES", score: 3 }] },
    ],
  },
  {
    id: "obs_group4", label: "4. ระบบประสาท/การใช้ยาชาระงับความรู้สึก",
    items: [
      { id: "obs_numbness", label: "มีอาการแขน ขาชา", options: [{ label: "NO", score: 0 }, { label: "YES", score: 1 }] },
      { id: "obs_block",    label: "ภายใน 3 ชั่วโมงหลังผ่าตัดคลอด/ผ่าตัด Block หลัง", options: [{ label: "NO", score: 0 }, { label: "YES", score: 3 }] },
    ],
  },
  {
    id: "obs_group5", label: "5. การทำกิจกรรม",
    items: [
      { id: "obs_mobility", label: "การเคลื่อนไหวขา", options: [
        { label: "ขาเคลื่อนไหวได้ทั้ง 2 ข้าง (YES)", score: 0 },
        { label: "สามารถถยกขาขึ้นได้ แต่งอเข่าไม่ได้", score: 1 },
        { label: "ไม่สามารถถยกขาได้ 1 ข้าง", score: 2 },
        { label: "ไม่สามารถถยกขาได้ 2 ข้าง", score: 3 },
      ]},
    ],
  },
  {
    id: "obs_group6", label: "6. การใช้ยา",
    items: [
      { id: "obs_medication", label: "การรับยา", options: [
        { label: "ได้รับยาแก้ปวดแบบฉีดทาง IV, IM ภายใน 30 นาทีหลัง Admit", score: 1 },
        { label: "หลังจากได้รับยาความดันโลหิตสูง", score: 2 },
        { label: "หลังจากได้รับยาทั้งสองชนิดที่กล่าวข้างต้น", score: 3 },
      ]},
    ],
  },
]

function getPediatricRisk(score: number) {
  if (score >= 20) return "highly"
  if (score >= 12) return "strict"
  return "standard"
}

function getAdultRisk(score: number, hasFlag: boolean) {
  if (hasFlag || score > 50) return "highly"
  if (score >= 25) return "strict"
  return "standard"
}

function getObstetricRisk(score: number) {
  if (score > 5) return "highly"
  if (score >= 3) return "strict"
  return "standard"
}

const riskLabels: Record<string, string> = {
  standard: "Standard fall Precaution",
  strict:   "Strict fall Precaution",
  highly:   "Highly Strict fall Precaution",
}

function AutocompleteTextarea({
  value,
  onChange,
  wordBank,
  placeholder = "",
  className = "",
}: {
  value: string
  onChange: (val: string) => void
  wordBank: string[]
  placeholder?: string
  className?: string
}) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)  // ← track ว่า highlight อยู่ที่ไหน

  const getLastSegment = (text: string) => {
    // แยกด้วย comma หรือ newline — เอาส่วนสุดท้าย
    const parts = text.split(/,|\n/)
    return parts[parts.length - 1].trim()
  }

  const updateSuggestions = (text: string) => {
    const lastSeg = getLastSegment(text)
    if (lastSeg.length >= 1) {
      const filtered = wordBank.filter((w) =>
        w.toLowerCase().startsWith(lastSeg.toLowerCase())
      )
      setSuggestions(filtered)
      setShowDropdown(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowDropdown(false)
    }
    setActiveIndex(-1)  // reset highlight ทุกครั้งที่พิมพ์
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value
    onChange(newVal)
    updateSuggestions(newVal)
  }

  const handleSelect = (word: string) => {
    // แทนที่ segment สุดท้ายด้วยคำที่เลือก แล้วต่อท้ายด้วย ", " 
    const parts = value.split(/,|\n/)
    parts[parts.length - 1] = word
    const newVal = parts.join(", ") + ", "  // ← เว้นให้พิมพ์ต่อได้เลย
    onChange(newVal)
    // อัปเดต suggestions สำหรับคำถัดไป (หลัง ", " segment ใหม่ว่างเปล่า)
    updateSuggestions(newVal)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()  // ไม่ให้ขึ้นบรรทัดใหม่
      if (activeIndex >= 0) {
        handleSelect(suggestions[activeIndex])
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false)
      setActiveIndex(-1)
    }
  }

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
                  ? "bg-blue-500 text-white"        // ← highlight อันที่เลือกอยู่
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function PatientForm() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [beforeSaved, setBeforeSaved] = useState(false)
  const [saveAfter, setSaveAfter] = useState(false)
  const [subChecked, setSubChecked] = useState<Record<string, boolean>>({})


  const handleSaveBefore = async () => {
    // บันทึก before ลง supabase
    const { error } = await supabase.from("ipd_forms").insert({
      hn: patient[0].HN,  // TODO: เปลี่ยนเป็นค่าจริง
      type: "before",
      visit_date: date,
      visit_time: time,
      doctor: doctor1,
      diagnosis: diagnosis,
      pain_score: pain,
      // physical_exam: physicalExam,
      fall_risk: computedFallRisk,
      fall_risk_items: {
      mode: fallRiskMode,
      ...(fallRiskMode === "pediatric" && { pediatric: pedSelections }),
      ...(fallRiskMode === "adult"     && { adult: aduSelections, flags: aduFlags }),
      ...(fallRiskMode === "obstetric" && { obstetric: obsSelections }),
    },
      room: room,
      transporation: transporation === "Other" ? otherTran : transporation,
      underly: underlying === "Other" ? otherUnderly : underlying,
      vital_signs: {
        pr:   vitalData.pr,
        rr:   vitalData.rr,
        bp:   vitalData.bp,
        spo2: vitalData.spo2,
      },
      chief: Cheif,
      physio_precaution: physio,
      location: painLocation,
      pain_assesment: painAssesmentTool,
      characteristic: characteristic === "Other" ? chaOther : characteristic,
      duration: duration,
      frequence: frequency,
      barthel: checkbarthel,
      physical_exam: visited,
      assessment: physicalExam,
      treatmentplan: treatment,
      short_goal: shortgoal,
      long_goal: longGoal,


      // เพิ่ม field อื่นๆ ตามที่มีในฟอร์ม
    })

  setSaving(false)

    if (error) {
    console.log("error:", error)  // ← เช็ค error ก่อน
    alert("เกิดข้อผิดพลาด: " + error.message)
  } else {
    setBeforeSaved(true)    // ← ต้องรันถึงตรงนี้
    setActiveTab("after")   // ← แล้วถึงจะไป after ได้
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

  const handleSaveAfter = async () => {

  const { error } = await supabase.from("ipd_forms").insert({
    hn: patient[0].HN,
    type: "after",          // ← ต่างจาก before
    visit_date: new Date().toISOString().split("T")[0],
    visit_time: aftertime,
    physical_exam: physicalExam,
    pain_score: afterpain,
    frequence: afterfrequence,
    duration: afterduration,
    fall_risk: computedFallRisk,
    vital_signs: {
    pr:   aftervitalData.pr,
    rr:   aftervitalData.rr,
    bp:   aftervitalData.bp,
    spo2: aftervitalData.spo2,
  },
  location: afterlocationpain,
  pain_assesment: afterpainAssesmentTool,
  characteristic: aftercharacter === "Other" ? afterothercharacter : aftercharacter,
  suggest: suggest,
  status: discharge === "Other" ? otherDischarge : discharge,
  therapist: therapist,
  treatment_items: getTreatmentItems(),

  // ถ้าอยากเก็บรายละเอียด subOptions และ fields ด้วย
  treatment_detail: treatmentSection
    .filter((s) => checked[s.id])
    .reduce((acc, s) => {
      acc[s.id] = {
        subOptions: s.subOptions?.filter((sub) => subChecked[`${s.id}-${sub}`]),
        fields: s.fields.reduce((f, field) => {
          f[field] = values[`${s.id}-${field}`] ?? ""
          return f
        }, {} as Record<string, string>)
      }
      return acc
    }, {} as Record<string, any>)
  })

  if (!error) {
  setSaveAfter(true)
  router.push("/Finish")
} else {
  console.log("error:", error)  // ← ดู error จริงๆ
  alert("เกิดข้อผิดพลาด: " + error.message)
}
}


    const patient = [
        {
        name: "Alice",
        HN: "67-02559",
        birth: "07/01/1980",
        admit: "01/01/2024",
        gender: "Male",
        allergies: "-"}
    ]

    const [checked, setChecked] = useState<Record<string, boolean>>({})
    const [values, setValues] = useState<Record<string, string>>({})
    const [activeSection, setActiveSection] = useState<string | null>(null)
    const toggleSection = (id: string) => {
  const isChecked = checked[id] ?? false
  const isActive = activeSection === id

  if (!isChecked) {
    // ======================================
    // ยังไม่ติ๊ก → ติ๊ก + เปิด section
    // ======================================
    setChecked((prev) => ({ ...prev, [id]: true }))
    setActiveSection(id)

  } else if (isChecked && !isActive) {
    // ======================================
    // ติ๊กแล้ว แต่ section ปิดอยู่ → เปิด section
    // ไม่ untick
    // ======================================
    setActiveSection(id)

  } else if (isChecked && isActive) {
    // ======================================
    // ติ๊กแล้ว และ section เปิดอยู่ → ยุบ section
    // แต่ยังติ๊กน้ำเงินอยู่
    // ======================================
    setActiveSection(null)
  }
}
    const toggle = (id: string) => {
        setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
    }
    const togglecheck = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }
  const toggleSub = (sectionId: string, sub: string) => {
    const key = `${sectionId}-${sub}`
    setSubChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }
    const handleInput = (sectionId: string, field: string, value: string) => {
    setValues((prev) => ({ ...prev, [`${sectionId}-${field}`]: value }))
  }

    const vitalSigns = [
    { key: "pr",   label: "PR",   unit: "bpm"        },
    { key: "rr",   label: "RR",   unit: "breaths/min" },
    { key: "bp",   label: "BP",   unit: "mmHg"        },
    { key: "spo2", label: "SpO2", unit: "%"           },
    ]
    const [Cheif, setChief] = useState("")
    const [physio, setPhysio] = useState("")

    const barthel =[
      {key: "yes", label: "Yes"},
      {key: "no", label: "No"},
    ]
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
    const goal =[
      {key: "short", label: "Short term goal"},
      {key: "long", label: "Long term goal"},
    ]
    const [checkbarthel, setCheckBarthel] = useState("")
    const physicalExam = sections.reduce((acc, section) => {
    acc[section.id] = {
      checked: checked[section.id] ?? false,
      fields: section.fields.reduce((fieldAcc, field) => {
        fieldAcc[field] = values[`${section.id}-${field}`] ?? ""
        return fieldAcc
      }, {} as Record<string, string>)
    }
    return acc
  }, {} as Record<string, { checked: boolean; fields: Record<string, string> }>)
    

    const [value, setValue] = useState("")
    const [aftervalue, setAfterValue] = useState<Record<string, string>>({})
    const [afterchecked, setAfterChecked] = useState<Record<string, Boolean>>({})
    const [show, setShow] = useState(false)
    const [diagnosis, setDiagnosis] = useState("")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [time2, setTime2] = useState("")
    const [room, setRoom] = useState("")
    const [doctor1, setDoctor1] = useState("")
    const [show1, setShow1] = useState(false)
    const [doctor2, setDoctor2] = useState("")
    const [show2, setShow2] = useState(false)
    const filtered1 = doctorList.filter((item) => item.includes(doctor1))
    const filtered2 = doctorList.filter((item) => item.includes(doctor2))
    const [transporation, setTransportation] = useState("")
    const option = ["walk", "wheelchair", "Stretcher", "Other"]
    const optionunderly: string[] = ["None", "Heart disease", "Cancer", "Diabetes Mellitus", "Hypertension", "Other"]
    const [vitalData, setVitalData] = useState<Record<string, string>>({
    pr: "",
    rr: "",
    bp: "",
    spo2: "",
  })
  const [aftervitalData, setAftervitalData] = useState<Record<string, string>>({
    pr: "",
    rr: "",
    bp: "",
    spo2: "",
  })
    const [symtom, setSymtom] = useState<Record<string, string>>({
    chief: "",
    phisyo: "",
  })
  const [otherTran, setOtherTran] = useState("")
  const [underlying, setUnderlying] = useState('')
  const [otherUnderly, setOtherUnderly] = useState("")
  const [pain, setPain] = useState("")
  const [painLocation, setPainLocation] = useState("")
  const painAssesment = ["Newborn - 1 year (NIPS)",">1-3 years (FLACC)", "3-8 years (FRS)", ">8 years (NRS)", "CPOT (Critical care Pain Observation Tool)"]
  const [painAssesmentTool, setPainAssesmentTool] = useState("")
  const cha = ["Prick", "Sharp", "Dull", "Burning", "Throbbing", "Tight", "Radiating", "Pin & Needles", "Other"]
  const [characteristic, setCharacteristic] = useState("")
  const [chaOther, setChaOther] = useState("")
  const [duration, setDuration] = useState("")
  const frequencyOptions = ["Constant", "Intermittent"]
  const [frequency, setFrequency] = useState("")
  // Fall risk mode & selections
  const [fallRiskMode, setFallRiskMode] = useState<"pediatric" | "adult" | "obstetric">("pediatric")
  const [pedSelections,  setPedSelections]  = useState<Record<string, number>>({})
  const [aduSelections,  setAduSelections]  = useState<Record<string, number>>({})
  const [aduFlags,       setAduFlags]       = useState<Record<string, boolean>>({})
  const [obsSelections,  setObsSelections]  = useState<Record<string, number>>({})

  const pedTotal  = Object.values(pedSelections).reduce((s, v) => s + v, 0)
  const aduTotal  = Object.values(aduSelections).reduce((s, v) => s + v, 0)
  const aduHasFlag = Object.values(aduFlags).some(Boolean)
  const obsTotal  = Object.values(obsSelections).reduce((s, v) => s + v, 0)

  const computedFallRisk =
    fallRiskMode === "pediatric" ? getPediatricRisk(pedTotal) :
    fallRiskMode === "adult"     ? getAdultRisk(aduTotal, aduHasFlag) :
                                  getObstetricRisk(obsTotal)
  // const [fallRisk, setFallRisk] = useState("standard")

  const [shortgoal, setShortGoal] = useState("")
  const [longGoal, setLongGoal] = useState("")
  const [activeTab, setActiveTab] = useState<"before" | "after">("before")
  const [afterfallrisk, setAfterfallrisk] = useState("")
  const [afterpain, setAfterpain] = useState("")
  const suggestOption = [
    "การบริหารร่างกาย(P/I-BSI-024.1)","การลดปวด(P/I-BSI-025.1)","Fall","การฝึกเดิน(P/I-BSI-023.1","การเคาะปอด(P/I-BSI-022.1","การออกกำลังกายในผู้ป่วยอัมพาต(P/I-BSI-017.)"
  ]
  const [suggest,setSuggest] = useState("")
  const status = [
    "รู้สึกดี", "ซึม", "สับสน", "ไม่รู้สึกตัว", "อื่น ๆ"
  ]
  const [discharge,setDischarge] = useState("")
  const [otherDischarge, setOtherDischarge] = useState("")
  const [therapist,setTherapist] = useState("")
  const [afterdate, setAfterDate] = useState("")
  const [aftertime, setAfterTime] = useState("")
  const [afterfrequence, setAfterFrequence] = useState("")
  const [afterduration, setAfterDuration] = useState("")
  const [afterlocationpain, setAfterLocationPain] = useState("")
  const [afterpainAssesmentTool, setAfterPainAssesmentTool] = useState("")
  const [aftercharacter, setAfterCharacter] = useState("")
  const [afterothercharacter, setAfterOtherCharacter] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [treatmentchecked, setTreatmentChecked] = useState<Record<string, boolean>>({})
  const getTreatmentItems = () => {
      return treatmentSection
        .filter((s) => checked[s.id])          // เฉพาะที่ติ้ก
        .map((s) => {
          const item: Record<string, any> = { id: s.id, label: s.label }

          // เก็บ subOptions ที่ติ้ก (ถ้ามี)
          if (s.subOptions && s.subOptions.length > 0) {
            item.subOptions = s.subOptions.filter(
              (sub) => subChecked[`${s.id}-${sub}`]
            )
          }

          // เก็บ field values (ถ้ามี)
          if (s.fields && s.fields.length > 0) {
            item.fields = {}
            s.fields.forEach((field) => {
              item.fields[field] = values[`${s.id}-${field}`] ?? ""
            })
          }

          return item
        })

    }

  const router = useRouter()
  const [visited, setVisited] = useState("")

  useEffect(() => {
  const checkBeforeSaved = async () => {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("ipd_forms")
      .select("id")
      .eq("hn", patient[0].HN)  // ← ใช้ patient.HN แทน patientId
      .eq("type", "before")
      .eq("visit_date", today)
      .maybeSingle()  // ← เปลี่ยนจาก .single() เป็น .maybeSingle()

    if (error) console.log("error:", error)
    setBeforeSaved(!!data)
  }

  checkBeforeSaved()
}, [])

useEffect(() => {
    setIsMounted(true)
  }, [])

useEffect(() => {
  if (!isMounted) return
  if (activeTab !== "after") return

  const fetchBeforeData = async () => {
      const today = new Date().toISOString().split("T")[0]
  
      const { data, error } = await supabase
        .from("ipd_forms")
        .select("pain_score, fall_risk, duration, visit_date, visit_time, frequence, location, pain_assesment, characteristic, physical_exam")
        .eq("hn", patient[0].HN)
        .eq("type", "before")
        .eq("visit_date", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
  
      if (error) {
        
        console.log("error:", error)
      } else if (data) {
        console.log("data ที่ได้มา:", data)
        // ======================================
        // ต้องเพิ่มตรงนี้ — ที่ลืมไป
        // ======================================
        setAfterfallrisk(data.fall_risk ?? "standard")
        setAfterpain(data.pain_score ?? "")
        setAfterDuration(data.duration ?? "")
        setAfterDate(data.visit_date?? "")
        setAfterTime(data.visit_time?? "")
        setAfterFrequence(data.frequence?? "")
        setAfterLocationPain(data.location?? "")
        setAfterPainAssesmentTool(data.pain_assesment?? "")
        setAfterCharacter(data.characteristic?? "")
        setAfterOtherCharacter(data.characteristic?? "")
  
        // physical_exam
        const exam = data.physical_exam
        const restoredChecked: Record<string, boolean> = {}
        const restoredValues: Record<string, string> = {}
  
        sections.forEach((section) => {
          restoredChecked[section.id] = exam[section.id]?.checked ?? false
          section.fields.forEach((field) => {
            restoredValues[`${section.id}-${field}`] =
              exam[section.id]?.fields[field] ?? ""
          })
        })
  
        setAfterChecked(restoredChecked)
        setAfterValue(restoredValues)
      }
    }
  
    fetchBeforeData()
  }, [activeTab, isMounted]) 

  const [treatment, setTreatment] = useState("")

  // ============================================================
// AUTOCOMPLETE WORD BANK
// ============================================================
const chiefComplaintWords = [
  "Pain at", "Limit ROM at", "Secretion Retention", "Poor Ambulation",
  "Faired Ambulation", "Poor Ventilation", "Muscle Weakness",
  "Right", "Left", "Both",
  "Neck", "Shoulder", "Elbow", "Wrist", "Hand", "Finger",
  "Hip", "Knee", "Ankle", "Chest", "Thigh", "Back", "Thorax", "Foot",
]

const physioWords = [
  "Dyspnea", "Fall", "Progressive Pain", "None",
]

const treatmentPlanWords = [
  "Pain Relief", "Increase ROM", "Improve ambulation", "Secretion Clearance",
  "Correct Gait Pattern", "Improve Ventilation", "Improve Breathing pattern",
  "Increase muscle power", "Maintain ROM", "Maintain muscle power",
  "Prevent Complication",
]

const shortGoalWords = [
  "Pain Relief ≤ 2 within", "Improve Ambulation within", "Increase ROM within",
  "Secretion Clearance within", "Correct Gait Pattern within",
  "Improve Ventilation within", "Normal ADL within", "Normal lung function within",
  "Improve Breathing pattern within", "Increase muscle power within",
  "Maintain ROM without pain", "Maintain muscle power within",
  "Prevent complication within",
]

const longGoalWords = [
  "Normal ADL", "Normal lung function", "Normal Ambulation",
  "Pain Relief", "Full ROM", "Increase muscle power",
  "Prevent complication",
]

// ============================================================
// SECTION FIELD WORD BANK — แยกตาม sectionId + fieldName
// ============================================================
const sectionFieldWords: Record<string, Record<string, string[]>> = {
  orthopedics: {
    "Observation": [
      "On Knee Brace", "On Jewett Brace", "On Taylor Brace", "On Lumbar support",
      "Normal", "Swelling",
    ],
    "Palpation": [
      "Tenderness", "Swelling", "Bruise", "Tightness", "Tension", "Normal",
    ],
    "Muscle power": [
      "Depend on pain", "Normal",
    ],
    "Range of Motion": [
      "Limit by pain", "Full ROM",
    ],
    "Sensation": [
      "Intact", "Impair", "Loss",
    ],
    "Functional movement": [
      "Pain on movement", "No Pain on movement",
    ],
  },
  cardiopulmonary: {
    "Observation": [
      "On ICD", "On Oxygen Cannula", "On Oxygen Mask", "On High flow",
      "On ET tube", "On Tracheostomy", "On Foley Catheter", "On IV line", "Normal",
    ],
    "Palpation": [
      "Normal Chest movement", "Normal Chest Expansion",
      "Decrease Chest movement", "Decrease Chest Expansion",
      "Symmetrical Chest Expansion",
    ],
    "Percussion": [
      "Dullness", "Resonance", "Hyperesonance",
    ],
    "Auscultation": [
      "Normal Breath sound", "Decrease Breath sound",
      "Secretion sound", "Wheezing Sound", "Crepitation Sound",
    ],
  },
  neurology: {
    "Observation": [
      "On NG", "On Shoulder Support", "On Foley Catheter",
      "Normal", "Abnormal Gait Pattern",
    ],
    "Muscle Tone": [
      "Normal", "Flaccid Tone", "Hypotone", "Hypertone",
    ],
    "Balance": [
      "Normal Static Sitting Balance", "Normal Static Standing Balance",
      "Normal Dynamic Sitting Balance", "Normal Dynamic Standing Balance",
      "Good", "Fair", "Poor", "Loss",
    ],
    "Bad mobility and Transfering": [
      "Independent", "Minimal Assistance", "Moderate Assistance",
      "Maximum Assistance", "Contact Guarding", "Close Guarding", "Supervision",
    ],
    "Muscle Power": [
      "Muscle Grade I", "Muscle Grade II", "Muscle Grade III",
      "Muscle Grade IV", "Muscle Grade V", "Muscle Grade 0",
    ],
    "Sensation": [
      "Intact", "Impair", "Loss",
    ],
  },
}

const AftersectionFieldWords: Record<string, Record<string, string[]>> = {
  orthopedics: {
    "Observation": [
      "On Knee Brace", "On Jewett Brace", "On Taylor Brace", "On Lumbar support", "On Lumbar support",
      "Normal"
    ],
    "Palpation": [
      "Less Tender", "Improving", "Normal",
    ],
    "Muscle power": [
      "Improving", "Normal",
    ],
    "Range of Motion": [
      "Normal", "Improving"
    ],
    "Sensation": [
      "Intact", "Impair", "Loss",
    ],
    "Functional movement": [
      "Normal", "Improving"
    ],
  },
  cardiopulmonary: {
    "Observation": [
      "On ICD", "On Oxygen Cannula", "On Oxygen Mask", "On High flow",
      "On ET tube", "On Tracheostomy", "On Foley Catheter", "On IV line", "Normal",
    ],
    "Palpation": [
      "Normal Chest movement", "Normal Chest Expansion",
      "Improving"
    ],
    "Percussion": [
      "Normal", "Improving",
    ],
    "Auscultation": [
      "Normal", "Improving",
    ],
  },
  neurology: {
    "Observation": [
      "On NG", "On Shoulder Support", "On Foley Catheter",
      "Normal", "Abnormal Gait Pattern",
    ],
    "Muscle Tone": [
      "Normal", "Improving",
    ],
    "Balance": [
      "Normal", "Improving",
    ],
    "Bad mobility and Transfering": [
      "Independent", "Improving",
    ],
    "Muscle Power": [
      "Improving",
    ],
    "Sensation": [
      "Intact", "Impair", "Loss",
    ],
  },
}
    return(
        <div className='min-h-screen bg-gray-100'>
            <p className='flex justify-start items-end bg-white px-4 py-4'>
                <Image src='/Hospital logo.svg' alt="Hospital Logo" width={100} height={50}></Image>
                <a href='/' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                    Home
                </a>
                <a href='/patient' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                    Patient Form
                </a>
            </p>
            <p className ="p-2"></p>
            <div className="bg-white rounded-2xl mx-auto w-300 p-4 shadow-md text-blue-900">
                <h2 className="text-xl font-bold mb-4">{patient[0].name}</h2>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-blue-900 font-bold">HN</p>
                    <p>{patient[0].HN}</p>

                    <p className="text-blue-900 font-bold">Date of Birth</p>
                    <p>{patient[0].birth}</p>

                    <p className="text-blue-900 font-bold">Admit</p>
                    <p>{patient[0].admit}</p>

                    <p className="text-blue-900 font-bold">Gender</p>
                    <p>{patient[0].gender}</p>

                    <p className="text-blue-900 font-bold">Allergies</p>
                    <p>{patient[0].allergies}</p>
                </div>

            </div>
            <p className='p-4'></p>
            {/* ----------------------------------------------------------------------------------------------------- */}

            

            <div className="bg-white rounded-2xl mx-auto w-300 p-4 shadow-md">
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-lg shadow-xs -space-x-px" role="group">

                  {/* Before button */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("before")}
                    className={`font-medium text-sm px-6 py-2 rounded-l-lg border transition-colors ${
                      activeTab === "before"
                        ? "bg-blue-500 text-white border-blue-500"   // active → น้ำเงิน
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
                        ? "bg-blue-500 text-white border-blue-500"   // inactive แต่กดได้ → เทา
                        : "bg-gray-200 text-gray-500 border-gray-200" // ยังกดไม่ได้
                    }`}
                  >
                    After
                  </button>

                </div>
              </div>


              {activeTab === "before" && (
                <div>
                <div className='text-base text-gray-500 p-2'>Diagnosis
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
          const isChecked = checked[section.id] ?? false

          return (
            <div key={section.id}>

              {/* ======================================
                  Header row ของแต่ละ section
                  สีเปลี่ยนตาม isChecked
                  ====================================== */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200 ${
                  isChecked
                    ? "bg-green-100 border border-green-400"  // ติ๊กแล้ว → เขียว
                    : "bg-gray-100 border border-gray-300"    // ยังไม่ติ๊ก → เทา
                }`}
                onClick={() => toggle(section.id)} // กดที่แถวเพื่อ toggle
              >
                {/* ซ้าย: checkbox + label */}
                <div className="flex items-center gap-3">

                  {/* Checkbox — เปลี่ยนสีตาม isChecked */}
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors duration-400 ${
                      isChecked
                        ? "bg-green-500 border-green-500"  // ติ๊ก → เขียว
                        : "bg-white border-gray-400"        // ไม่ติ๊ก → ขาว
                    }`}
                  >
                    {/* checkmark — แสดงเฉพาะตอนติ๊ก */}
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* ชื่อ section */}
                  <div>
                    <p className={`font-medium ${isChecked ? "text-green-700" : "text-gray-500"}`}>
                      {section.label}
                    </p>
                    <p className="text-xs text-gray-400">if condition applied to</p>
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
                      onChange={(val) => handleInput(section.id, field, val)}
                      wordBank={sectionFieldWords[section.id]?.[field] ?? []}
                      placeholder={`กรอก ${field}`}
                      className="flex-1 border border-gray-300 text-gray-500 w-full rounded-lg px-3 text-sm focus:outline-none focus:border-green-400 resize-none"
                    />
                    </div>
                  ))}
                </div>
              )}

            </div>
          )
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
        <div className="flex flex-col gap-1 flex-1 relative">  {/* ← เพิ่ม relative */}
          <label className="text-sm text-gray-500">Doctor</label>
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
            value={doctor1}
            onChange={(e) => {
              setDoctor1(e.target.value)
              setShow1(true)
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
                    setDoctor1(item)
                    setShow1(false)
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}

          {show2 && doctor2 && filtered2.length === 0 && (
            <div className="absolute top-full left-0 z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
              <div className="px-4 py-2 text-sm text-gray-400">ไม่พบข้อมูล</div>
            </div>
          )}
        </div>

      </div>

      {/* transportation */}
      <div className="flex items-end gap-7 mt-10 ml-4 w-full pr-4">
        <div className='text-base font-medium text-gray-500'>Transporation</div>
        <div className='flex gap-2 items-end w-full'>
          {option.map((option)=> (
            <label key={option} className='flex w-full items-center gap-2 cursor-pointer'>
              <input 
              type="radio"
              name="Transportation"
              value={option}
              checked={transporation === option}
              onChange={(e) => setTransportation(e.target.value)}
              className='w-4 h-4 accent-blue-500'
              />
              <span className='text-sm text-gray-500'>{option}</span>
              {option === "Other" && transporation === "Other" && (
              <input
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-400 w-48"
                placeholder="โปรดระบุ..."
                value={otherTran}
                onChange={(e) => setOtherTran(e.target.value)}
                autoFocus/>
              )}
            </label>
          ))}
        </div>
        
        
        
        
      </div>

      <div className="flex gap-6 mt-10 ml-4 w-full pr-4">
        {vitalSigns.map((item) => (
          <div key={item.key} className="flex flex-col gap-1">

            <label className="text-sm text-gray-500">{item.label}</label>

            <div className="flex items-center gap-2">
              <input
                className="w-20 border border-gray-300 text-gray-500 w-full ml-6 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                value={vitalData[item.key as keyof typeof vitalData]}
                onChange={(e) => setVitalData({ ...vitalData, [item.key]: e.target.value })}
              />
              <span className="text-sm text-gray-400">{item.unit}</span>
            </div>

          </div>
        ))}
      </div>

      <div className= 'flex flex-col gap-1 pl-4'>
        <label className='text-sm text-gray-500 mt-10'>Chief Complaint</label>
        <div className='flex items-center gap-2'>
          <AutocompleteTextarea
            value={Cheif}
            onChange={setChief}
            wordBank={chiefComplaintWords}
            placeholder="พิมพ์เพื่อค้นหา..."
            className="border border-gray-300 rounded-lg py-3 px-3 w-full text-sm text-gray-500 focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className= 'flex flex-col gap-1 pl-4'>
        <label className='text-sm text-gray-500 mt-10'>Physiotherapy Precaution</label>
        <div className='flex items-center gap-2'>
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
    <div className="flex flex-col  gap-1">
      <label className="text-sm text-gray-500">Underlying Precaution</label>
      <select
        className="border border-gray-300 rounded-lg px-3 w-80 py-1.5 text-sm text-gray-500"
        value={underlying}
        onChange={(e) => {
          setUnderlying(e.target.value)
          setOtherUnderly("")
        }}
      >
        <option value="">-- Select --</option>
        {optionunderly.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>

      {underlying === "Other" && (
        <input
          className="border border-gray-300 rounded-lg px-3 w-80 py-1.5 text-sm focus:outline-none focus:border-blue-400"
          value={otherUnderly}
          onChange={(e) => setOtherUnderly(e.target.value)}
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
    <div className='flex flex-col gap-1 ml-12'>
      <label className='text-sm text-gray-500 '>Location of Pain</label>
      <input
        className="border border-gray-300 rounded-lg px-3 w-80 py-1.5 text-sm text-gray-500 focus:outline-none focus:border-blue-400"

        value={painLocation}
        onChange={(e) => setPainLocation(e.target.value)}
      />
    </div>
    </div>

    <div className='flex gap-1 p-4 mt-10 w-full'>

    <div className='flex flex-col gap-1'>
      <label className='text-sm text-gray-500'>Pain Assesment tool</label>
      <select
        className="border border-gray-300 w-80 rounded-lg px-3 py-1.5 text-sm text-gray-500"
        value={painAssesmentTool}
        onChange={(e) => setPainAssesmentTool(e.target.value)}
      >
        <option value="">-- Select --</option>
        {painAssesment.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </div>

    <div className='flex flex-col gap-1 ml-17'>
      <label className='text-sm text-gray-500'>Characteristic</label>
      <select
      className='border border-gray-300 rounded-lg text-sm w-80 text-gray-500 px-3 py-1.5'
      value={characteristic}
      onChange={(e)=> setCharacteristic(e.target.value)}>
        <option value="">--- Select ---</option>
        {cha.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      {characteristic === "Other" &&
        <input
        className="border border-gray-300 w-80 rounded-lg text-sm text-gray-500 py-1.5 focus: outline-none focus:border-blue-400"
        value={chaOther}
        onChange={(e) => setChaOther(e.target.value)}
        ></input>}
    </div> 

    <div className='flex flex-col gap-1 ml-17'>
      <label className='text-sm text-gray-500'>Duration</label>
      <input 
      className='border border-gray-300 text-sm text-gray-500 rounded-lg px-3 py-1.5 w-80 focus:outline-none focus:border-blue-400'
      value={duration}
      onChange={(e) => setDuration(e.target.value)}/>
    </div>
    </div>

    <div className='flex p-4 w-full gap-1 mt-10'>
      <div className="flex flex-col gap-1">
      <label className='text-sm text-gray-500'>Frequency</label>
      <select
      className='border border-gray-300 rounded-lg w-80 text-sm text-gray-500 px-3 py-1.5 focus:outline-none focus:border-blue-400'
      value={frequency}
      onChange={(e) => setFrequency(e.target.value)}
      >
        <option value="">--Select--</option>
        {frequencyOptions.map((item) => 
        <option key={item} value={item}>{item}</option>)}
        </select>
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
        {mode === "pediatric" ? "Pediatric Age < 15 years" :
         mode === "adult"     ? "Adult Age ≥ 15 years" :
                                "ผู้ป่วยตั้งครรภ์และหลังคลอด 6 สัปดาห์"}
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
                onClick={() => setPedSelections((prev) => ({ ...prev, [cat.id]: opt.score }))}
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
        <p className="text-lg font-bold text-gray-800">{pedTotal}</p>
      </div>
    </div>
  )}

  {/* ====== ADULT ====== */}
  {fallRiskMode === "adult" && (
    <div className="flex flex-col gap-3">
      {/* Flags A, B, C */}
      <div className="border rounded-xl p-4 bg-gray-50">
        <p className="text-sm text-gray-500 mb-3">Flags — ถ้าติ๊กข้อใดข้อหนึ่ง = Highly Strict ทันที</p>
        <div className="flex flex-col gap-2">
          {adultFlags.map((flag) => (
            <label key={flag} className="flex items-start gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-0.5 accent-blue-500"
                checked={aduFlags[flag] ?? false}
                onChange={() => setAduFlags((prev) => ({ ...prev, [flag]: !prev[flag] }))}
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
                onClick={() => setAduSelections((prev) => ({ ...prev, [cat.id]: opt.score }))}
                className={`px-4 py-2 rounded-full border text-sm transition-colors cursor-pointer ${
                  aduSelections[cat.id] === opt.score
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
              >
                {opt.label} {opt.score > 0 && <span className="text-xs opacity-70">({opt.score})</span>}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
        <p className="text-sm font-medium text-gray-700">Total Score</p>
        <p className="text-lg font-bold text-gray-800">{aduTotal}</p>
      </div>
    </div>
  )}

  {/* ====== OBSTETRIC ====== */}
  {fallRiskMode === "obstetric" && (
    <div className="flex flex-col gap-3">
      {obstetricCategories.map((group) => (
        <div key={group.id} className="border rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">{group.label}</p>
          <div className="flex flex-col gap-4">
            {group.items.map((item) => (
              <div key={item.id}>
                <p className="text-sm text-gray-500 mb-2">{item.label}</p>
                <div className="flex flex-wrap gap-2">
                  {item.options.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setObsSelections((prev) => ({ ...prev, [item.id]: opt.score }))}
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
        <p className="text-sm font-medium text-gray-700">Total Score</p>
        <p className="text-lg font-bold text-gray-800">{obsTotal}</p>
      </div>
    </div>
  )}

  {/* Result */}
  <div className="flex gap-6 py-4 border-t border-gray-200">
    <p className="text-sm text-gray-500 mr-4">Fall risk</p>
    {["standard", "strict", "highly"].map((level) => (
      <label key={level} className="flex items-center gap-2 pointer-events-none">
        <input
          type="radio"
          className="w-4 h-4 accent-blue-500"
          checked={computedFallRisk === level}
          readOnly
        />
        <span className="text-sm text-gray-700">{riskLabels[level]}</span>
      </label>
    ))}
  </div>

</div>
      <div className="flex gap-4 p-4 mt-10 w-full items-end">
      <label className="text-sm text-gray-500 w-full ">Barthel Index</label>

      {barthel.map((item) => (
        <label key={item.key} className="flex w-full items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value={item.key}
            name='CheckBarthel'
            checked={checkbarthel === item.key}
            onChange={(e) =>
              setCheckBarthel(e.target.value)
            }
          />
          <span className="text-sm text-gray-700">{item.label}</span>
        </label>
      ))}
    </div>

    <div className="flex gap-1 mt-10 pr-4">
      <label className="text-sm text-gray-500 p-4">Physical Examination Visit</label>
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
          value={visited}
          onChange={(e) => {
            setVisited(e.target.value)
          }}
        />
    </div>

    <div className='flex gap-1 w-full items-end p-4 pr-4'>
      <div className='flex flex-col w-full mt-10'>
        <label className='text-sm text-gray-500'>Treatment Plan</label>
        <div className='flex items-center gap-2'>
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
        <label className="text-sm text-gray-500">Participatory Goal Setting</label>

        <div className='flex flex-col gap-2'>
          <label className="text-sm text-gray-500 mt-4">Short term goal</label>
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
        <label className="text-sm text-gray-500">Participatory Goal Setting</label>

        <div className='flex flex-col gap-2'>
          <label className="text-sm text-gray-500 mt-4">Long term goal</label>
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
                onClick={handleSaveBefore}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg mt-4 hover:bg-blue-700 cursor-pointer">บันทึก
              </button>
            </div>
            </div>
          )}
          
{/* -----------------------------------------------------------------------------After Tabs-------------------------------------------------------- */}
          
          {activeTab === "after" && (
            <div>
              <div className='text-gray-500 text-base ml-2'>Physiotherapy Treatment</div>
              <div className="flex flex-wrap gap-4 p-6">
                  {treatmentSection.map((section) => {
                    const isChecked = checked[section.id] ?? false

                    return (
                      <div key={section.id}>

                        {/* ======================================
                            Header — กดติ๊กได้
                            ====================================== */}
                        <div
                          onClick={() => toggleSection(section.id)}
                          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl cursor-pointer border transition-colors whitespace-nowrap ${
                            checked[section.id]
                              ? "bg-blue-700 text-white border-blue-700"   // ติ๊กแล้ว → น้ำเงิน
                              : "bg-white text-gray-600 border-gray-300"   // ยังไม่ติ๊ก → ขาว
                          }`
                        }
                        >
                          
                          
                          {/* Checkbox */}
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                            isChecked ? "bg-white border-white" : "bg-white border-gray-400"
                          }`}>
                            {isChecked && (
                              <svg className="w-3 h-3 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium">{section.label}</span>
                          {checked[section.id] && (
                          <span
                            className="ml-1 text-white hover:text-red-300 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()  // ไม่ให้ toggle section
                              setChecked((prev) => ({ ...prev, [section.id]: false }))
                              setActiveSection(null)
                            }}
                          >
                            ✕
                          </span>
                        )}
                        </div>

                        {/* ======================================
                            Content — แสดงเฉพาะตอนติ๊ก
                            ====================================== */}
                        {checked[section.id] && activeSection === section.id && section.type === "section" && (
                          <div className="bg-blue-600 rounded-xl px-4 py-3 flex flex-col gap-3">

                            {/* Sub checkboxes — แสดงถ้ามี */}
                            {section.subOptions && section.subOptions.length > 0 && (
                              <div className="flex gap-4">
                                {section.subOptions.map((sub) => {
                                  const subKey = `${section.id}-${sub}`
                                  const isSubChecked = subChecked[subKey] ?? false

                                  return (
                                    <label
                                      key={sub}
                                      className="flex text-sm items-center gap-2 cursor-pointer"
                                      onClick={() => toggleSub(section.id, sub)}
                                    >
                                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 ${
                                        isSubChecked ? "bg-white border-white" : "bg-transparent border-white"
                                      }`}>
                                        {isSubChecked && (
                                          <svg className="w-3 h-3 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                      <span className="text-white font-medium">{sub}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            )}

                            {/* Input fields */}
                            {section.fields.map((field) => (
                              <input
                                key={field}
                                className="w-full bg-blue-500 border border-blue-400 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-200 focus:outline-none focus:border-white"
                                placeholder={field}
                                value={values[`${section.id}-${field}`] ?? ""}
                                onChange={(e) => handleInput(section.id, field, e.target.value)}
                              />
                            ))}

                          </div>
                        )}

                      </div>
                    )
                  })}
                </div>
                <div className='border-b-2 border-gray-300 mt-4 mb-10'></div>
                <div className='text-base text-gray-500 p-2'>Diagnosis
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
          const isChecked = checked[section.id] ?? false

          return (
            <div key={section.id}>

              {/* ======================================
                  Header row ของแต่ละ section
                  สีเปลี่ยนตาม isChecked
                  ====================================== */}
              <div
                className={`flex items-center mb-4 justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors duration-200 ${
                  isChecked
                    ? "bg-green-100 border border-green-400"  // ติ๊กแล้ว → เขียว
                    : "bg-gray-100 border border-gray-300"    // ยังไม่ติ๊ก → เทา
                }`}
                onClick={() => toggle(section.id)} // กดที่แถวเพื่อ toggle
              >
                {/* ซ้าย: checkbox + label */}
                <div className="flex items-center gap-3">

                  {/* Checkbox — เปลี่ยนสีตาม isChecked */}
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors duration-400 ${
                      isChecked
                        ? "bg-green-500 border-green-500"  // ติ๊ก → เขียว
                        : "bg-white border-gray-400"        // ไม่ติ๊ก → ขาว
                    }`}
                  >
                    {/* checkmark — แสดงเฉพาะตอนติ๊ก */}
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* ชื่อ section */}
                  <div>
                    <p className={`font-medium ${isChecked ? "text-green-700" : "text-gray-500"}`}>
                      {section.label}
                    </p>
                    <p className="text-xs text-gray-400">if condition applied to</p>
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
                      onChange={(val) => handleInput(section.id, field, val)}
                      wordBank={AftersectionFieldWords[section.id]?.[field] ?? []}
                      placeholder={`กรอก ${field}`}
                      className="flex-1 border border-gray-300 text-gray-500 w-full rounded-lg px-3 text-sm focus:outline-none focus:border-green-400 resize-none"
                    />
                    </div>
                  ))}
                </div>
              )}

            </div>
          )
        })}

        
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
          <label className='text-sm text-gray-500'>Frequency</label>
          <select
          className='border border-gray-300 rounded-lg text-sm text-gray-500 px-3 py-1.5 focus:outline-none focus:border-blue-400'
          value={afterfrequence}
          onChange={(e) => setAfterFrequence(e.target.value)}
          >
            <option value="">--Select--</option>
            {frequencyOptions.map((item) => 
            <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
      </div>

        <div className="flex gap-6 mt-10 ml-4 w-full pr-4">
        {vitalSigns.map((item) => (
          <div key={item.key} className="flex flex-col gap-1">

            <label className="text-sm text-gray-500">{item.label}</label>

            <div className="flex items-center gap-2">
              <input
                className="w-20 border border-gray-300 text-gray-500 w-full ml-6 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                value={aftervitalData[item.key as keyof typeof aftervitalData]}
                onChange={(e) => setAftervitalData({ ...aftervitalData, [item.key]: e.target.value })}
              />
              <span className="text-sm text-gray-400">{item.unit}</span>
            </div>

          </div>
        ))}
      </div>


      <div className='flex items-center w-full gap-4 mt-10'>
        <div className='flex flex-col gap-1 ml-4 flex-1'>
          <label className='text-sm text-gray-500'>Duration</label>
          <input 
          className='border border-gray-300 text-sm text-gray-500 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400'
          value={afterduration}
          onChange={(e) => setAfterDuration(e.target.value)}/>
        </div>
        {/* Location of Pain */}
    <div className='flex flex-col flex-1 ml-18 gap-1'>
      <label className='text-sm text-gray-500 '>Location of Pain</label>
      <input
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-500 focus:outline-none focus:border-blue-400"

        value={afterlocationpain}
        onChange={(e) => setAfterLocationPain(e.target.value)}
      />
    </div>
    <div className='flex flex-col ml-12 flex-1 gap-1'>
    <label className='text-sm text-gray-500'>Pain Assesment tool</label>
      <select
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-500"
        value={afterpainAssesmentTool}
        onChange={(e) => setAfterPainAssesmentTool(e.target.value)}
      >
        <option value="">-- Select --</option>
        {painAssesment.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select></div>

      <div className='flex flex-col gap-1 ml-4 flex-1'>
      <label className='text-sm text-gray-500'>Characteristic</label>
      <select
      className='border border-gray-300 rounded-lg text-sm text-gray-500 px-3 py-1.5'
      value={aftercharacter}
      onChange={(e)=> setAfterCharacter(e.target.value)}>
        <option value="">--- Select ---</option>
        {cha.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
      {characteristic === "Other" &&
        <input
        className="border border-gray-300 rounded-lg text-sm text-gray-500 py-1.5 focus: outline-none focus:border-blue-400"
        value={afterothercharacter}
        onChange={(e) => setAfterOtherCharacter(e.target.value)}
        ></input>}
    </div>
    </div>
          </div>
          
          <div className="flex gap-6 py-4 justify-between">
            <p className="text-sm ml-4 text-gray-500 mt-10 mr-4">Fall risk</p>
            {[
              { value: "standard", label: "Standard fall (No ABCS)" },
              { value: "strict",   label: "Strict fall (A,B,C)" },
              { value: "highly",   label: "Highly Strict fall (S)" },
            ].map((option) => (
              <label key={option.value} className="flex mt-10 justify-between gap-2 pr-4 pointer-events-none">
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
            <div className='flex gap-4'>
            <div className="flex flex-col mt-10 ml-4 mr-4">
              <label className='text-gray-500 text-lg'>คำแนะนำที่ได้รับ</label>
              <select
              className='border border-gray-300 rounded-lg py-1.5 mt-2 text-gray-500 text-base hover:boder-blue-500'
              value={suggest}
              onChange={(e) => setSuggest(e.target.value)}>
                <option value="">---Select---</option>
                {suggestOption.map((item)=>(
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col mt-10 ml-4 mr-4">
              <label className='text-gray-500 text-base'>Discharge Status</label>
              <select
              className='border border-gray-300 rounded-lg py-1.5 w-80 mt-3 text-gray-500 text-base hover:boder-blue-500'
              value={discharge}
              onChange={(e) => setDischarge(e.target.value)}>
                <option value="">---Select---</option>
                {status.map((item)=>(
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {discharge === "อื่น ๆ" &&
              <input
              className="border mt-2 border-gray-300 rounded-lg text-sm text-gray-500 py-1.5 focus: outline-none focus:border-blue-400"
              value={otherDischarge}
              onChange={(e) => setOtherDischarge(e.target.value)}
              ></input>}
            </div>
            <div className='flex flex-col mt-10'>
              <label className='text-gray-500 text-base ml-5'>PhysioTherapist</label>
              <input
              className='border border-lg rounded-lg text-gray-500 w-80 mt-2 ml-5 text-sm py-1.5 border-gray-300 focus:outline-none focus:border-blue-500'
              value={therapist}
              onChange={(e) => setTherapist(e.target.value)}></input>
              
            </div>
            </div>

            <div className='flex w-full mt-10 ml-4'>
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

            <div className='flex justify-end'>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg mt-4 cursor-pointer hover:bg-blue-700" 
              onClick={handleSaveAfter}>
              บันทึก After        
              </button>
            </div>

              
            </div>
            
          )}
          
          </div>

    </div>

    )
}