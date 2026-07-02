"use client";
// app/dashboard/page.tsx — light pastel theme

import { useEffect, useState, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RefreshCw } from "lucide-react";
import jobIcon from "@/public/job.png";
import patientIcon from "@/public/patient.png";
import newPatientIcon from "@/public/newpatient.png";
import painIcon from "@/public/pain.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardData {
  period: string;
  dateRange: { from: string; to: string };
  jobs: number;
  jobsDelta: number;
  jobsDeltaPct: number;
  patients: number;
  newPatients: number;
  avgPain: number;
  trend: { labels: string[]; current: number[]; previous: number[] };
  daily: { labels: string[]; values: number[] };
  categories: { name: string; count: number; color: string }[];
  formTypes: { name: string; count: number }[];
  therapists: { name: string; count: number }[];
  opdIpdTrend: { labels: string[]; opd: number[]; ipd: number[] };
  patientTypes: { label: string; count: number; color: string }[];
  topDiagnoses: { name: string; count: number }[];
  patientTypeHasSyncData: boolean;
}

type Period = "week" | "month" | "year";
interface CustomRange {
  from: string; // YYYY-MM-DD
  to: string;
}

const FORM_COLORS = [
  "#2a78d6",
  "#1baf7a",
  "#eda100",
  "#4a3aa7",
  "#e34948",
  "#e87ba4",
  "#eb6834",
  "#888780",
];
const GRID = "#e1e0d9";
const MUTED = "#898781";

// ─── Stat card colors ─────────────────────────────────────────────────────────
const STAT_CARDS = [
  { bg: "#d4f0f7", iconColor: "#d4f0f7", icon: "jobIcon" },
  { bg: "#eae9fa", iconColor: "#eae9fa", icon: "patientIcon" },
  { bg: "#e4f9f2", iconColor: "#854f0b", icon: "newPatientIcon" },
  { bg: "#f4e2fb", iconColor: "#993556", icon: "painIcon" },
];

const AVATAR_COLORS = [
  { bg: "#e6f1fb", fg: "#185fa5" },
  { bg: "#e1f5ee", fg: "#0f6e56" },
  { bg: "#faeeda", fg: "#854f0b" },
  { bg: "#fbeaf0", fg: "#993556" },
  { bg: "#eeedfe", fg: "#3c3489" },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #e1e0d9",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      }}
    >
      <p style={{ fontWeight: 500, marginBottom: 4, color: "#0b0b0b" }}>
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, margin: 0 }}>
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
}

// ─── Period tabs ──────────────────────────────────────────────────────────────
function PeriodTabs({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 3,
        background: "#f1efe8",
        borderRadius: 10,
        padding: 3,
      }}
    >
      {(["week", "month", "year"] as Period[]).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            fontSize: 12,
            padding: "5px 14px",
            border: "none",
            borderRadius: 7,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .15s",
            textTransform: "capitalize",
            background: value === p ? "#fff" : "transparent",
            color: value === p ? "#0b0b0b" : "#898781",
            fontWeight: value === p ? 500 : 400,
            boxShadow: value === p ? "0 1px 3px rgba(0,0,0,.08)" : "none",
          }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({
  title,
  badge,
  children,
  style,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "1.1rem 1.25rem",
        border: "0.5px solid #e1e0d9",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.9rem",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#52514e",
            textTransform: "uppercase" as const,
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </span>
        {badge}
      </div>
      {children}
    </div>
  );
}

// ─── HIS pending badge ────────────────────────────────────────────────────────
function HisBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 20,
        background: "#faeeda",
        color: "#854f0b",
        border: "0.5px solid #fac775",
      }}
    >
      <i className="ti ti-clock" style={{ fontSize: 10 }} aria-hidden="true" />{" "}
      HIS sync
    </span>
  );
}

