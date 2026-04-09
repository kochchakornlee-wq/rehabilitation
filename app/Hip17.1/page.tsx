"use client"

import { useState } from "react"
import Image from "next/image"

const painItems = [
    "Straightening",
    "Bending",
    "Sitting",
    "Standing",
    "walking"
]

const ActItems = [
    "Lying",
    "Sitting",
    "Rising",
    "Standing",
    "walking"
]
const Pain = [
  {
    id: "Straightening", label: "Straightening hip fully",
    options: [
      { label: "None", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Severe", score: 3 },
      { label: "Extreme", score: 4 },
    ],
  },
  {
    id: "Bending", label: "Bending hip fully",
    options: [
      { label: "None", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Severe", score: 3 },
      { label: "Extreme", score: 4 },
    ],
  },
  {
    id: "Sitting", label: "Sitting or lying",
    options: [
      { label: "None", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Severe", score: 3 },
      { label: "Extreme", score: 4 },
    ],
  },
  {
    id: "Standing", label: "Standing upright",
    options: [
      { label: "None", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Severe", score: 3 },
      { label: "Extreme", score: 4 },
    ],
  },
  {
    id: "walking", label: "Walking on flat surface",
    options: [
      { label: "None", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Severe", score: 3 },
      { label: "Extreme", score: 4 },
    ],
  }
]

const Activity = [
  {
    id: "Lying", label: "Lying in bed",
    options: [
      { label: "None", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Severe", score: 3 },
      { label: "Extreme", score: 4 },
    ],
  },
  {
    id: "Sitting", label: "Sitting",
    options: [
      { label: "None", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Severe", score: 3 },
      { label: "Extreme", score: 4 },
    ],
  },
  {
    id: "Rising", label: "Rising from sitting",
    options: [
      { label: "None", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Severe", score: 3 },
      { label: "Extreme", score: 4 },
    ],
  },
  {
    id: "Standing", label: "Standing",
    options: [
      { label: "None", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Severe", score: 3 },
      { label: "Extreme", score: 4 },
    ],
  },
  {
    id: "walking", label: "Walking on flat surface",
    options: [
      { label: "None", score: 0 },
      { label: "Mild", score: 1 },
      { label: "Moderate", score: 2 },
      { label: "Severe", score: 3 },
      { label: "Extreme", score: 4 },
    ],
  }
]

export default function Hip17() {
    const [painSelections, setPainSelections] = useState<Record<string, number>>({})
    const painTotal = Object.values(painSelections).reduce((s, v) => s + v, 0)

    const painTotalPossible = painItems.length * 4
    const painPercent = painItems.length === Object.keys(painSelections).length
  ? Math.round(100 - (painTotal * 100) / painTotalPossible)
  : null

  const [actSelections, setActSelections] = useState<Record<string, number>>({})
    const adlPatientScore = Object.values(actSelections).reduce((s, v) => s + v, 0)
    const adlTotalPossible = Activity.length * 4
    const adlPercent = Activity.length === Object.keys(actSelections).length
  ? Math.round(100 - (adlPatientScore * 100) / adlTotalPossible)
  : null

  return(
    <div className="min-h-screen bg-gray-100">
        <p className='bg-white px-4 py-4'>
            <Image src='/Hospital logo.svg' alt="Hospital Logo" width={100} height={50}></Image>
        </p>
        <p className="mt-10"></p>
    <div className="bg-white rounded-2xl mx-auto w-250 p-4 shadow-md">
        <div className="bg-gray-100 border border-gray-300 w-240 flex rounded-lg ">
            <label className="text-black text-lg font-bold p-4">Pain</label>
        </div>
        {/* JSX */}
        <div className="flex flex-col mt-10 gap-3">
        {painItems.map((item) => (
            <div key={item} className="border rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-3">{item}</p>
            <div className="flex flex-wrap gap-2">
                {Pain.find(p => p.id === item)?.options.map((option) => (
                <button
                    key={option.label}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setPainSelections((prev) => ({ ...prev, [item]: option.score }))}
                    className={`px-4 py-2 rounded-full border text-sm transition-colors cursor-pointer ${
                    painSelections[item] === option.score
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                >
                    {option.label} ({option.score})
                </button>
                ))}
            </div>
            </div>
        ))}

        {/* Total */}
        <div className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
            <p className="text-sm text-gray-700">Total score</p>
            <p className="font-bold text-gray-500">{painTotal} / {painTotalPossible}</p>
        </div>

        {/* % */}
        <div className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
            <p className="text-sm text-gray-700">%</p>
            <p className="font-bold text-gray-500">
            {painPercent !== null ? `${painPercent}%` : "— (เลือกยังไม่ครบ)"}
            </p>
        </div>
        </div>
        <p className="mt-10"></p>
        
        
        <div className="bg-gray-100 border border-gray-300 w-240 flex rounded-lg ">
            <label className="text-black text-lg font-bold p-4">Activities</label>
        </div>
        <p className="mt-10"></p>
        {/* JSX */}
        <div className="flex flex-col gap-3">
        {Activity.map((item) => (
            <div key={item.id} className="border rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-3">{item.label}</p>
            <div className="flex flex-wrap gap-2">
                {item.options.map((opt) => (
                <button
                    key={opt.label}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setActSelections((prev) => ({ ...prev, [item.id]: opt.score }))}
                    className={`px-4 py-2 rounded-full border text-sm transition-colors cursor-pointer ${
                    actSelections[item.id] === opt.score
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                >
                    {opt.label} ({opt.score})
                </button>
                ))}
            </div>
            </div>
        ))}

        {/* Total */}
        <div className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
            <p className="text-sm text-gray-700">Total score</p>
            <p className="font-bold text-gray-500">{adlPatientScore} / {adlTotalPossible}</p>
        </div>

        {/* % */}
        <div className="border rounded-xl p-4 flex justify-between items-center bg-gray-50">
            <p className="text-sm text-gray-700">%</p>
            <p className="font-bold text-gray-500">
            {adlPercent !== null ? `${adlPercent}%` : "— (เลือกยังไม่ครบ)"}
            </p>
        </div>
        </div>
    </div>
    </div>
  )
}