"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useActiveHN } from "@/lib/useActiveHN";

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

export default function OtherForm() {
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
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
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
      <div className="p-2"></div>
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
      <div className="p-2"></div>

      <div className="mx-auto bg-white w-300 rounded-xl shadow-md">
        <div className="flex items-center justify-center p-4">
          <p className="font-bold text-3xl text-blue-800">Other Form Content</p>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="flex justify-center mt-10 ml-20">
            <a href="/Koos">
              <div className="flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <img
                  src="knee.jpg"
                  alt="Knee Image"
                  className="h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 "
                />

                <p className="flex flex-col">
                  <label className="block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600">
                    Knee Form
                  </label>

                  <label className="text-sm text-gray-400 ml-7 cursor-pointer">
                    Knee and Osteoarthritis Outcome Score (KOOS)
                  </label>
                </p>
              </div>
            </a>
          </div>

          <div className="flex justify-center mt-10 mr-20">
            <a href="/Hip17.1">
              <div className="flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <img
                  src="hip.jpg"
                  alt="Hip Image"
                  className="h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 "
                />

                <p className="flex flex-col">
                  <label className="block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600">
                    Hip Form
                  </label>
                  <label className="text-sm text-gray-400 ml-7 cursor-pointer">
                    Hip Disability And Osteoarthritis Outcome Score (HOOS)
                  </label>
                </p>
              </div>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="flex justify-center mt-5 ml-20">
            <a href="/modify_rankin">
              <div className="flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <img
                  src="stroke.jpg"
                  alt="Stroke Image"
                  className="h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 "
                />

                <p className="flex flex-col">
                  <label className="block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600">
                    Stroke Form
                  </label>
                  <label className="text-sm text-gray-400 ml-7 cursor-pointer">
                    THE MODIFIED RANKIN SCALE
                  </label>
                </p>
              </div>
            </a>
          </div>

          <div className="flex justify-center mt-5 mr-20">
            <a href="/Barthel">
              <div className="flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <img
                  src="barthel.jpg"
                  alt="Barthel Image"
                  className="h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 "
                />

                <p className="flex flex-col">
                  <label className="block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600">
                    Barthel Index
                  </label>
                  <label className="text-sm text-gray-400 ml-7 cursor-pointer">
                    The Barthel Index of Activities of Daily Living
                  </label>
                </p>
              </div>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="flex justify-center mt-5 ml-20">
            <a href="/timeup">
              <div className="flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <img
                  src="timeup.jpg"
                  alt="Time-Up Test Image"
                  className="h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 "
                />

                <p className="flex flex-col">
                  <label className="block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600">
                    Time-Up Test
                  </label>
                  <label className="text-sm text-gray-400 ml-7 cursor-pointer">
                    THE TIME-UP TEST
                  </label>
                </p>
              </div>
            </a>
          </div>

          <div className="flex justify-center mt-5 mr-20">
            <a href="/cancer">
              <div className="flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300">
                <img
                  src="cancer.jpg"
                  alt="Cancer Form Image"
                  className="h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 "
                />

                <p className="flex flex-col">
                  <label className="block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600">
                    Cancer Form
                  </label>
                  <label className="text-sm text-gray-400 ml-7 cursor-pointer">
                    Initial Assessment in Cancer Patient
                  </label>
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
