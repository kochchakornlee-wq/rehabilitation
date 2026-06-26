"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useParams, useSearchParams } from "next/navigation";
import { useActiveHN } from "@/lib/useActiveHN";

// ======================================
// Topic code -> Specify needs mapping
// ======================================

type PatientCardProps = {
  name: string;
  HN: string;
  birth: string;
  admit: string;
  gender: string;
  allergies: string;
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
  "11": "Safety/Enviroment",
  "12": "Informed Consent",
  "13": "Fall",
  "14": "Follow up",
  "15": "Hand Hygiene",
  "16": "Isolation Precaution",
  "17": "Financial/Insurance",
  "18": "Wound care",
  "19": "Hygiene",
  "20": "Healt Promotion",
  "21": "Emergency management",
  "22": "",
};

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
];

// ======================================
// Autocomplete input สำหรับ provider
// ======================================
function AutocompleteInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const filtered = providerList.filter((p) =>
    p.toLowerCase().includes(value.toLowerCase()),
  );
  return (
    <div className="relative w-full">
      <input
        className="w-full text-xs text-gray-600 focus:outline-none bg-transparent"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShow(true);
        }}
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
              onMouseDown={() => {
                onChange(item);
                setShow(false);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================================
// Readiness color mapping
// ======================================
const readinessColor: Record<string, string> = {
  Willing: "bg-green-100 text-green-600 font-bold",
  Refuse: "bg-red-100 text-red-800 font-bold",
  Unwilling: "bg-yellow-100 text-yellow-800 font-bold",
};

// ======================================
// Column definitions
// ======================================
const columns = [
  { key: "datetime", label: "Date/Time", type: "datetime" },
  { key: "topics", label: "Topics code needs", type: "text" },
  { key: "specify", label: "Specify needs", type: "text" },
  {
    key: "education",
    label: "Education given to",
    type: "dropdown",
    options: [
      "Patient",
      "Spouse",
      "Mother",
      "Father",
      "Daugther",
      "Son",
      "Caregiver",
      "Other",
    ],
  },
  {
    key: "readiness",
    label: "Readiness",
    type: "readiness",
    options: ["Willing", "Refuse", "Unwilling"],
  },
  {
    key: "barriers",
    label: "Barriers",
    type: "barriers",
    options: [
      "None",
      "Language",
      "Culture",
      "Religious",
      "Emotional",
      "Physical",
      "Phychological",
      "Cognitive",
      "Reading",
      "Hearing",
      "Vision",
      "Speaking",
      "Educational Level",
      "Motivation",
      "Others",
    ],
  },
  {
    key: "methods",
    label: "Method/s used",
    type: "dropdown",
    options: ["Audio", "Video", "Printed", "Oral", "Group"],
  },
  {
    key: "evaluation",
    label: "Evaluation",
    type: "dropdown",
    options: [
      "Petient is not receptive to teaching",
      "Verbalized basic concepts with assistance",
      "Verbalized understanding",
      "Return demonstration poor",
      "Return demonstration Good",
    ],
  },
  {
    key: "provider",
    label: "Education Provider (Name/Position)",
    type: "text",
  },
];

type Row = Record<string, string> & { _id?: string };

const emptyRow = (): Row =>
  Object.fromEntries(columns.map((col) => [col.key, ""]));

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
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl ${type === "success" ? "bg-green-100" : "bg-red-100"}`}
        >
          {type === "success" ? "✅" : "❌"}
        </div>
        <p className="font-medium text-base text-gray-900 mb-1">
          {type === "success" ? "สำเร็จ" : "เกิดข้อผิดพลาด"}
        </p>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <a
          href="/patient"
          className={`block w-full py-2.5 rounded-xl text-sm font-medium ${type === "success" ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
        >
          Back to home
        </a>
      </div>
    </div>
  );
}

export default function EducationTable() {
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

  const updateCell = (rowIndex: number, key: string, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;
        const updated = { ...row, [key]: value };
        // Auto-fill "specify" when "topics" changes
        if (key === "topics") {
          updated.specify = topicCodeMap[value.trim()] ?? row.specify;
        }
        return updated;
      }),
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
  };

  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!patientHN) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);

    autoSaveRef.current = setTimeout(async () => {
      const filled = rows.filter((r) =>
        Object.entries(r).some(([k, v]) => k !== "id" && String(v).trim()),
      );
      if (!filled.length) return;

      setAutoSaveStatus("saving");
      try {
        for (const row of filled) {
          const { id, ...fields } = row as any;
          if (id) {
            await fetch(`/api/education?id=${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ hn: patientHN, ...fields }),
            });
          } else {
            await fetch("/api/education", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify([{ hn: patientHN, ...fields }]),
            });
          }
        }
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 3000);
      } catch {
        setAutoSaveStatus("idle");
      }
    }, 10000);

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [rows, patientHN]);

  // ── โหลดข้อมูลเก่าตาม HN ──
  // ── ประกาศ fetchRecords นอก useEffect ──
  const fetchRecords = async () => {
    setLoading(true);
    const res = await fetch(`/api/education?hn=${patientHN}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setRows(data.map(({ created_at, ...rest }: any) => rest as Row));
      }
    }
    setLoading(false);
  };

  // ── useEffect แค่เรียกใช้ ──
  useEffect(() => {
    if (!patientHN) return;
    fetchRecords();
  }, [patientHN]);

  const saveAll = async () => {
    setSaving(true);

    const filled = rows.filter((row) =>
      Object.entries(row)
        .filter(([k]) => k !== "_id" && k !== "hn" && k !== "id")
        .some(([, v]) => v !== ""),
    );

    if (filled.length === 0) {
      setSaving(false);
      showToast("ไม่มีข้อมูลที่จะบันทึก", "error");
      return;
    }

    try {
      for (const row of filled) {
        const { id, ...fields } = row as any;

        if (id) {
          // แถวที่โหลดมาจาก DB → UPDATE
          await fetch(`/api/education?id=${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hn: patientHN, ...fields }),
          });
        } else {
          // แถวใหม่ที่ user เพิ่ม → INSERT
          await fetch("/api/education", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ hn: patientHN, ...fields }]),
          });
        }
      }

      setSaving(false);
      showToast("บันทึกสำเร็จ! 🎉");
      await fetchRecords();
    } catch (err) {
      setSaving(false);
      showToast("เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
    }
  };

  return (
    <div className="overflow-x-auto min-h-screen bg-gray-100 font-sans">
      <StatusModal
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
      {/* Header / Logo */}
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
      <p className="p-2"></p>

      {/* Patient Info Card */}
      <div className="bg-white rounded-2xl mx-auto w-300 p-4 shadow-md border-t-4 border-blue-500">
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
                  <td
                    key={col.key}
                    className="border-b border-gray-200 p-1 h-12"
                  >
                    {/* ── DateTime picker ── */}
                    {col.type === "datetime" && (
                      <div className="flex flex-col gap-0.5">
                        <input
                          type="date"
                          className="w-full font-bold text-blue-800 focus:outline-none bg-transparent cursor-pointer"
                          value={row[col.key]?.split("T")[0] ?? ""}
                          onChange={(e) => {
                            const time = row[col.key]?.split("T")[1] ?? "00:00";
                            updateCell(
                              rowIndex,
                              col.key,
                              `${e.target.value}T${time}`,
                            );
                          }}
                        />
                        <input
                          type="time"
                          className="w-full text-xs text-gray-300 focus:outline-none bg-transparent cursor-pointer"
                          value={row[col.key]?.split("T")[1] ?? ""}
                          onChange={(e) => {
                            const date = row[col.key]?.split("T")[0] ?? "";
                            updateCell(
                              rowIndex,
                              col.key,
                              `${date}T${e.target.value}`,
                            );
                          }}
                        />
                      </div>
                    )}

                    {/* ── Readiness dropdown with color ── */}
                    {col.type === "readiness" && (
                      <select
                        className={`w-full text-xs focus:outline-none rounded px-1 py-0.5 ${
                          readinessColor[row[col.key]] ??
                          "bg-transparent text-gray-600"
                        }`}
                        value={row[col.key]}
                        onChange={(e) =>
                          updateCell(rowIndex, col.key, e.target.value)
                        }
                      >
                        <option value=""></option>
                        {col.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* ── Barriers multi + Other ── */}
                    {col.type === "barriers" && (
                      <div className="flex flex-col gap-0.5">
                        {/* แสดงที่เลือกแล้ว + คั่นด้วย comma */}
                        {/* <div className="text-xs text-gray-600 whitespace-pre-wrap min-h-[16px]">
                          {row[col.key]
                            ? row[col.key].split(",").map(v => v.trim()).filter(Boolean).join("\n")
                            : ""}
                        </div> */}

                        {/* dropdown เลือก */}
                        <select
                          className="w-full text-xs text-gray-400 focus:outline-none bg-transparent"
                          value=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            const current = row[col.key]
                              ? row[col.key]
                                  .split(",")
                                  .map((v) => v.trim())
                                  .filter(Boolean)
                              : [];
                            if (!current.includes(val)) {
                              updateCell(
                                rowIndex,
                                col.key,
                                [...current, val].join(","),
                              );
                            }
                          }}
                        >
                          <option value=""></option>
                          {col.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>

                        {/* ถ้ามี Others → พิมพ์เองได้ */}
                        {row[col.key]
                          ?.split(",")
                          .map((v) => v.trim())
                          .includes("Others") && (
                          <input
                            className="w-full text-xs text-gray-600 border-b border-gray-300 focus:outline-none bg-transparent"
                            placeholder="ระบุ..."
                            value={row[`${col.key}_other`] ?? ""}
                            onChange={(e) =>
                              updateCell(
                                rowIndex,
                                `${col.key}_other`,
                                e.target.value,
                              )
                            }
                          />
                        )}

                        {/* ลบรายการที่เลือกได้ */}
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {row[col.key]
                            ?.split(",")
                            .map((v) => v.trim())
                            .filter(Boolean)
                            .map((item) => (
                              <span
                                key={item}
                                className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded cursor-pointer hover:bg-red-50 hover:text-red-400"
                                onClick={() => {
                                  const next = row[col.key]
                                    .split(",")
                                    .map((v) => v.trim())
                                    .filter((v) => v !== item);
                                  updateCell(rowIndex, col.key, next.join(","));
                                }}
                              >
                                {item} ✕
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* ── Regular dropdown ── */}
                    {col.type === "dropdown" && (
                      <select
                        className="w-full text-xs text-gray-600 focus:outline-none bg-transparent"
                        value={row[col.key]}
                        onChange={(e) =>
                          updateCell(rowIndex, col.key, e.target.value)
                        }
                      >
                        <option value=""></option>
                        {col.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* ── Text input (topics / specify / provider) ── */}
                    {col.type === "text" && col.key === "topics" && (
                      <textarea
                        className="w-full text-xs text-gray-600 focus:outline-none bg-transparent resize-none"
                        rows={Math.max(
                          1,
                          (row[col.key] || "").split(",").length,
                        )}
                        value={row[col.key]}
                        onChange={(e) =>
                          updateCell(rowIndex, col.key, e.target.value)
                        }
                        placeholder="e.g. 1, 2 …"
                      />
                    )}

                    {col.type === "text" && col.key === "specify" && (
                      <div className="text-xs text-gray-600 whitespace-pre-wrap">
                        {row["topics"]
                          ? row["topics"]
                              .split(",")
                              .map((v) => v.trim())
                              .filter(Boolean)
                              .map((code) => topicCodeMap[code])
                              .filter(Boolean)
                              .join("\n")
                          : ""}
                      </div>
                    )}

                    {col.type === "text" &&
                      col.key !== "provider" &&
                      col.key !== "topics" &&
                      col.key !== "specify" && (
                        <input
                          className="w-full text-xs text-gray-600 focus:outline-none bg-transparent"
                          value={row[col.key]}
                          onChange={(e) =>
                            updateCell(rowIndex, col.key, e.target.value)
                          }
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
          <summary className="cursor-pointer hover:text-gray-600">
            Topic code reference
          </summary>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 pl-2">
            {Object.entries(topicCodeMap).map(([code, label]) => (
              <li key={code}>
                <span className="font-semibold text-gray-500">{code}</span> —{" "}
                {label}
              </li>
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
  );
}
