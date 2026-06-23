"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// ─── types ───
interface RecordItem {
  id: string;
  hn: string;
  form_type: string;
  created_at: string;
  [key: string]: any;
}

interface RecordsData {
  ipd: RecordItem[];
  opd: RecordItem[];
  ca: RecordItem[];
  barthel: RecordItem[];
  tug: RecordItem[];
  koos: RecordItem[];
  hip17: RecordItem[];
  mobility: RecordItem[];
  education: RecordItem[];
  discharge: RecordItem[];
}

// ─── config ───
const FORM_CONFIG: Record<
  string,
  { label: string; color: string; badge: string; icon: string }
> = {
  ipd: {
    label: "IPD Form",
    color: "border-blue-400",
    badge: "bg-blue-100 text-blue-700",
    icon: "🏥",
  },
  opd: {
    label: "OPD Form",
    color: "border-purple-400",
    badge: "bg-purple-100 text-purple-700",
    icon: "🩺",
  },
  cancer: {
    label: "Cancer Assessment",
    color: "border-rose-400",
    badge: "bg-rose-100 text-rose-700",
    icon: "🎗️",
  },
  barthel: {
    label: "Barthel Index",
    color: "border-orange-400",
    badge: "bg-orange-100 text-orange-700",
    icon: "📋",
  },
  tug: {
    label: "TUG Assessment",
    color: "border-teal-400",
    badge: "bg-teal-100 text-teal-700",
    icon: "⏱️",
  },
  koos: {
    label: "KOOS",
    color: "border-green-400",
    badge: "bg-green-100 text-green-700",
    icon: "🦵",
  },
  hip17: {
    label: "HIP-17",
    color: "border-yellow-400",
    badge: "bg-yellow-100 text-yellow-700",
    icon: "🦴",
  },
  mobility: {
    label: "Mobility",
    color: "border-sky-400",
    badge: "bg-sky-100 text-sky-700",
    icon: "🚶",
  },
  education: {
    label: "Education Record",
    color: "border-indigo-400",
    badge: "bg-indigo-100 text-indigo-700",
    icon: "📚",
  },
  discharge: {
    label: "Discharge",
    color: "border-gray-400",
    badge: "bg-gray-100 text-gray-600",
    icon: "🚪",
  },
};

function formatDate(d?: string | null) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(d?: string | null) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── render detail helpers ───

