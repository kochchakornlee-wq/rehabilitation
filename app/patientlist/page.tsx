"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface HISPatient {
  hn: string;
  hn_formatted: string;
  prename?: string;
  firstname?: string;
  lastname?: string;
  gender?: string;
  age?: number | null;
  birthdate?: string;
  admit_date?: string;
  visit_date?: string;
  allergies?: string[];
}

function fullName(p: HISPatient) {
  return [p.prename, p.firstname, p.lastname].filter(Boolean).join("");
}

function genderColor(gender?: string) {
  if (gender === "M" || gender === "1")
    return { bg: "bg-blue-100", text: "text-blue-700", label: "ชาย" };
  if (gender === "F" || gender === "2")
    return { bg: "bg-pink-100", text: "text-pink-700", label: "หญิง" };
  return { bg: "bg-gray-100", text: "text-gray-500", label: "-" };
}

function getInitials(name: string) {
  const clean = name.replace(/^(นาย|นาง|นางสาว|Mr\.|Mrs\.|Ms\.)/, "").trim();
  return clean.slice(0, 2) || "??";
}

function formatDate(d?: string | null) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-green-100 text-green-700",
  "bg-rose-100 text-rose-700",
];

export default function PatientListPage() {
  const router = useRouter();

  const [patients, setPatients] = useState<HISPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // โหลดทุกคนตอนแรก
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setPatients([]);
    setError("");
    try {
      const res = await fetch("/api/his-patients");
      if (!res.ok) throw new Error("โหลดไม่ได้");
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      setError("ไม่สามารถโหลดรายชื่อผู้ป่วยได้");
    } finally {
      setLoading(false);
    }
  };

  // debounce search — พิมพ์แล้วรอ 400ms
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      loadAll();
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setPatients([]);
      try {
        const res = await fetch(
          `/api/his-patients?search=${encodeURIComponent(val.trim())}`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPatients(Array.isArray(data) ? data : []);
      } catch {
        setPatients([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  // page.tsx (patientlist)
  const goToPatient = (hn: string) => {
    localStorage.setItem("activeHN", hn); // ← เพิ่ม
    router.push(`/patient?hn=${encodeURIComponent(hn)}`);
  };

  const isLoading = loading || searching;
  const showSkeleton = isLoading;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Loading bar */}
      <style>{`
        @keyframes loadingBar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
      {isLoading && (
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
      <p className="p-2"></p>

      <div className="max-w-5xl mx-auto px-4">
        {/* Header + Search */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">ผู้ป่วย</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหา HN หรือชื่อ..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 pr-10 text-sm text-gray-600 w-72 focus:outline-none focus:border-blue-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {isLoading ? (
                <svg
                  className="w-4 h-4 animate-spin"
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
              ) : (
                <svg
                  className="w-4 h-4"
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
              )}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadAll}
              className="text-red-500 hover:text-red-700 underline text-xs"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading ? (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-400 animate-pulse">
                กำลังโหลดข้อมูลผู้ป่วย...
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          </>
        ) : patients.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
              />
            </svg>
            <p className="text-sm">ไม่พบผู้ป่วย</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{patients.length} คน</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
              {patients.map((p, idx) => {
                const g = genderColor(p.gender);
                const name = fullName(p);
                const initials = getInitials(name);
                const avatarColor =
                  avatarColors[
                    (p.hn?.charCodeAt(p.hn.length - 1) ?? 0) %
                      avatarColors.length
                  ];
                return (
                  <div
                    key={p.hn ?? idx}
                    onClick={() => goToPatient(p.hn)}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${avatarColor}`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {name || "ไม่ระบุชื่อ"}
                        </p>
                        <p className="text-xs text-gray-400"></p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${g.bg} ${g.text}`}
                      >
                        {g.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-gray-400">HN</span>
                      <span className="text-gray-600 font-mono">
                        {p.hn_formatted || p.hn}
                      </span>
                      <span className="text-gray-400">อายุ</span>
                      <span className="text-gray-600">
                        {p.age != null ? `${p.age} ปี` : "-"}
                      </span>
                      <span className="text-gray-400">วันเกิด</span>
                      <span className="text-gray-600">
                        {formatDate(p.birthdate)}
                      </span>
                      {p.allergies && p.allergies.length > 0 && (
                        <>
                          <span className="text-gray-400">Allergy</span>
                          <span className="text-red-500 truncate">
                            {p.allergies.join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
