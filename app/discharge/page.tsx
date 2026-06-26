"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import PDFPreviewModal from "@/components/PDFPreviewModal";
import { fetchPdfPreview } from "@/lib/pdf/client";
import { useActiveHN } from "@/lib/useActiveHN";

type PatientCardProps = {
  name: string;
  HN: string;
  birth: string;
  admit: string;
  gender: string;
  allergies: string;
};
type Section = {
  id: string;
  subOption: string[];
  label?: string;
};
const doctorList = [
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
          href="/patient"
          className={`block w-full py-2.5 rounded-xl text-sm font-medium ${type === "success" ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
        >
          Back to Main Forms
        </a>
      </div>
    </div>
  );
}

function AutocompleteTextarea({
  value,
  onChange,
  wordBank,
  placeholder = "",
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  wordBank: string[];
  placeholder?: string;
  className?: string;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // ← track ว่า highlight อยู่ที่ไหน

  const getLastSegment = (text: string) => {
    // แยกด้วย comma หรือ newline — เอาส่วนสุดท้าย
    const parts = text.split(/,|\n/);
    return parts[parts.length - 1].trim();
  };

  const updateSuggestions = (text: string) => {
    const lastSeg = getLastSegment(text);
    if (lastSeg.length >= 1) {
      const filtered = wordBank.filter((w) =>
        w.toLowerCase().startsWith(lastSeg.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
    setActiveIndex(-1); // reset highlight ทุกครั้งที่พิมพ์
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    onChange(newVal);
    updateSuggestions(newVal);
  };

  const handleSelect = (word: string) => {
    // แทนที่ segment สุดท้ายด้วยคำที่เลือก แล้วต่อท้ายด้วย ", "
    const parts = value.split(/,|\n/);
    parts[parts.length - 1] = word;
    const newVal = parts.join(", ") + ", "; // ← เว้นให้พิมพ์ต่อได้เลย
    onChange(newVal);
    // อัปเดต suggestions สำหรับคำถัดไป (หลัง ", " segment ใหม่ว่างเปล่า)
    updateSuggestions(newVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault(); // ไม่ให้ขึ้นบรรทัดใหม่
      if (activeIndex >= 0) {
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

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
                  ? "bg-blue-500 text-white" // ← highlight อันที่เลือกอยู่
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Discharge() {
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
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [doctor, setDoctor] = useState("");
  const [show, setShow] = useState(false);
  //const filtered = doctorList.filter((item) => item.includes(doctor))
  const [doctor1, setDoctor1] = useState("");
  const [show1, setShow1] = useState(false);
  const filtered1 = doctorList.filter((item) => item.includes(doctor1));
  const [value, setValue] = useState<Record<string, string>>({});
  const [plan, setPlan] = useState("");
  const [intime, setIntime] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [subChecked, setSubChecked] = useState<Record<string, boolean>>({});
  const [short, setShort] = useState("");
  const [long, setLong] = useState("");
  const [Assessor, setAssessor] = useState("");
  const [modal, setModal] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showModal = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setModal({ show: true, message, type });
  };

  const inTime = [
    { key: "done", label: "ครบกำหนดการรักษา" },
    { key: "not finished", label: "ไม่ครบกำหนดการรักษา" },
    { key: "over", label: "เกินกำหนดระยะเวลาการรักษา" },
  ];
  const [cause, setCause] = useState("");
  const [otherCause, setOtherCause] = useState("");
  const optioncause = [
    { key: "better", label: "อาการดีขึ้น" },
    { key: "normal", label: "อาการหายเป็นปกติ" },
    { key: "way", label: "มีปัญหาในการเดินทาง" },
    { key: "finance", label: "มีปัญหาด้านการเงิน" },
    { key: "change", label: "เปลี่ยนสถานที่รักษา" },
    { key: "refrain", label: "แพทย์สั่งงดทำกายภาพ" },
    { key: "other", label: "อื่น ๆ" },
  ];
  const sections: Section[] = [
    {
      id: "Orthopedic",
      label: "Orthopedic",
      subOption: [
        "pain score < 2",
        "สามารถเดินได้ดีด้วยอุปกรณ์ที่แพทย์ Order ทั้งทางตรง ทางราบ และการขึ้น-ลงบันได",
        "ผู้เฝ้าดูแลหรือญาติ สามารถให้การดูแลเบื้องต้นได้อย่างถูกต้อง",
        "บรรลุเป้าหมายที่ตั้งไว้ในช่วงเวลาอันสั้น",
      ],
    },
    {
      id: "Neurology",
      label: "Neurology",
      subOption: [
        "บรรลุเป้าหมายที่ตั้งไว้ในช่วงเวลาอันสั้น",
        "Barthel index score >= 75 คะแนนหรือมีการเปลี่ยนแปลงของระดับ Barthel index score ร่วมกับผู้เฝ้าดูแลหรือญาติสามารถให้การดูแลได้อย่างถูกต้อง",
        "ผู้เฝ้าดูแลหรือญาติ สามารถให้การดูแลเบื้องต้นได้อย่างถูกต้อง",
      ],
    },
    {
      id: "chest",
      label: "Chest",
      subOption: [
        "บรรลุเป้าหมายที่ตั้งไว้ในช่วงเวลาอันสั้น",
        "ผูเป่วยสามารถหายใจได้เองในห้องปกติโดยปราศจากอุปกรณ์ช่วยหายใจ",
        "ระดับค่าออกซิเจนในกระแสเลือด >= 95%",
        "ผู้ป่วยสามารถช่วยเหลือตนเองได้หรือมีผู้ช่วยเหลือเล็กน้อย",
        "ผู้เฝ้าดูแลหรือญาติ สามารถให้การดูแลเบื้องต้นได้อย่างถูกต้อง",
      ],
    },
  ];
  const [consent, setConsent] = useState("");
  const optionconsent = [
    {
      key: "yes",
      label:
        "บรรลุวัตถุประวงค์การจำหน่ายผู้ป่วย (มีอย่างน้อย 1 ข้อตามที่กำหนดไว้)",
    },
    { key: "no", label: "ไม่บรรลุวัตถุประสงค์การจำหน่ายผู้ป่วย" },
  ];
  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const togglecheck = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleSub = (sectionId: string, sub: string) => {
    const key = `${sectionId}-${sub}`;
    setSubChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const handleInput = (sectionId: string, field: string, value: string) => {
    setValue((prev) => ({ ...prev, [`${sectionId}-${field}`]: value }));
  };

  useEffect(() => {
    if (!patientHN) return;

    const fetchGoals = async () => {
      // ── 1. ดึง OPD/IPD ล่าสุด เป็น baseline ──────────────────────────────
      const [opdRes, ipdRes] = await Promise.all([
        fetch(`/api/opd?hn=${patientHN}&type=before`),
        fetch(`/api/ipd?hn=${patientHN}&type=before`),
      ]);

      const opd = opdRes.ok ? await opdRes.json() : null;
      const ipd = ipdRes.ok ? await ipdRes.json() : null;

      let source = null;
      if (opd && ipd) {
        source =
          new Date(opd.created_at) > new Date(ipd.created_at) ? opd : ipd;
      } else {
        source = opd ?? ipd;
      }

      if (source) {
        setShort(source.short_goal ?? "");
        setLong(source.long_goal ?? "");
        setDoctor(source.doctor ?? "");

        const visitRaw = (source.physical_exam as string) ?? "";
        const visitStr = (() => {
          try {
            if (visitRaw.startsWith('"')) return JSON.parse(visitRaw) as string;
            return visitRaw;
          } catch {
            return visitRaw;
          }
        })();
        const planValue = visitStr.split("/")?.[1]?.trim() ?? "";
        setPlan(planValue);
      }

      // ── 2. ดึง discharge draft ทับ (ถ้ามี) ───────────────────────────────
      const draftRes = await fetch(
        `/api/discharge?hn=${patientHN}&includeDraft=true`,
      );
      if (!draftRes.ok) return;
      const draft = await draftRes.json();
      if (!draft) return;

      // draft override ทุก field ที่ user เคยกรอกไว้
      if (draft.doctor) setDoctor(draft.doctor);
      if (draft.short_goal) setShort(draft.short_goal);
      if (draft.long_goal) setLong(draft.long_goal);
      if (draft.plan) setPlan(draft.plan);
      if (draft.date) setDate(draft.date);
      if (draft.time) setTime(draft.time);
      if (draft.intime) setIntime(draft.intime);
      if (draft.assessor) setAssessor(draft.assessor);

      // cause — ถ้าตรงกับ option key ก็ set ตรง ถ้าไม่ตรงคือ "other"
      if (draft.cause) {
        const knownCauses = [
          "better",
          "normal",
          "way",
          "finance",
          "change",
          "refrain",
        ];
        if (knownCauses.includes(draft.cause)) {
          setCause(draft.cause);
        } else {
          setCause("other");
          setOtherCause(draft.cause);
        }
      }

      if (draft.pass) setConsent(draft.pass);

      // estimate sections (checked + subChecked)
      const estimate =
        typeof draft.estimate === "string"
          ? JSON.parse(draft.estimate)
          : (draft.estimate ?? {});

      const rChecked: Record<string, boolean> = {};
      const rSubChecked: Record<string, boolean> = {};
      sections.forEach((section) => {
        const sec = estimate[section.id];
        if (!sec) return;
        rChecked[section.id] = sec.checked ?? false;
        (sec.subOptions ?? []).forEach((opt: string) => {
          rSubChecked[`${section.id}-${opt}`] = true;
        });
      });
      setChecked((prev) => ({ ...prev, ...rChecked }));
      setSubChecked((prev) => ({ ...prev, ...rSubChecked }));
    };

    fetchGoals();
  }, [patientHN]);

  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraftSaved = useRef(false);

  const [pdfPreview, setPdfPreview] = useState<{
    show: boolean;
    base64: string | null;
    loading: boolean;
    error: string | null;
  }>({ show: false, base64: null, loading: false, error: null });

  function buildDischargePdfPayload() {
    const dischargeSections = sections.reduce(
      (acc, section) => {
        if (!checked[section.id]) return acc;
        acc[section.id] = {
          checked: true,
          subOptions: section.subOption.filter(
            (opt) => subChecked[`${section.id}-${opt}`],
          ),
        };
        return acc;
      },
      {} as Record<string, { checked: boolean; subOptions: string[] }>,
    );

    return {
      patientName,
      dob: patientBirth,
      age: String(hisPatient?.age ?? ""),
      hn: patientHN,
      visitDate: patientAdmit,
      gender: patientGender,
      allergies: patientAllergy,
      date,
      time,
      doctor,
      short_goal: short,
      long_goal: long,
      plan,
      intime,
      cause: cause === "other" ? otherCause : cause,
      pass: consent,
      estimate: dischargeSections,
      assessor: Assessor,
    };
  }

  async function handlePreview() {
    setPdfPreview({ show: true, base64: null, loading: true, error: null });
    const result = await fetchPdfPreview(
      "discharge",
      buildDischargePdfPayload(),
    );
    setPdfPreview({
      show: true,
      base64: result.ok ? result.pdf : null,
      loading: false,
      error: result.ok ? null : result.error,
    });
  }

  async function handleConfirmSave() {
    setPdfPreview((prev) => ({ ...prev, show: false }));
    await handleSave();
  }

  const handleSave = async () => {
    setSaving(true);

    // ======================================
    // เก็บ sections ที่ติ๊ก + sub items
    // ======================================
    const dischargeSections = sections.reduce(
      (acc, section) => {
        if (!checked[section.id]) return acc;
        acc[section.id] = {
          checked: true,
          subOptions: section.subOption.filter(
            (opt) => subChecked[`${section.id}-${opt}`],
          ),
        };
        return acc;
      },
      {} as Record<string, any>,
    );

    try {
      const body = {
        hn: patientHN,
        date: date,
        time: time,
        doctor: doctor,
        short_goal: short,
        long_goal: long,
        plan: plan,
        intime: intime,
        cause: cause === "other" ? otherCause : cause,
        pass: consent,
        estimate: dischargeSections,
        assessor: Assessor,
      };

      const res = await fetch("/api/discharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      setSaving(false);

      if (!res.ok) showModal("เกิดข้อผิดพลาด: " + result.error, "error");
      else showModal("บันทึกข้อมูลสำเร็จ!");
    } catch (err: any) {
      setSaving(false);
    }
  };

  const autoSaveDraft = async () => {
    // ไม่ save ถ้ายังไม่มี HN หรือ save จริงไปแล้ว
    if (!hn) return;
    const dischargeSections = sections.reduce(
      (acc, section) => {
        if (!checked[section.id]) return acc;
        acc[section.id] = {
          checked: true,
          subOptions: section.subOption.filter(
            (opt) => subChecked[`${section.id}-${opt}`],
          ),
        };
        return acc;
      },
      {} as Record<string, any>,
    );

    setAutoSaveStatus("saving");
    try {
      const body = {
        hn: patientHN,
        date: date,
        time: time,
        doctor: doctor,
        short_goal: short,
        long_goal: long,
        plan: plan,
        intime: intime,
        cause: cause === "other" ? otherCause : cause,
        pass: consent,
        estimate: dischargeSections,
        assessor: Assessor,
      };

      await fetch("/api/discharge", {
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
    if (!hn) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      autoSaveDraft();
    }, 10000); // auto save ทุก 10 วิ หลังจากหยุดพิมพ์

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [
    date,
    time,
    doctor,
    short,
    long,
    plan,
    intime,
    cause,
    otherCause,
    consent,
    Assessor,
    checked,
    subChecked,
  ]);
  const shortGoalWords = [
    "Pain Relief ≤ 2 within",
    "Improve Ambulation within",
    "Increase ROM within",
    "Secretion Clearance within",
    "Correct Gait Pattern within",
    "Improve Ventilation within",
    "Normal ADL within",
    "Normal lung function within",
    "Improve Breathing pattern within",
    "Increase muscle power within",
    "Maintain ROM without pain",
    "Maintain muscle power within",
    "Prevent complication within",
  ];

  const longGoalWords = [
    "Normal ADL",
    "Normal lung function",
    "Normal Ambulation",
    "Pain Relief",
    "Full ROM",
    "Increase muscle power",
    "Prevent complication",
  ];

  return (
    <div className="overflow-x-auto min-h-screen bg-gray-100 font-sans">
      <StatusModal
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal((prev) => ({ ...prev, show: false }))}
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

      {/* Patient Info Card */}
      <div className="bg-white rounded-2xl mx-auto w-300 p-4 shadow-md border-t-4 border-blue-500 mt-4">
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
        <div className="flex items-end justify-between gap-6 mt-10 p-4 ">
          <div className="flex flex-col">
            <label className="text-gray-500 text-medium">Date</label>
            <input
              className="border mt-2 rounded-lg border-gray-300 w-80 py-1.5 text-sm text-gray-500"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            ></input>
          </div>

          <div className="flex flex-col">
            <label className="text-medium text-gray-500">Time</label>
            <input
              className="border border-gray-300 rounded-lg text-sm text-gray-500 w-80 py-1.5"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1 flex-1 relative">
            {" "}
            {/* ← เพิ่ม relative */}
            <label className="text-medium text-gray-500">Doctor</label>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
              value={doctor}
              onChange={(e) => {
                setDoctor(e.target.value);
                setShow(true);
              }}
              onBlur={() => setTimeout(() => setShow(false), 150)}
            />
            {/* dropdown ลอยอยู่ใต้ input ไม่บัง */}
          </div>
        </div>

        <div className="flex items-end p-4 mt-10">
          <label className="text-medium text-gray-500">Goal of treatment</label>
        </div>
        <div className="flex flex-col p-4">
          <label className="text-medium text-gray-500">Short term goal</label>
          <AutocompleteTextarea
            value={short}
            onChange={setShort}
            wordBank={shortGoalWords}
            placeholder="พิมพ์เพื่อค้นหา..."
            className="border border-gray-300 rounded-lg py-3 px-3 w-full text-sm text-gray-500 focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex flex-col p-4">
          <label className="text-medium text-gray-500">Long term goal</label>
          <AutocompleteTextarea
            value={long}
            onChange={setLong}
            wordBank={longGoalWords}
            placeholder="พิมพ์เพื่อค้นหา..."
            className="border border-gray-300 rounded-lg py-3 px-3 w-full text-sm text-gray-500 focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="p-4">
          <label className="text-gray-500 text-medium">
            การวางแผนจำหน่ายทางกายภาพบำบัด
          </label>
          <input
            className="border border-gray-300 p-4 ml-4 rounded-lg py-1.5 px-3 text-gray-500 text-sm focus:outline-none focus:border-blue-400"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          ></input>
          <span className="text-gray-500 text-medium ml-2">วัน</span>
        </div>

        <div className="flex justify-between mt-6 p-4">
          {inTime.map((option) => (
            <label
              key={option.key}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                className="text-gray-500 text-medium"
                type="radio"
                name="InTime"
                value={option.key}
                checked={intime === option.key}
                onChange={(e) => setIntime(option.key)}
              />
              <span className="text-sm text-gray-500">{option.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4">
          <label className="text-gray-500 text-medium">สาเหตุ</label>
          <select
            className="border border-gray-300 rounded text-sm w-80 text-gray-500 py-1.5 px-3 cursor-pointer"
            value={cause}
            onChange={(e) => setCause(e.target.value)}
          >
            <option value="">-- Select --</option>
            {optioncause.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>

          {cause === "other" && (
            <input
              className="border text-gray-500 border-gray-300 rounded-lg px-3 w-80 py-1.5 text-sm focus:outline-none focus:border-blue-400"
              value={otherCause}
              onChange={(e) => setOtherCause(e.target.value)}
              autoFocus
            />
          )}
        </div>

        <div className="mt-6 p-4 felx flex-col gap-4">
          {optionconsent.map((option) => (
            <div key={option.key}>
              <label className="flex items-center mt-6 gap-2 cursor-pointer">
                <input
                  className="text-gray-500 text-medium"
                  type="radio"
                  name="Consent"
                  value={option.key}
                  checked={consent === option.key}
                  onChange={(e) => setConsent(option.key)}
                />
                <span className="text-medium text-gray-500">
                  {option.label}
                </span>
              </label>
            </div>
          ))}
        </div>

        <div className="mt-10 gap-2">
          {sections.map((section) => {
            const isChecked = checked[section.id] ?? false;
            return (
              <div key={section.id}>
                <div
                  className={`border border-gray-300 cursor-pointer mt-3 bg-gray-100 rounded-lg py-3 ${
                    isChecked
                      ? "bg-green-200 border-green text-green-700 font-bold"
                      : "bg-gray-100 "
                  }`}
                  onClick={() => toggle(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded ml-4 flex items-center justify-center border-2 transition-colors duration-400 ${
                        isChecked
                          ? "bg-green-500 border-green-500"
                          : "bg-white border-gray-400"
                      }`}
                    >
                      {isChecked && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-medium ${isChecked ? "text-green-700 font-semibold" : "text-gray-500 font-medium"}`}
                      >
                        {section.label}
                      </p>
                    </div>
                  </div>
                </div>

                {isChecked && (
                  <div className="border-b bg-green-100 border-green-300 w-full mt-2 rounded flex flex-col">
                    {section.subOption.map((opt) => (
                      <div
                        key={opt}
                        className="flex items-center gap-2 px-4 py-2"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-green-500 cursor-pointer"
                          checked={subChecked[`${section.id}-${opt}`] ?? false} // ← เปลี่ยน
                          onChange={() => toggleSub(section.id, opt)}
                        />
                        <p className="text-sm text-gray-700">{opt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-4 flex items-end gap-4 relative">
          <label className="text-gray-500 text-medium">
            ผู้ประเมิน ชื่อ-นามสกุล
          </label>
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
            value={Assessor}
            onChange={(e) => {
              setAssessor(e.target.value);
              setShow1(true);
            }}
            onBlur={() => setTimeout(() => setShow1(false), 150)}
          />

          {/* dropdown ลอยอยู่ใต้ input ไม่บัง */}
          {show1 && Assessor && filtered1.length > 0 && (
            <div className="absolute top-full left-43 z-10 w-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {filtered1.map((item) => (
                <div
                  key={item}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                  onClick={() => {
                    setAssessor(item);
                    setShow1(false);
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 mt-4">
          <button
            type="button"
            onClick={handlePreview}
            disabled={saving}
            className={`px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>

      <PDFPreviewModal
        show={pdfPreview.show}
        pdfBase64={pdfPreview.base64}
        loading={pdfPreview.loading}
        error={pdfPreview.error}
        title="ตรวจสอบ Discharge Summary ก่อนบันทึก"
        downloadFilename="Discharge_Preview.pdf"
        onConfirm={handleConfirmSave}
        onClose={() => setPdfPreview((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