// แสดง array เป็น tags
function TagList({ items }: { items: string[] }) {
  const filtered = items.filter(Boolean);
  if (!filtered.length) return <span className="text-gray-400">-</span>;
  return (
    <div className="flex flex-wrap gap-1.5 mt-0.5">
      {filtered.map((item, i) => (
        <span
          key={i}
          className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// แสดง fall_risk_items: { mode, adult/child: { scores }, flags }
function FallRiskDisplay({ value }: { value: any }) {
  const mode = value.mode ?? "";
  const scores = value[mode] ?? {};
  const flags = value.flags ?? {};

  const flagItems = Object.entries(flags)
    .filter(([, v]) => v === true)
    .map(([k]) => k);

  return (
    <div className="space-y-2">
      {mode && (
        <div>
          <span className="text-xs text-gray-400">Mode: </span>
          <span className="text-sm text-gray-700 font-medium">{mode}</span>
        </div>
      )}
      {Object.keys(scores).length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1">คะแนน</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(scores).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-gray-500">
                  {k.replace(/^(adu|ped)_/, "")}
                </span>
                <span className="font-medium text-gray-700">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {flagItems.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1">Flags</p>
          <TagList items={flagItems} />
        </div>
      )}
    </div>
  );
}

// แสดง assessment: { orthopedics: { checked, fields }, cardiopulmonary: ..., neurology: ... }
function AssessmentDisplay({ value }: { value: any }) {
  const sections = Object.entries(value).filter(
    ([, v]: any) => v?.checked === true,
  );
  if (!sections.length) return <span className="text-gray-400">-</span>;
  return (
    <div className="space-y-3">
      {sections.map(([section, data]: any) => {
        const fields = Object.entries(data.fields ?? {}).filter(
          ([, v]) => v && String(v).trim(),
        );
        return (
          <div key={section}>
            <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
              {section}
            </p>
            {fields.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                {fields.map(([k, v]) => (
                  <div key={k} className="text-xs">
                    <span className="text-gray-400">{k}: </span>
                    <span className="text-gray-700">{String(v)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">ไม่มีรายละเอียด</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// แสดง vital_signs: { pr, rr, bp, spo2 }
function VitalSignsDisplay({ value }: { value: any }) {
  const labels: Record<string, string> = {
    pr: "PR",
    rr: "RR",
    bp: "BP",
    spo2: "SpO2",
  };
  const entries = Object.entries(value).filter(
    ([, v]) => v !== "" && v != null,
  );
  if (!entries.length) return <span className="text-gray-400">-</span>;
  return (
    <div className="flex flex-wrap gap-3">
      {entries.map(([k, v]) => (
        <div key={k} className="text-center">
          <p className="text-xs text-gray-400">{labels[k] ?? k}</p>
          <p className="text-sm font-semibold text-gray-700">{String(v)}</p>
        </div>
      ))}
    </div>
  );
}

// แสดง advice_suggestions / estimate / treatment_items ที่เป็น object
function GenericObjectDisplay({ value }: { value: any }) {
  if (Array.isArray(value)) return <TagList items={value.map(String)} />;
  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "object" && v !== null)
        return (v as any).checked === true;
      return v !== "" && v != null;
    });
    if (!entries.length) return <span className="text-gray-400">-</span>;
    return (
      <div className="space-y-1">
        {entries.map(([k, v]) => (
          <div key={k} className="text-xs">
            <span className="text-gray-500">{k}: </span>
            <span className="text-gray-700">
              {typeof v === "object" ? JSON.stringify(v) : String(v)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return <span className="text-gray-700">{String(value)}</span>;
}

// ─── smart field renderer ───
function SmartField({ fieldKey, value }: { fieldKey: string; value: any }) {
  let parsed = value;
  if (
    typeof value === "string" &&
    (value.startsWith("{") || value.startsWith("["))
  ) {
    try {
      parsed = JSON.parse(value);
    } catch {}
  }

  const isComplex = typeof parsed === "object" && parsed !== null;

  if (!isComplex) {
    if (value === null || value === undefined || value === "") return null;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {fieldKey.replace(/_/g, " ")}
        </span>
        <span className="text-gray-700 text-sm break-words">
          {String(value)}
        </span>
      </div>
    );
  }

  // complex — full width
  const isArray = Array.isArray(parsed);
  const isFallRisk = fieldKey === "fall_risk_items";
  const isAssessment = fieldKey === "assesment" || fieldKey === "assessment";
  const isVital = fieldKey === "vital_signs";

  // skip ถ้าว่างเปล่าทั้งหมด
  if (isArray && parsed.length === 0) return null;
  if (!isArray && Object.keys(parsed).length === 0) return null;

  return (
    <div className="sm:col-span-2 flex flex-col gap-1.5">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
        {fieldKey.replace(/_/g, " ")}
      </span>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        {isFallRisk ? (
          <FallRiskDisplay value={parsed} />
        ) : isAssessment ? (
          <AssessmentDisplay value={parsed} />
        ) : isVital ? (
          <VitalSignsDisplay value={parsed} />
        ) : isArray ? (
          <TagList items={parsed.flat().map(String)} />
        ) : (
          <GenericObjectDisplay value={parsed} />
        )}
      </div>
    </div>
  );
}

function renderDetail(record: RecordItem) {
  const skip = new Set(["id", "hn", "form_type", "patient_hn", "updated_at"]);

  // ─── KOOS: แปลง number → label string ──────────────────────────────────────
  const P1_TH = ["ไม่มีอาการ", "ทุกเดือน", "ทุกสัปดาห์", "ทุกวัน", "ตลอดเวลา"];
  const P_TH = ["ไม่มีอาการ", "น้อย", "ปานกลาง", "รุนแรง", "รุนแรงมาก"];
  const A_TH = [
    "ไม่ลำบากเลย",
    "ลำบากเล็กน้อย",
    "ลำบากปานกลาง",
    "ลำบากมาก",
    "ลำบากมากที่สุด",
  ];

  const koosP1Keys = new Set(["p1"]);
  const koosPKeys = new Set(["p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"]);
  const koosAKeys = new Set(["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"]);

  const formatKoosValue = (key: string, value: unknown): unknown => {
    if (record.form_type !== "koos") return value;
    if (typeof value !== "number") return value; // ถ้าเป็น string แล้วก็ผ่านเลย
    if (koosP1Keys.has(key)) return `${P1_TH[value] ?? value} (${value})`;
    if (koosPKeys.has(key)) return `${P_TH[value] ?? value} (${value})`;
    if (koosAKeys.has(key)) return `${A_TH[value] ?? value} (${value})`;
    return value;
  };

  const entries = Object.entries(record)
    .filter(
      ([k, v]) =>
        !skip.has(k) &&
        v !== null &&
        v !== undefined &&
        v !== "" &&
        v !== "[]" &&
        v !== "{}",
    )
    .map(([k, v]) => [k, formatKoosValue(k, v)] as [string, unknown]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm mt-4 pt-4 border-t border-gray-100">
      {entries.map(([key, value]) => (
        <SmartField key={key} fieldKey={key} value={value} />
      ))}
    </div>
  );
}

// ─── RecordCard ───
function RecordCard({ record }: { record: RecordItem }) {
  const [open, setOpen] = useState(false);
  const cfg = FORM_CONFIG[record.form_type] ?? {
    label: record.form_type,
    color: "border-gray-300",
    badge: "bg-gray-100 text-gray-600",
    icon: "📄",
  };

  // summary line แตกต่างตาม form_type
  const summary = (() => {
    switch (record.form_type) {
      case "ipd":
      case "opd":
        return `${record.type === "before" ? "Before" : "After"} · ${record.diagnosis ?? "-"} · Pain ${record.pain_score ?? "-"}`;
      case "cancer":
        return `${record.assessment_mode ?? "-"} · ${formatDate(record.assessed_at)}`;
      case "barthel":
        return `Session ${record.session_number ?? "-"} · Total Score: ${record.total_score ?? "-"}/100`;
      case "tug":
        return `${record.assessment_type ?? "-"} · ${record.safety_classification ?? "-"} · ${record.time_to_complete ? `${record.time_to_complete}s` : "-"}`;
      case "koos":
        return `${record.assessment_type ?? "-"} · Pain: ${record.pain_score ?? "-"} · ADL: ${record.adl_score ?? "-"}`;
      case "hip17":
        return `${record.visit_type ?? "-"} · Pain ${record.pain_percent ?? "-"}% · Activity ${record.act_percent ?? "-"}%`;
      case "mobility":
        return `Admission Score: ${record.admission_score ?? "-"} · ${record.admission_label?.slice(0, 40) ?? "-"}...`;
      case "education":
        return `Topic ${record.topics ?? "-"} · ${record.specify ?? "-"} · ${record.provider ?? "-"}`;
      case "discharge":
        return `${record.cause ?? "-"} · Doctor: ${record.doctor ?? "-"}`;
      default:
        return "";
    }
  })();

  return (
    <div
      className={`bg-white rounded-2xl border-l-4 ${cfg.color} shadow-sm overflow-hidden`}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-xl shrink-0">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}
            >
              {cfg.label}
            </span>
            <span className="text-xs text-gray-400">
              {formatDateTime(record.created_at)}
            </span>
            {record.hn && (
              <span className="text-xs text-gray-300">HN: {record.hn}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{summary}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Detail — toggle */}
      {open && <div className="px-5 pb-5">{renderDetail(record)}</div>}
    </div>
  );
}

// ─── Main Page ───
export default function RecordPage() {
  const [data, setData] = useState<RecordsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRecords = async (hn = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/records${hn ? `?hn=${encodeURIComponent(hn)}` : ""}`,
      );
      if (!res.ok) throw new Error("โหลดไม่ได้");
      setData(await res.json());
    } catch {
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchRecords(val.trim()), 500);
  };

  // รวม records ทั้งหมดเรียงตาม created_at
  const allRecords: RecordItem[] = data
    ? Object.values(data)
        .flat()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
    : [];

  const tabs = [
    { key: "all", label: "ทั้งหมด", count: allRecords.length },
    { key: "ipd", label: "IPD", count: data?.ipd.length ?? 0 },
    { key: "opd", label: "OPD", count: data?.opd.length ?? 0 },
    { key: "cancer", label: "Cancer", count: data?.ca.length ?? 0 },
    { key: "barthel", label: "Barthel", count: data?.barthel.length ?? 0 },
    { key: "tug", label: "TUG", count: data?.tug.length ?? 0 },
    { key: "koos", label: "KOOS", count: data?.koos.length ?? 0 },
    { key: "hip17", label: "HIP-17", count: data?.hip17.length ?? 0 },
    { key: "mobility", label: "Mobility", count: data?.mobility.length ?? 0 },
    {
      key: "education",
      label: "Education",
      count: data?.education.length ?? 0,
    },
    {
      key: "discharge",
      label: "Discharge",
      count: data?.discharge.length ?? 0,
    },
  ];

  const displayed: RecordItem[] = (() => {
    if (!data) return [];
    if (activeTab === "all") return allRecords;
    const map: Record<string, RecordItem[]> = {
      ipd: data.ipd,
      opd: data.opd,
      cancer: data.ca,
      barthel: data.barthel,
      tug: data.tug,
      koos: data.koos,
      hip17: data.hip17,
      mobility: data.mobility,
      education: data.education,
      discharge: data.discharge,
    };
    return (map[activeTab] ?? []).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  })();

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Loading bar */}
      <style>{`
        @keyframes loadingBar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
      {loading && (
        <div className="fixed top-0 left-0 w-full z-50 h-1 bg-blue-100 overflow-hidden">
          <div
            className="h-full w-1/3 bg-blue-500 rounded-full"
            style={{ animation: "loadingBar 1.2s ease-in-out infinite" }}
          />
        </div>
      )}

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
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-800">บันทึกทั้งหมด</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหา HN..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 pr-10 text-sm text-gray-600 w-60 focus:outline-none focus:border-blue-400"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === t.key
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {t.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600 flex justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchRecords(search)}
              className="underline text-xs"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* Records */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 animate-pulse flex gap-3"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-sm">
              ไม่พบบันทึก{search ? ` สำหรับ HN: ${search}` : ""}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-10">
            {displayed.map((r) => (
              <RecordCard key={`${r.form_type}-${r.id}`} record={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
