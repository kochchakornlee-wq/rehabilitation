"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { NextResponse } from 'next/server'

interface HISPatient {
  hn: string
  hn_formatted?: string
  prename?: string
  firstname?: string
  lastname?: string
  birthdate?: string
  gender?: string
  age?: number
  admit_date?: string
  visit_date?: string
  allergies?: string[]
}

function genderLabel(g?: string) {
  if (g === "M" || g === "1") return "Male"
  if (g === "F" || g === "2") return "Female"
  return g ?? "-"
}

export default function PatientForm() {
  const searchParams = useSearchParams()
  const hn = searchParams.get("hn") ?? ""

  const [patient, setPatient] = useState<HISPatient | null>(null)
  const [loading, setLoading] = useState(!!hn)

  useEffect(() => {
    if (!hn) return
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/his-patient?hn=${encodeURIComponent(hn)}`)
        if (res.ok) setPatient(await res.json())
      } catch (err) {
        console.error("[his-patient] fetch failed:", err)
        return NextResponse.json({ error: "HIS unavailable" }, { status: 503 })
      }
      finally { setLoading(false) }
    }
    fetch_()
  }, [hn])

  const name = patient
    ? [patient.prename, patient.firstname, patient.lastname].filter(Boolean).join("")
    : ""
  const displayHN   = patient?.hn_formatted ?? patient?.hn ?? hn
  const birth       = patient?.birthdate ?? "-"
  const admit       = patient?.admit_date ?? patient?.visit_date ?? "-"
  const gender      = genderLabel(patient?.gender)
  const allergies   = patient?.allergies?.join(", ") || "-"

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-white flex justify-start sticky top-0 z-50">
                        <div className="flex items-center gap-5 bg-white w-full px-6 py-4 shadow-sm">
                        <Image src='/Hospital logo.svg' alt="Hospital Logo" width={100} height={50}></Image>
                        <a href='/' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                          Home
                        </a>
                        <a href='/patient' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                          Patient Form
                        </a>
                        <a href='/otherform' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                            Other Forms
                        </a>
                        <a href='/patientlist' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                            Patient List
                        </a>
                        <a href='/record' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                            View All Records
                        </a>
                      
                  
                    </div>
                  </nav>

      <div className='p-2'></div>

      {/* Patient Card */}
      <div className="bg-white p-6 rounded-2xl shadow-md w-300 mx-auto">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-100 rounded w-32 mt-3" />
            <div className="h-4 bg-gray-100 rounded w-40" />
            <div className="h-4 bg-gray-100 rounded w-36" />
          </div>
        ) : (
          <>
            <h2 className="text-xl text-blue-500 font-bold mb-4">{name || "ไม่พบข้อมูลผู้ป่วย"}</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="font-bold text-blue-800">HN</p>
              <p className="text-gray-700">{displayHN}</p>

              <p className="font-bold text-blue-800">Date of Birth</p>
              <p className="text-gray-700">{birth}</p>

              <p className="font-bold text-blue-800">Admit</p>
              <p className="text-gray-700">{admit}</p>

              <p className="font-bold text-blue-800">Gender</p>
              <p className="text-gray-700">{gender}</p>

              <p className="font-bold text-blue-800">Allergies</p>
              <p className="text-gray-700">{allergies}</p>
            </div>
          </>
        )}
      </div>

      <div className='p-2'></div>

      {/* Form Cards */}
      <main className="p-6 flex flex-col gap-6">
        <div className='bg-white p-6 rounded-xl w-300 mx-auto'>
          <div className="grid grid-cols-4 gap-4">

            <div className="bg-neutral-primary-soft block max-w-sm border border-default rounded-xl shadow-xs transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-400 cursor-pointer overflow-hidden">
              <a href={`/patientForm1?hn=${encodeURIComponent(displayHN)}`}>
                <img className="w-full h-48 object-cover rounded-t-md transition-transform duration-300 hover:scale-105" src="/OPD.jpg" alt="opd" />
              </a>
              <div className="p-6 text-center">
                <a href={`/patientForm1?hn=${encodeURIComponent(displayHN)}`}>
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xl font-semibold block w-fit">OPD</span>
                  <p className='bg-white p-2'></p>
                  <h6 className='text-gray-400 text-sm text-justify'>OPD Assessment Physiotherapy Department</h6>
                </a>
                <p className='bg-white p-2'></p>
                <a href={`/patientForm1?hn=${encodeURIComponent(displayHN)}`} className="inline-flex items-center text-white bg-blue-500 box-border rounded-xl border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                  Select
                  <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
                </a>
              </div>
            </div>

            <div className="bg-neutral-primary-soft block max-w-sm border border-default rounded-xl shadow-xs transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-400 cursor-pointer overflow-hidden">
              <a href={`/IPDForm?hn=${encodeURIComponent(displayHN)}`}>
                <img className="w-full h-48 object-cover rounded-t-md transition-transform duration-300 hover:scale-105" src="/IPD.jpg" alt="ipd" />
              </a>
              <div className="p-6 text-center">
                <a href={`/IPDForm?hn=${encodeURIComponent(displayHN)}`}>
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xl font-semibold block w-fit">IPD</span>
                  <p className='bg-white p-2'></p>
                  <h6 className='text-gray-400 text-sm text-justify'>IPD Assessment Physiotherapy Department</h6>
                </a>
                <p className='bg-white p-2'></p>
                <a href={`/IPDForm?hn=${encodeURIComponent(displayHN)}`} className="inline-flex items-center text-white bg-blue-500 box-border rounded-xl border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                  Select
                  <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
                </a>
              </div>
            </div>

            <div className="bg-neutral-primary-soft block max-w-sm border border-default rounded-xl shadow-xs transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-400 cursor-pointer overflow-hidden">
              <a href={`/first_visit?hn=${encodeURIComponent(displayHN)}`}>
                <img className="w-full h-48 object-cover rounded-t-md transition-transform duration-300 hover:scale-105" src="/fam-rec.jpg" alt="record" />
              </a>
              <div className="p-6 text-center">
                <a href={`/first_visit?hn=${encodeURIComponent(displayHN)}`}>
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xl font-semibold block w-fit">Record</span>
                  <p className='bg-white p-2'></p>
                  <h6 className='text-gray-400 text-sm text-justify'>Patient and Family Education Record</h6>
                </a>
                <p className='bg-white p-2'></p>
                <a href={`/first_visit?hn=${encodeURIComponent(displayHN)}`} className="inline-flex items-center text-white bg-blue-500 box-border rounded-xl border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                  Select
                  <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
                </a>
              </div>
            </div>

            <div className="bg-neutral-primary-soft block max-w-sm border border-default rounded-xl shadow-xs transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-400 cursor-pointer overflow-hidden">
              <a href={`/discharge?hn=${encodeURIComponent(displayHN)}`}>
                <img className="w-full h-48 object-cover rounded-t-md transition-transform duration-300 hover:scale-105" src="/discharge.jpg" alt="discharge" />
              </a>
              <div className="p-6 text-center">
                <a href={`/discharge?hn=${encodeURIComponent(displayHN)}`}>
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xl font-semibold block w-fit">Discharge</span>
                  <p className='bg-white p-2'></p>
                  <h6 className='text-gray-400 text-sm text-justify'>Discharge Summary Physiotherapy Department</h6>
                </a>
                <p className='bg-white p-2'></p>
                <a href={`/discharge?hn=${encodeURIComponent(displayHN)}`} className="inline-flex items-center text-white bg-blue-500 box-border rounded-xl border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                  Select
                  <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
                </a>
              </div>
            </div>

          </div>
          <a href="/otherform" className="mt-5 flex justify-end text-right text-sm text-gray-400 hover:text-blue-700 underline hover:underline transition-colors">
            Other Forms
          </a>
        </div>
      </main>
    </div>
  )
}