// ─── Calendar icon button + date range popover ───────────────────────────────
function DateRangePicker({
  active,
  range,
  onApply,
  onClear,
}: {
  active: boolean;
  range: CustomRange | null;
  onApply: (r: CustomRange) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(range?.from ?? "");
  const [to, setTo] = useState(range?.to ?? "");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFrom(range?.from ?? "");
    setTo(range?.to ?? "");
  }, [range]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="เลือกช่วงวันที่ย้อนหลัง"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 8,
          border: active ? "0.5px solid #2a78d6" : "0.5px solid #e1e0d9",
          background: active ? "#e6f1fb" : "#fff",
          cursor: "pointer",
        }}
      >
        <span
          role="img"
          aria-label="calendar"
          style={{ fontSize: 15, lineHeight: 1 }}
        >
          📅
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 40,
            background: "#fff",
            border: "0.5px solid #e1e0d9",
            borderRadius: 12,
            boxShadow: "0 6px 20px rgba(0,0,0,.12)",
            padding: "14px",
            width: 260,
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#0b0b0b",
              marginBottom: 10,
            }}
          >
            ดูย้อนหลังตามช่วงวันที่
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 11, color: "#898781" }}>
              จากวันที่
              <input
                type="date"
                value={from}
                max={todayStr}
                onChange={(e) => setFrom(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 4,
                  padding: "6px 8px",
                  fontSize: 12,
                  borderRadius: 7,
                  border: "0.5px solid #e1e0d9",
                }}
              />
            </label>
            <label style={{ fontSize: 11, color: "#898781" }}>
              ถึงวันที่
              <input
                type="date"
                value={to}
                max={todayStr}
                onChange={(e) => setTo(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 4,
                  padding: "6px 8px",
                  fontSize: 12,
                  borderRadius: 7,
                  border: "0.5px solid #e1e0d9",
                }}
              />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              style={{
                flex: 1,
                fontSize: 12,
                padding: "7px 0",
                borderRadius: 8,
                border: "0.5px solid #e1e0d9",
                background: "#fff",
                color: "#52514e",
                cursor: "pointer",
              }}
            >
              ล้างค่า
            </button>
            <button
              disabled={!from || !to}
              onClick={() => {
                if (!from || !to) return;
                onApply({ from, to });
                setOpen(false);
              }}
              style={{
                flex: 1,
                fontSize: 12,
                padding: "7px 0",
                borderRadius: 8,
                border: "none",
                background: !from || !to ? "#a9c9ef" : "#2a78d6",
                color: "#fff",
                cursor: !from || !to ? "not-allowed" : "pointer",
              }}
            >
              ดูช่วงนี้
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HN search box ────────────────────────────────────────────────────────────
function HnSearchBox({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ค้นหา HN..."
        style={{
          width: 150,
          fontSize: 12,
          color: "#0b0b0b",
          padding: "6px 28px 6px 10px",
          borderRadius: 8,
          border: value ? "0.5px solid #2a78d6" : "0.5px solid #e1e0d9",
          outline: "none",
        }}
      />
      {value ? (
        <button
          onClick={onClear}
          title="ล้างการค้นหา"
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#898781",
            fontSize: 12,
            lineHeight: 1,
          }}
        >
          <i className="ti ti-x" />
        </button>
      ) : (
        <i
          className="ti ti-search"
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#898781",
            fontSize: 12,
          }}
        />
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [customRange, setCustomRange] = useState<CustomRange | null>(null);
  const [hnInput, setHnInput] = useState("");
  const [hnFilter, setHnFilter] = useState("");
  const hnDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (p: Period, range: CustomRange | null, hn: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (range) {
          params.set("from", range.from);
          params.set("to", range.to);
        } else {
          params.set("period", p);
        }
        if (hn.trim()) params.set("hn", hn.trim());
        const res = await fetch(
          `${window.location.origin}/api/dashboard?${params.toString()}`,
        );
        if (!res.ok) throw new Error(await res.text());
        setData(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchData(period, customRange, hnFilter);
  }, [period, customRange, hnFilter, fetchData]);

  // debounce การพิมพ์ค้นหา HN — รอ 500ms ก่อนยิง fetch จริง
  const handleHnChange = (val: string) => {
    setHnInput(val);
    if (hnDebounceRef.current) clearTimeout(hnDebounceRef.current);
    hnDebounceRef.current = setTimeout(() => {
      setHnFilter(val.trim());
    }, 500);
  };

  const clearHn = () => {
    if (hnDebounceRef.current) clearTimeout(hnDebounceRef.current);
    setHnInput("");
    setHnFilter("");
  };

  // เลือก period ปกติ → ยกเลิก custom date range โดยอัตโนมัติ
  const handlePeriodChange = (p: Period) => {
    setCustomRange(null);
    setPeriod(p);
  };

  const trendData =
    data?.trend.labels.map((label, i) => ({
      label,
      current: data.trend.current[i] ?? 0,
      previous: data.trend.previous[i] ?? 0,
    })) ?? [];

  const dailyData =
    data?.daily.labels.map((label, i) => ({
      label,
      value: data.daily.values[i] ?? 0,
    })) ?? [];

  const opdIpdData =
    data?.opdIpdTrend.labels.map((label, i) => ({
      label,
      OPD: data.opdIpdTrend.opd[i] ?? 0,
      IPD: data.opdIpdTrend.ipd[i] ?? 0,
    })) ?? [];

  const totalTypes = data?.patientTypes.reduce((s, t) => s + t.count, 0) ?? 0;
  const totalCats = data?.categories.reduce((s, c) => s + c.count, 0) ?? 0;
  const maxForm = Math.max(...(data?.formTypes.map((f) => f.count) ?? [1]));
  const router = useRouter();

  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const periodLabel = customRange ? "selected range" : `this ${period}`;
  const statCards = [
    {
      label: `Total jobs · ${periodLabel}`,
      value: data?.jobs.toLocaleString() ?? "–",
      icon: jobIcon,
      delta: data
        ? `${data.jobsDelta >= 0 ? "+" : ""}${data.jobsDelta} (${data.jobsDelta >= 0 ? "+" : ""}${data.jobsDeltaPct.toFixed(1)}%) vs ${customRange ? "same range last year" : `last ${period}`}`
        : "",
      deltaUp: (data?.jobsDelta ?? 0) >= 0,
    },
    {
      label: "Unique patients",
      value: data?.patients ?? "–",
      icon: patientIcon,
      sub: "from all saved forms",
    },
    {
      label: "New patients",
      value: data?.newPatients ?? "–",
      icon: newPatientIcon,
      sub: `${data && data.patients > 0 ? Math.round((data.newPatients / data.patients) * 100) : 0}% of total patients`,
    },
    {
      label: "Avg pain score",
      value: data && data.avgPain > 0 ? data.avgPain.toFixed(1) : "–",
      icon: painIcon,
      sub: "from OPD & IPD (0–10)",
    },
  ];

  return (
    <div
      style={{ minHeight: "100vh", background: "#f1f1f1", padding: "1.5rem" }}
    >
      <nav className="bg-white flex justify-start sticky top-0 z-50">
        <div className="flex items-center gap-5 bg-white w-full px-6 py-4 shadow-sm">
          <Image
            src="/Hospital logo.svg"
            alt="Hospital Logo"
            width={100}
            height={50}
          />
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
          <Image
            src="/logout.png"
            alt="logout"
            className="cursor-pointer ml-auto"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            width={20}
            height={50}
          />
        </div>
      </nav>
      <p className="p-4"></p>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 500, color: "#0b0b0b" }}>
              Dashboard
            </h1>
            <p style={{ fontSize: 12, color: "#898781", marginTop: 2 }}>
              Physical Medicine &amp; Rehabilitation · Bangkok Hospital Siriroj
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "#898781" }}>{today}</span>
            <HnSearchBox
              value={hnInput}
              onChange={handleHnChange}
              onClear={clearHn}
            />
            <button
              onClick={() => fetchData(period, customRange, hnFilter)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 8px",
                borderRadius: 8,
                border: "0.5px solid #e1e0d9",
                background: "#fff",
                cursor: "pointer",
              }}
              title="Refresh"
            >
              <RefreshCw
                size={14}
                color="#52514e"
                className={loading ? "animate-spin" : ""}
              />
            </button>
            <DateRangePicker
              active={!!customRange}
              range={customRange}
              onApply={setCustomRange}
              onClear={() => setCustomRange(null)}
            />
            <PeriodTabs value={period} onChange={handlePeriodChange} />
          </div>
        </div>

        {(customRange || hnFilter) && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 12,
              flexWrap: "wrap" as const,
            }}
          >
            {customRange && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "#e6f1fb",
                  color: "#185fa5",
                  border: "0.5px solid #b7d6f5",
                }}
              >
                <span role="img" aria-label="calendar" style={{ fontSize: 11 }}>
                  📅
                </span>
                {new Date(customRange.from).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
                {" – "}
                {new Date(customRange.to).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                <button
                  onClick={() => setCustomRange(null)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#185fa5",
                    fontSize: 12,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  <i className="ti ti-x" />
                </button>
              </span>
            )}
            {hnFilter && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "#e1f5ee",
                  color: "#04110e",
                  border: "0.5px solid #b9e8d8",
                }}
              >
                <i className="ti ti-user-search" style={{ fontSize: 11 }} />
                กำลังกรองเฉพาะ HN: {hnFilter}
                <button
                  onClick={clearHn}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#04110e",
                    fontSize: 12,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  <i className="ti ti-x" />
                </button>
              </span>
            )}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 14px",
              borderRadius: 10,
              background: "#fcebeb",
              border: "0.5px solid #f7c1c1",
              fontSize: 13,
              color: "#a32d2d",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: 110,
                  background: "#fff",
                  borderRadius: 14,
                  border: "0.5px solid #e1e0d9",
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        )}

        {data && !loading && (
          <>
            {/* ── Stat cards ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 10,
                marginBottom: 12,
              }}
            >
              {statCards.map((s, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 14,
                    padding: "1.1rem 1.25rem",
                    background: STAT_CARDS[i].bg,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(255,255,255,.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Image src={s.icon} alt="" width={24} height={24} />
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#52514e",
                      marginBottom: 3,
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 500,
                      color: "#0b0b0b",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  {"delta" in s && s.delta ? (
                    <div
                      style={{
                        fontSize: 12,
                        marginTop: 5,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        color: s.deltaUp ? "#0f6e56" : "#e34948",
                      }}
                    >
                      <i
                        className={`ti ti-trending-${s.deltaUp ? "up" : "down"}`}
                        style={{ fontSize: 13 }}
                      />
                      {s.delta}
                    </div>
                  ) : (
                    <div
                      style={{ fontSize: 12, marginTop: 5, color: "#898781" }}
                    >
                      {(s as any).sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Trend + Patient type ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <Card title="Visit trend">
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    marginBottom: 8,
                    flexWrap: "wrap" as const,
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      color: "#52514e",
                    }}
                  >
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 2,
                        background: "#2a78d6",
                        display: "inline-block",
                      }}
                    />
                    This {period}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      color: "#52514e",
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 0,
                        borderTop: "2px dashed #c3c2b7",
                        display: "inline-block",
                      }}
                    />
                    Last {period}
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GRID}
                      strokeWidth={0.5}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="current"
                      name="This period"
                      stroke="#2a78d6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#2a78d6" }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="previous"
                      name="Last period"
                      stroke="#c3c2b7"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card
                title="Patient type"
                badge={!data.patientTypeHasSyncData ? <HisBadge /> : undefined}
              >
                {data.patientTypeHasSyncData ? (
                  <>
                    {data.patientTypes.map((t) => (
                      <div
                        key={t.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 9,
                          fontSize: 13,
                        }}
                      >
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: t.color,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ flex: 1, color: "#52514e" }}>
                          {t.label}
                        </span>
                        <span style={{ fontWeight: 500, color: "#0b0b0b" }}>
                          {t.count}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#898781",
                            minWidth: 30,
                            textAlign: "right" as const,
                          }}
                        >
                          {totalTypes > 0
                            ? Math.round((t.count / totalTypes) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                    ))}
                    <div
                      style={{
                        display: "flex",
                        height: 7,
                        borderRadius: 4,
                        overflow: "hidden",
                        gap: 1,
                        marginTop: 6,
                      }}
                    >
                      {data.patientTypes.map((t) => (
                        <div
                          key={t.label}
                          style={{
                            height: "100%",
                            background: t.color,
                            width:
                              totalTypes > 0
                                ? `${Math.round((t.count / totalTypes) * 100)}%`
                                : "33%",
                          }}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#898781",
                        marginBottom: 8,
                      }}
                    >
                      Patient type data will appear once HIS sync is active.
                    </p>
                    {["Thai", "Expat", "Fly-in"].map((t, i) => (
                      <div
                        key={t}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 9,
                          fontSize: 13,
                        }}
                      >
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: ["#2a78d6", "#1baf7a", "#eda100"][i],
                            opacity: 0.25,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ flex: 1, color: "#898781" }}>{t}</span>
                        <span style={{ color: "#898781" }}>–</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* ── Category + Form + Therapists ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <Card title="Clinical category">
                {data.categories.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {data.categories.map((c) => (
                      <div
                        key={c.name}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                          }}
                        >
                          <span style={{ color: "#52514e" }}>{c.name}</span>
                          <span style={{ fontWeight: 500, color: "#0b0b0b" }}>
                            {c.count}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            background: "#f1efe8",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              background: c.color,
                              borderRadius: 3,
                              width:
                                totalCats > 0
                                  ? `${Math.round((c.count / totalCats) * 100)}%`
                                  : "0%",
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 10, color: "#898781" }}>
                          {totalCats > 0
                            ? Math.round((c.count / totalCats) * 100)
                            : 0}
                          % of assessed
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: "#898781" }}>
                    No assessment data in this period.
                  </p>
                )}
              </Card>

              <Card title="Form distribution">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {data.formTypes.map((f, i) => (
                    <div
                      key={f.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        fontSize: 12,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 2,
                          background: FORM_COLORS[i % FORM_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ flex: 1, color: "#52514e" }}>
                        {f.name}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          maxWidth: 50,
                          height: 4,
                          background: "#f1efe8",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            background: FORM_COLORS[i % FORM_COLORS.length],
                            opacity: 0.7,
                            borderRadius: 2,
                            width: `${Math.round((f.count / maxForm) * 100)}%`,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontWeight: 500,
                          color: "#0b0b0b",
                          minWidth: 24,
                          textAlign: "right" as const,
                        }}
                      >
                        {f.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Top physiotherapists">
                {data.therapists.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {data.therapists.map((t, i) => {
                      const init = t.name
                        .split(" ")
                        .slice(0, 2)
                        .map((w: string) => w[0] || "")
                        .join("")
                        .toUpperCase();
                      const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                      return (
                        <div
                          key={t.name}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              background: av.bg,
                              color: av.fg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 500,
                              flexShrink: 0,
                            }}
                          >
                            {init}
                          </div>
                          <span
                            style={{
                              flex: 1,
                              fontSize: 12,
                              color: "#52514e",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap" as const,
                            }}
                          >
                            {t.name}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#0b0b0b",
                              flexShrink: 0,
                            }}
                          >
                            {t.count} jobs
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: "#898781" }}>
                    No data available.
                  </p>
                )}
              </Card>
            </div>

            {/* ── Daily + OPD/IPD ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <Card title="Daily activity · Mon–Fri">
                <ResponsiveContainer width="100%" height={148}>
                  <BarChart data={dailyData} barSize={26}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GRID}
                      strokeWidth={0.5}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "rgba(42,120,214,.05)" }}
                    />
                    <Bar
                      dataKey="value"
                      name="Jobs"
                      radius={[4, 4, 0, 0]}
                      fill="#2a78d6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card
                title="OPD vs IPD"
                badge={
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      ["#2a78d6", "OPD"],
                      ["#1baf7a", "IPD"],
                    ].map(([c, l]) => (
                      <span
                        key={l}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11,
                          color: "#52514e",
                        }}
                      >
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: 2,
                            background: c,
                            display: "inline-block",
                          }}
                        />
                        {l}
                      </span>
                    ))}
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height={148}>
                  <BarChart data={opdIpdData} barSize={20}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={GRID}
                      strokeWidth={0.5}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: MUTED }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "rgba(0,0,0,.03)" }}
                    />
                    <Bar
                      dataKey="OPD"
                      stackId="a"
                      fill="#2a78d6"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="IPD"
                      stackId="a"
                      fill="#1baf7a"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* ── Top diagnoses ── */}
            {data.topDiagnoses.length > 0 && (
              <Card
                title="Top diagnoses · from OPD, IPD & cancer forms"
                style={{ marginBottom: 10 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 7,
                  }}
                >
                  {data.topDiagnoses.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 9px",
                        background: "#f1efe8",
                        borderRadius: 8,
                        border: "0.5px solid #e1e0d9",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          width: 18,
                          height: 18,
                          borderRadius: 5,
                          background:
                            FORM_COLORS[i % FORM_COLORS.length] + "18",
                          color: FORM_COLORS[i % FORM_COLORS.length],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#52514e",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap" as const,
                        }}
                        title={d.name}
                      >
                        {d.name}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#898781",
                          flexShrink: 0,
                        }}
                      >
                        {d.count}×
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <p
              style={{
                fontSize: 11,
                color: "#898781",
                textAlign: "center" as const,
                marginTop: "1rem",
              }}
            >
              {new Date(data.dateRange.from).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
              {" – "}
              {new Date(data.dateRange.to).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {" · Only saved forms are counted as jobs · Draft forms excluded"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
