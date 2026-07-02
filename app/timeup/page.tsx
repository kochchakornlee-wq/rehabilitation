"use client";

import Image from "next/image";
import { use, useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchPdfPreview } from "@/lib/pdf/client";
import PDFPreviewModal from "@/components/PDFPreviewModal";
import { useActiveHN } from "@/lib/useActiveHN";

const therapistOptions = [
  "เวนิช สว่างแสง",
  "พนิดา รุ่งพิบูลโสภิษฐ์",
  "พิชญา เพชรละเอียด",
  "ธนัชพร วิไลเลิศ",
  "ศิรดา เดิมคลัง",
  "ชัชนันท์ แก่เมือง",
  "จักษณา ชัยราม",
  "ชรินดา ถาวรวรกุล",
];
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
function genderLabel(g?: string) {
  if (g === "M" || g === "1") return "Male";
  if (g === "F" || g === "2") return "Female";
  return g ?? "-";
}

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
          href="/otherform"
          className={`block w-full py-2.5 rounded-xl text-sm font-medium ${type === "success" ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
        >
          Back to Other forms
        </a>
      </div>
    </div>
  );
}

export default function TimeUp() {
  const params = useParams();
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

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timeselect, setTimeselect] = useState("");
  const timeoptions = [
    {
      key: "safe",
      label: "< 10s Safe",
      color: "text-green-600",
      description: "Normal mobility, low risk.",
    },
    {
      key: "mild",
      label: "11-20s Mild/Moderate",
      color: "text-orange-500",
      description: "Increased risk of falls.",
    },
    {
      key: "high",
      label: "> 20s High Fall Risk",
      color: "text-red-600",
      description: "Significant risk, assistance required.",
    },
  ];
  const [physiotherapist, setPhysiotherapist] = useState("");
  const [show, setShow] = useState(false);
  const filtered = therapistOptions.filter((item) =>
    item.includes(physiotherapist),
  );
  const typeoptions = [
    { key: "Preoperation", label: "Preoperation" },
    { key: "discharge", label: "Discharge" },
    { key: "follow up", label: "Follow up" },
  ];
  const [type, setType] = useState("");
  const [walking, setWalking] = useState("");
  const walkoptions = [
    { key: "yes", label: "Yes" },
    { key: "no", label: "No" },
  ];
  const [showWalk, setShowWalk] = useState("");
  const [result, setResult] = useState("");
  const [device, setDevice] = useState("");
  const deviceoptions = [
    { key: "independent", label: "Independent" },
    { key: "cane", label: "Cane" },
    { key: "walker", label: "Walker" },
    { key: "One crutch", label: "One crutch" },
    { key: "Two crutches", label: "Two crutches" },
  ];
  const [direction, setDirection] = useState("");
  const directionoptions = [
    { key: "right", label: "Right" },
    { key: "left", label: "Left" },
  ];
  const [otherVisual, setOtherVisual] = useState("");
  const otherVisualoptions = [
    { key: "yes", label: "Yes" },
    { key: "no", label: "No" },
  ];
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraftSaved = useRef(false);

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
  const router = useRouter();

  const [pdfPreview, setPdfPreview] = useState<{
    show: boolean;
    base64: string | null;
    loading: boolean;
    error: string | null;
  }>({ show: false, base64: null, loading: false, error: null });

  useEffect(() => {
    const prefillFromLastVisit = async () => {
      if (!patientHN || patientHN === hn) {
        // ยังไม่มี HN จาก HIS ให้รอก่อน
      }
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `/api/tug?hn=${patientHN}&type=before&date=${today}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;
      setType(data.assessment_type ?? "");
      setPhysiotherapist(data.physiotherapist ?? "");
      setShowWalk(
        data.time_to_complete ? data.time_to_complete.toString() : "",
      );
      setWalking(data.walking_ability ?? "");
      setResult(data.time_to_complete ? data.time_to_complete.toString() : "");
      setDate(data.assessment_date ?? "");
      // setTime ไม่ต้อง prefill เพราะเป็นเวลาของวันใหม่
      setTimeselect(data.safety_classification ?? "");
      setDevice(data.assistive_device ?? "");
      setDirection(data.return_direction ?? "");
      setOtherVisual(data.visual_aids ?? "");
    };
    prefillFromLastVisit();
  }, [patientHN]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        patient_hn: patientHN,
        patient_name: patientName,
        patientInfo: {
          hn: patientHN,
          name: patientName, // ดึงจาก state ที่ได้จาก HIS API
          gender: patientGender,
          dob: patientBirth,
          allergies: patientAllergy,
        },
        assessment_date: date || null,
        assessment_time: time || null,
        assessment_type: type || null,
        physiotherapist: physiotherapist || null,
        walking_ability: walking || null,
        time_to_complete: showWalk ? parseFloat(showWalk) : null,
        safety_classification: timeselect || null,
        assistive_device: device || null,
        return_direction: direction || null,
        visual_aids: otherVisual || null,
        status: "saved",
      };

      const res = await fetch("/api/tug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const ret = await res.json();
      setSaving(false);
      if (!res.ok) showToast("เกิดข้อผิดพลาด: " + ret.error, "error");
      else setPdfPreview((prev) => ({ ...prev, show: false }));
      showToast("บันทึกข้อมูลสำเร็จ!", "success");
    } catch (err: any) {
      setSaving(false);
      showToast(err.message ?? "เกิดข้อผิดพลาด", "error");
    }
  };

  const handleConfirmSave = async () => {
    setPdfPreview((prev) => ({ ...prev, show: false })); // ← ปิด modal ก่อน
    await handleSave(); // ← แล้วค่อย save
  };

  const autoSaveDraft = async () => {
    // ไม่ save ถ้ายังไม่มี HN หรือ save จริงไปแล้ว
    //if (!patientHN || beforeSaved) return

    setAutoSaveStatus("saving");
    try {
      const body = {
        patient_hn: patientHN,
        patient_name: patientName,
        assessment_date: date || null,
        assessment_time: time || null,
        assessment_type: type || null,
        physiotherapist: physiotherapist || null,
        walking_ability: walking || null,
        time_to_complete: showWalk ? parseFloat(showWalk) : null,
        safety_classification: timeselect || null,
        assistive_device: device || null,
        return_direction: direction || null,
        visual_aids: otherVisual || null,
        status: "draft",
      };

      await fetch("/api/tug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      isDraftSaved.current = true;
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus("idle"), 3000); // หาย 3 วิ
    } catch {
      setAutoSaveStatus("idle");
    }
  };

  useEffect(() => {
    //if (!patientHN || !visitType) return
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      autoSaveDraft();
    }, 10000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [
    date,
    time,
    type,
    physiotherapist,
    walking,
    showWalk,
    timeselect,
    device,
    direction,
    otherVisual,
  ]);

  function buildTimeupPdfPayload() {
    const assessmentTypeMap: Record<string, string> = {
      "pre operation": "pre",
      preoperation: "pre",
      discharge: "discharge",
      "follow up": "follow",
    };

    // map canWalk
    const canWalkMap: Record<string, string> = {
      yes: "walk",
      no: "no walk",
    };

    // map timetest
    const timetestMap: Record<string, string> = {
      safe: "0-10",
      moderate: "11-20",
      high: "21-30",
    };
    return {
      patientName: patientName,
      dob: patientBirth,
      age: String(hisPatient?.age ?? ""),
      hn: patientHN,
      vn: "",
      visitDate: hisPatient?.admit_date ?? "",
      gender: hisPatient?.gender ?? "",
      allergies: (hisPatient?.allergies ?? []).join(", "),
      date: date || null,
      time: time || null,
      phyiotherapistName: physiotherapist || null,
      timeresult: showWalk || null,
      assessmentType: assessmentTypeMap[type?.toLowerCase() ?? ""] ?? type,
      canWalk: canWalkMap[walking ?? ""] ?? walking,
      timetest: timetestMap[timeselect ?? ""] ?? timeselect,
      divice: device,
      direction: direction,
      aids: otherVisual,
    };
  }
  async function handlePreview() {
    const payload = buildTimeupPdfPayload();
    console.log("payload:", JSON.stringify(payload));
    setPdfPreview({ show: true, base64: null, loading: true, error: null });
    const result = await fetchPdfPreview("timeup", buildTimeupPdfPayload());
    setPdfPreview({
      show: true,
      base64: result.ok ? result.pdf : null,
      loading: false,
      error: result.ok ? null : result.error,
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <StatusModal
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
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
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="p-2"></div>
        <div className="bg-white rounded-2xl mx-auto w-250 p-4 shadow-md border-t-4 border-blue-500">
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

        <div className="flex items-start justify-start bg-white mx-auto rounded-sm mt-10 shadow-md px-6 py-4 gap-10">
          {/* Assessment Date & Time */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-500">
              Assessment Date & Time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 text-gray-500 text-sm rounded px-2 py-1 w-36"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border border-gray-300 text-gray-500 text-sm rounded px-2 py-1 w-28"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-gray-200 self-stretch" />

          {/* Assessment Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-500">Assessment Type</label>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {typeoptions.map((option) => (
                <div key={option.key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={option.key}
                    name="type"
                    value={option.key}
                    checked={type === option.key}
                    onChange={(e) => setType(e.target.value)}
                    className="h-4 w-4 border border-gray-400 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={option.key} className="text-sm text-gray-500">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1 relative">
            {" "}
            {/* ← เพิ่ม relative */}
            <label className="text-sm text-gray-500">Pysiotherapist</label>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
              value={physiotherapist}
              onChange={(e) => {
                setPhysiotherapist(e.target.value);
                setShow(true);
              }}
              onBlur={() => setTimeout(() => setShow(false), 150)}
            />
            {/* dropdown ลอยอยู่ใต้ input ไม่บัง */}
            {show && physiotherapist && filtered.length > 0 && (
              <div className="absolute top-full left-0 z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                {filtered.map((item) => (
                  <div
                    key={item}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      setPhysiotherapist(item);
                      setShow(false);
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mt-7"></p>
        <div className="bg-gray-100 mx-auto border items-center rounded-sm border-gray-300 px-4 py-3">
          <label className="text-2xl font-bold text-black">
            🚶‍♀️‍➡️ Patient Walking Ability
          </label>
        </div>
        <div className="bg-white mx-auto shadow-md px-6 py-4">
          <label className="block text-sm text-gray-500 mb-3">
            Is the patient able to walk?
          </label>
          <div className="flex flex-row gap-10 items-center">
            {walkoptions.map((option) => (
              <label
                key={option.key}
                className={`
                                    flex items-center gap-6
                                    border rounded-md px-3 py-2
                                    cursor-pointer transition-colors
                                    ${
                                      walking === option.key
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-300 hover:bg-gray-50"
                                    }
                                    `}
              >
                <input
                  type="radio"
                  id={option.key}
                  name="walking"
                  value={option.key}
                  checked={walking === option.key}
                  onChange={(e) => setWalking(e.target.value)}
                  className="h-4 w-4 border border-gray-400 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={option.key} className="text-sm text-gray-500">
                  {option.label}
                </label>
              </label>
            ))}
          </div>
        </div>

        <p className="mt-7"></p>
        <div className="bg-gray-100 mx-auto border items-center rounded-sm border-gray-300 px-4 py-3">
          <label className="text-2xl font-bold text-black">
            ⏱️ Assessment Result
          </label>
        </div>
        <div className="bg-white mx-auto shadow-md px-6 py-4">
          <label className="block text-sm text-gray-500 mb-3">
            Time to Complete (Seconds)
          </label>

          {/* Input with SEC unit */}
          <div className="flex items-center border border-gray-300 rounded-sm w-60 bg-gray-50 px-3 py-3 gap-2">
            {/* <span className='text-2xl font-bold text-gray-700 flex-1'>{showWalk || '0.00'}</span> */}
            <span className="text-xs text-gray-400 font-semibold">SEC</span>
            <input
              type="number"
              value={showWalk}
              onChange={(e) => setShowWalk(e.target.value)}
              className="text-2xl font-bold text-gray-700 w-full bg-transparent focus:outline-none"
            />
          </div>

          {/* Safety Range Classification */}
          <label className="block text-sm font-semibold text-gray-700 mt-5 mb-3">
            Safety Range Classification
          </label>
          <div className="flex flex-row gap-4">
            {timeoptions.map((option) => (
              <div
                key={option.key}
                onClick={() => setTimeselect(option.key)}
                className={`flex flex-col gap-2 border rounded-md px-4 py-3 cursor-pointer flex-1 transition-colors
                                        ${timeselect === option.key ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  id={option.key}
                  name="Timeoptions"
                  value={option.key}
                  checked={timeselect === option.key}
                  onChange={(e) => setTimeselect(e.target.value)}
                  className="h-4 w-4 border border-gray-400 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={option.key}
                  className={`text-sm font-bold cursor-pointer ${option.color}`}
                >
                  {option.label}
                </label>
                <p className="text-xs text-gray-400">{option.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-100 rounded-sm w-full bordr border-gray-300">
            <label className="text-2xl text-black block font-bold px-4 pt-3 border border-gray-300 rounded-sm">
              🧑‍🦯‍➡️Assistive Device Used
            </label>
            <div className="bg-white mx-auto w-full gap-4 p-4 rounded-sm flex flex-col shadow-md">
              {deviceoptions.map((option) => (
                <div key={option.key}>
                  <input
                    type="radio"
                    id={option.key}
                    name="Deviceoptions"
                    value={option.key}
                    checked={device === option.key}
                    onChange={(e) => setDevice(e.target.value)}
                    className="h-4 w-4 border border-gray-400 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={option.key}
                    className="ml-2 text-sm text-gray-500 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-100 border rounded-sm border-gray-300 w-full h-full flex flex-col">
            <label className="text-2xl text-black block font-bold mb-2 px-2 py-1">
              ⤴️ Return Direction
            </label>

            <div className="bg-white w-full p-4 rounded-sm border-t border-gray-300 shadow-md flex-1 pb-6">
              {/* Return Direction */}
              <div className="flex justify-center gap-10">
                {directionoptions.map((option) => (
                  <label
                    key={option.key}
                    className={`
                                                    flex items-center gap-6
                                                    border rounded-md px-4 py-3
                                                    cursor-pointer transition-all
                                                    min-w-[120px] justify-center
                                                    ${
                                                      direction === option.key
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-300 hover:bg-gray-50"
                                                    }
                                                `}
                  >
                    <input
                      type="radio"
                      name="Directionoptions"
                      value={option.key}
                      checked={direction === option.key}
                      onChange={(e) => setDirection(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />

                    <span className="text-md text-gray-600">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Divider */}
              <div className="my-4 mt-3 border-b border-gray-200"></div>

              {/* Visual Aids */}
              <label className="block text-sm font-medium text-gray-600 ">
                Visual AIDS
              </label>

              <div className="flex justify-center gap-6">
                {otherVisualoptions.map((option) => (
                  <label
                    key={option.key}
                    className={`
                                                    flex items-center gap-6
                                                    border rounded-md px-4 py-3
                                                    cursor-pointer transition-all
                                                    min-w-[120px] justify-center
                                                    ${
                                                      otherVisual === option.key
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-300 hover:bg-gray-50"
                                                    }
                                                `}
                  >
                    <input
                      type="radio"
                      name="otherVisual"
                      value={option.key}
                      checked={otherVisual === option.key}
                      onChange={(e) => setOtherVisual(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />

                    <span className="text-sm text-gray-600">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handlePreview}
            className="mt-6 w-20 bg-blue-600 text-white py-3 rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
      <PDFPreviewModal
        show={pdfPreview.show}
        pdfBase64={pdfPreview.base64}
        loading={pdfPreview.loading}
        error={pdfPreview.error}
        title="ตรวจสอบ Time Up and Go Test ก่อนบันทึก"
        downloadFilename="Time_Up_Preview.pdf"
        onConfirm={handleConfirmSave}
        onClose={() => setPdfPreview((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
