"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────
type StatCardProps = {
  label: string
  value: string | number
  unit: string
  icon: string
  accent: string
  bg: string
}

type AppointmentProps = {
  time: string
  name: string
  specialty: string
  accent: string
}

// ─── Mini bar chart data ──────────────────────────────────────────────────────
const weeklyData = [
  { day: "Mon", value: 110 },
  { day: "Tue", value: 190 },
  { day: "Wed", value: 145 },
  { day: "Thu", value: 70 },
  { day: "Fri", value: 60 },
  { day: "Sat", value: 100 },
  { day: "Sun", value: 130 },
]
const maxVal = Math.max(...weeklyData.map((d) => d.value))

// Donut chart data
const specialtyData = [
  { label: "Ortho", value: 42, color: "#3b82f6" },
  { label: "Neurology", value: 28, color: "#10b981" },
  { label: "Cardio", value: 18, color: "#f59e0b" },
  { label: "Other", value: 12, color: "#e879f9" },
]
function buildDonut(data: typeof specialtyData, r = 42, cx = 56, cy = 56) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let angle = -Math.PI / 2
  return data.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI
    const x1 = cx + r * Math.cos(angle)
    const y1 = cy + r * Math.sin(angle)
    angle += sweep
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z` }
  })
}
const donutSlices = buildDonut(specialtyData)

// Top insurance data
const insuranceData = [
  { name: "AIA", value: 5 },
  { name: "Health Happy", value: 4 },
  { name: "D Health Plus", value: 3 },
  { name: "Rabbit", value: 2 },
  { name: "FWD", value: 1 },
]

// Patient type data
const patientTypeData = [
  { name: "Thai", value: 3 },
  { name: "Flight-in", value: 2 },
  { name: "Long-stay", value: 1.5 },
]

// Calendar helpers
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"]

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, unit, icon, accent, bg }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${bg} border border-white/60 shadow-sm`}>
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${accent}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800 leading-none">
        {typeof value === "number" ? value.toLocaleString() : value}
        <span className="text-xs font-normal text-slate-400 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  )
}

function AppointmentItem({ time, name, specialty, accent }: AppointmentProps) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-white border-l-4 shadow-xs ${accent}`}>
      <span className="text-xs font-semibold text-slate-400 w-10 shrink-0">{time}</span>
      <span className="text-sm text-slate-700 flex-1 truncate">{name}</span>
      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full shrink-0">{specialty}</span>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const now = new Date()
  const [calYear, setCalYear]   = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState(now.getDate())
  const [hn, setHn]     = useState("")
  const [year, setYear] = useState("")

  const today = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay    = getFirstDay(calYear, calMonth)

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  const stats = [
    { label: "Total Patient",    value: 1000, unit: "persons", icon: "🧑‍⚕️", accent: "bg-blue-100 text-blue-600",   bg: "bg-blue-50"   },
    { label: "Today's Session",  value: 47,   unit: "sessions",icon: "📋",   accent: "bg-emerald-100 text-emerald-600", bg: "bg-emerald-50" },
    { label: "New This Month",   value: 111,  unit: "persons", icon: "✨",   accent: "bg-amber-100 text-amber-600",  bg: "bg-amber-50"  },
  ]

  const appointments = [
    { time: "08:30", name: "Nattaporn K.",  specialty: "Ortho",  accent: "border-blue-400"    },
    { time: "09:15", name: "Somjai W.",     specialty: "Neuro",  accent: "border-emerald-400" },
    { time: "10:00", name: "Pranee M.",     specialty: "Cardio", accent: "border-amber-400"   },
    { time: "11:30", name: "Wanchai P.",    specialty: "Ortho",  accent: "border-blue-400"    },
    { time: "13:00", name: "Malee S.",      specialty: "Neuro",  accent: "border-rose-400"    },
  ]

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-slate-200 px-8 py-3 flex items-center sticky top-0 z-10 shadow-xs">
        <Image src="/Hospital logo.svg" alt="Hospital Logo" width={110} height={48} />
        <a href='/' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
          Home
        </a>
        <a href='/patient' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
          Patient Form
        </a>
        <div className="flex items-center justify-end gap-3">          
          <p className="absolute top-6 right-0 w-16 curdor-pointer">
          <Image src="/logout.png" alt="Logout" width={20} height={48} className="cursor-pointer hover:opacity-75" onClick={() => router.push("/login")} />
        </p>
        </div>
      </nav>

      {/* ── Hero bar ── */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xl font-bold text-slate-800">Rehabilitation Dashboard</p>
            <p className="text-xs text-slate-400">Bangkok Hospital Siriroj · Physiotherapy</p>
          </div>
          <span className="text-3xl">🏃</span>
        </div>
        {/* HN / Year search */}
        <div className="flex gap-2">
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-slate-400 font-medium">HN</label>
            <input
              value={hn}
              onChange={e => setHn(e.target.value)}
              placeholder="e.g. 123456"
              className="w-36 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-xs text-slate-400 font-medium">Year</label>
            <input
              value={year}
              onChange={e => setYear(e.target.value)}
              placeholder="e.g. 2026"
              className="w-28 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex items-end">
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      <main className="p-6 flex flex-col gap-5">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* ── Row 2: Weekly chart + Donut + Calendar ── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Weekly bar chart */}
          <div className="col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-4">Weekly Patient Sessions</p>
            <div className="flex items-end gap-2 h-40">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all hover:bg-blue-600"
                    style={{ height: `${(d.value / maxVal) * 100}%` }}
                  />
                  <span className="text-xs text-slate-400">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Donut — By specialty */}
          <div className="col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-4">By Specialty</p>
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 112 112" className="w-28 h-28 shrink-0">
                {donutSlices.map((s) => (
                  <path key={s.label} d={s.path} fill={s.color} opacity={0.85} />
                ))}
                <circle cx="56" cy="56" r="26" fill="white" />
              </svg>
              <div className="flex flex-col gap-2">
                {specialtyData.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-slate-600">{s.label}</span>
                    <span className="text-xs text-slate-400 ml-auto">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="text-slate-400 hover:text-slate-700 px-1">‹</button>
              <p className="text-sm font-semibold text-slate-700">{MONTHS[calMonth]} {calYear}</p>
              <button onClick={nextMonth} className="text-slate-400 hover:text-slate-700 px-1">›</button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {DAYS.map(d => (
                <div key={d} className="text-xs text-slate-400 py-1">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`text-xs py-1 rounded-full transition-colors ${
                    day === selectedDay
                      ? "bg-blue-500 text-white font-bold"
                      : day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear()
                        ? "ring-1 ring-blue-400 text-blue-600"
                        : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Top insurance + Patient type + Appointments ── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Top 5 insurance */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-4">Top 5 ประกัน</p>
            <div className="flex flex-col gap-3">
              {insuranceData.map((ins) => (
                <div key={ins.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{ins.name}</span><span>{ins.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-rose-400 h-2 rounded-full transition-all"
                      style={{ width: `${(ins.value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient type */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-4">ประเภทคนไข้</p>
            <div className="flex flex-col gap-3">
              {patientTypeData.map((pt) => (
                <div key={pt.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{pt.name}</span><span>{pt.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-violet-400 h-2 rounded-full transition-all"
                      style={{ width: `${(pt.value / 3) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-3">Today's Appointments</p>
            <div className="flex flex-col gap-2">
              {appointments.map(apt => (
                <AppointmentItem key={apt.time} {...apt} />
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}