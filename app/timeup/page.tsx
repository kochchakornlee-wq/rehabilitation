"use client"

import Image from 'next/image'
import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const therapistOptions = [
      "เวนิช สว่างแสง",
      "พนิดา รุ่งพิบูลโสภิษฐ์",
      "พิชญา เพชรละเอียด",
      "ธนัชพร วิไลเลิศ",
      "ศิรดา เดิมคลัง",
      "ชัชนันท์ แก่เมือง",
      "จักษณา ชัยราม",
      "ชรินดา ถาวรวรกุล",

    ]

function StatusModal({ show, message, type, onClose }: { show: boolean; message: string; type: "success" | "error"; onClose: () => void }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-sm">✕</button>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl ${type === "success" ? "bg-green-100" : "bg-red-100"}`}>
          {type === "success" ? "✅" : "❌"}
        </div>
        <p className="font-medium text-base text-gray-900 mb-1">{type === "success" ? "สำเร็จ" : "เกิดข้อผิดพลาด"}</p>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <a href="/otherform" className={`block w-full py-2.5 rounded-xl text-sm font-medium ${type === "success" ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}`}>
          Back to Other forms
        </a>
      </div>
    </div>
  )
}

export default function TimeUp() {

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [timeselect, setTimeselect] = useState("");
    const timeoptions = [
    { key: 'safe',     label: '< 10s Safe',           color: 'text-green-600', description: 'Normal mobility, low risk.' },
    { key: 'mild',     label: '11-20s Mild/Moderate',  color: 'text-orange-500', description: 'Increased risk of falls.' },
    { key: 'high',     label: '> 20s High Fall Risk',  color: 'text-red-600',   description: 'Significant risk, assistance required.' },
    ]
    const [physiotherapist, setPhysiotherapist] = useState("");
    const [show, setShow] = useState(false)
    const filtered = therapistOptions.filter((item) => item.includes(physiotherapist))
    const typeoptions = [
        {key:"Preoperation", label:"Preoperation"},
        {key:"discharge", label:"Discharge"},
        {key:"follow up", label:"Follow up"},
    ]
    const [type, setType] = useState("");
    const [walking, setWalking] = useState("");
    const walkoptions = [
        {key:"yes", label:"Yes"},
        {key:"no", label:"No"}
    ]
    const [showWalk, setShowWalk] = useState("");
    const [result, setResult] = useState("");
    const [device, setDevice] = useState("");
    const deviceoptions = [
        {key:"independent", label:"Independent"},
        {key:"cane", label:"Cane"},
        {key:"walker", label:"Walker"},
        {key:"One crutch", label:"One crutch"},
        {key:"Two crutches", label:"Two crutches"},
    ]
    const [direction, setDirection] = useState("");
    const directionoptions = [
        {key:"right", label:"Right"},
        {key:"left", label:"Left"}
    ]
    const [otherVisual, setOtherVisual] = useState("");
    const otherVisualoptions = [
        {key:"yes", label:"Yes"},
        {key:"no", label:"No"}
    ]
    const [saving, setSaving] = useState(false);

    const patient = [
        {
        name: "John Doe",
        HN: "123456",
        birth: "01/01/1980",
        admit: "01/01/2024",
        gender: "Male",
        allergies: "Penicillin"
        
    }
    ]

    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
      show: false, message: "", type: "success"
      })

      const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ show: true, message, type })
      }
    const router = useRouter()

    useEffect(() => {
        const prefillFromLastVisit = async () => {
            const {data, error} = await supabase
            .from("tug_assessments")
            .select("*")
            .eq("patient_hn", patient[0].HN)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

            if (error || !data) {
            console.log("ไม่พบข้อมูล visit ก่อนหน้า", error)
            return
            }
            setType(data.assessment_type ?? "")
            setPhysiotherapist(data.physiotherapist ?? "")
            setWalking(data.walking_ability ?? "")
            setResult(data.time_to_complete ? data.time_to_complete.toString() : "")
            setDate(data.assessment_date ?? "")
            // setTime ไม่ต้อง prefill เพราะเป็นเวลาของวันใหม่
            setTimeselect(data.safety_classification ?? "")
            setDevice(data.assistive_device ?? "")
            setDirection(data.return_direction ?? "")
            setOtherVisual(data.visual_aids ?? "")

        }
        prefillFromLastVisit()
    }, []) 

    const handleSave = async () => {
        setSaving(true);
        try{
        const { error } = await supabase.from('tug_assessments').insert({
            patient_hn: patient[0].HN,
            patient_name: patient[0].name,
            assessment_date: date || null,
            assessment_time: time || null,
            assessment_type: type || null,
            physiotherapist: physiotherapist || null,
            walking_ability: walking || null,
            time_to_complete: result ? parseFloat(result) : null,
            safety_classification: timeselect || null,
            assistive_device: device || null,
            return_direction: direction || null,
            visual_aids: otherVisual || null,
        })
       setSaving(false);
      if (error) showToast("เกิดข้อผิดพลาด: " + error.message, "error");
      else showToast("บันทึกข้อมูลสำเร็จ!", "success");
    } catch (err: any) {
      setSaving(false);
      showToast(err.message ?? "เกิดข้อผิดพลาด", "error");
    }
        }

    return(
        <div className="min-h-screen bg-gray-100 font-sans">
                      <nav className="bg-white flex justify-start">
                        <StatusModal
                        show={toast.show}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
                    />
                              <p className='flex items-end gap-5 bg-white w-full px-4 mb-5'>
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
                                      </p>
                      
                            </nav>
                      <div className='max-w-5xl mx-auto px-4 py-6'>      
                      <div className='p-2'></div>
                      <div className="bg-white p-6 rounded-2xl shadow-md mx-auto mx-auto text-red-500">
            
                        <h2 className="text-xl font-bold mb-4">{patient[0].name}</h2>
            
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p className="font-bold">HN</p>
                          <p>{patient[0].HN}</p>
            
                          <p className="font-bold">Date of Birth</p>
                          <p>{patient[0].birth}</p>
            
                          <p className="font-bold">Admit</p>
                          <p>{patient[0].admit}</p>
            
                          <p className="font-bold">Gender</p>
                          <p>{patient[0].gender}</p>
            
                          <p className="font-bold">Allergies</p>
                          <p>{patient[0].allergies}</p>
                        </div>
            </div>
                        
                        <div className='flex items-start justify-start bg-white mx-auto rounded-sm mt-10 shadow-md px-6 py-4 gap-10'>
                            {/* Assessment Date & Time */}
                            <div className='flex flex-col gap-2'>
                                <label className='text-sm text-gray-500'>Assessment Date & Time</label>
                                <div className='flex items-center gap-2'>
                                <input
                                    type='date'
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className='border border-gray-300 text-gray-500 text-sm rounded px-2 py-1 w-36'
                                />
                                <input
                                    type='time'
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className='border border-gray-300 text-gray-500 text-sm rounded px-2 py-1 w-28'
                                />
                                </div>
                            </div>

                            {/* Divider */}
                            <div className='w-px bg-gray-200 self-stretch' />

                            {/* Assessment Type */}
                            <div className='flex flex-col gap-2'>
                                <label className='text-sm text-gray-500'>Assessment Type</label>
                                <div className='grid grid-cols-2 gap-x-6 gap-y-2'>
                                {typeoptions.map((option) => (
                                    <div key={option.key} className='flex items-center gap-2'>
                                    <input
                                        type='radio'
                                        id={option.key}
                                        name='type'
                                        value={option.key}
                                        checked={type === option.key}
                                        onChange={(e) => setType(e.target.value)}
                                        className='h-4 w-4 border border-gray-400 text-blue-600 focus:ring-blue-500'
                                    />
                                    <label htmlFor={option.key} className='text-sm text-gray-500'>
                                        {option.label}
                                    </label>
                                    </div>
                                ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 flex-1 relative">  {/* ← เพิ่ม relative */}
                                <label className="text-sm text-gray-500">Pysiotherapist</label>
                                <input
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                                    value={physiotherapist}
                                    onChange={(e) => {
                                    setPhysiotherapist(e.target.value)
                                    setShow(true)
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
                                            setPhysiotherapist(item)
                                            setShow(false)
                                        }}
                                        >
                                        {item}
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>

                            </div>

                            <p className='mt-7'></p>
                            <div className='bg-gray-100 mx-auto border items-center rounded-sm border-gray-300 px-4 py-3'>
                                <label className='text-2xl font-bold text-black'>🚶‍♀️‍➡️ Patient Walking Ability</label>
                                </div>
                                <div className='bg-white mx-auto shadow-md px-6 py-4'>
                                <label className='block text-sm text-gray-500 mb-3'>Is the patient able to walk?</label>
                                <div className='flex flex-row gap-10 items-center'>
                                    {walkoptions.map((option) => (
                                    <div key={option.key} className='flex items-center gap-6  border border-gray-300 rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors'>
                                        <input
                                        type='radio'
                                        id={option.key}
                                        name='walking'
                                        value={option.key}
                                        checked={walking === option.key}
                                        onChange={(e) => setWalking(e.target.value)}
                                        className='h-4 w-4 border border-gray-400 text-blue-600 focus:ring-blue-500'
                                        />
                                        <label htmlFor={option.key} className='text-sm text-gray-500'>{option.label}</label>
                                    </div>
                                    ))}
                                </div>
                                </div>

                                <p className='mt-7'></p>
                                <div className='bg-gray-100 mx-auto border items-center rounded-sm border-gray-300 px-4 py-3'>
                                <label className='text-2xl font-bold text-black'>⏱️ Assessment Result</label>
                                </div>
                                <div className='bg-white mx-auto shadow-md px-6 py-4'>
                                <label className='block text-sm text-gray-500 mb-3'>Time to Complete (Seconds)</label>

                                {/* Input with SEC unit */}
                                <div className='flex items-center border border-gray-300 rounded-sm w-60 bg-gray-50 px-3 py-3 gap-2'>
                                    {/* <span className='text-2xl font-bold text-gray-700 flex-1'>{showWalk || '0.00'}</span> */}
                                    <span className='text-xs text-gray-400 font-semibold'>SEC</span>
                                    <input
                                    type='number'
                                    value={showWalk}
                                    onChange={(e) => setShowWalk(e.target.value)}
                                    className='text-2xl font-bold text-gray-700 w-full bg-transparent focus:outline-none'
                                    />
                                </div>

                                {/* Safety Range Classification */}
                                <label className='block text-sm font-semibold text-gray-700 mt-5 mb-3'>Safety Range Classification</label>
                                <div className='flex flex-row gap-4'>
                                    {timeoptions.map((option) => (
                                    <div
                                        key={option.key}
                                        onClick={() => setTimeselect(option.key)}
                                        className={`flex flex-col gap-2 border rounded-md px-4 py-3 cursor-pointer flex-1 transition-colors
                                        ${timeselect === option.key ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        <input
                                        type='radio'
                                        id={option.key}
                                        name='Timeoptions'
                                        value={option.key}
                                        checked={timeselect === option.key}
                                        onChange={(e) => setTimeselect(e.target.value)}
                                        className='h-4 w-4 border border-gray-400 text-blue-600 focus:ring-blue-500'
                                        />
                                        <label htmlFor={option.key} className={`text-sm font-bold cursor-pointer ${option.color}`}>
                                        {option.label}
                                        </label>
                                        <p className='text-xs text-gray-400'>{option.description}</p>
                                    </div>
                                    ))}
                                </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4 mt-6'>
                                    <div className='bg-gray-100 rounded-sm w-full bordr border-gray-300'>
                                    <label className='text-2xl text-black block font-bold px-4 pt-3 border border-gray-300 rounded-sm'>🧑‍🦯‍➡️Assistive Device Used</label>
                                    <div className='bg-white mx-auto w-full gap-4 p-4 rounded-sm flex flex-col shadow-md'>
                                            {deviceoptions.map((option) => (
                                                <div key={option.key}>
                                                    <input
                                                        type='radio'
                                                        id={option.key}
                                                        name='Deviceoptions'
                                                        value={option.key}
                                                        checked={device === option.key}
                                                        onChange={(e) => setDevice(e.target.value)}
                                                        className='h-4 w-4 border border-gray-400 text-blue-600 focus:ring-blue-500'
                                                    />
                                                    <label htmlFor={option.key} className='ml-2 text-sm text-gray-500 cursor-pointer'>
                                                        {option.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className='bg-gray-100 border rounded-sm border-gray-300 w-full'>
                                        <label className='text-2xl text-black block font-bold mb-2'>⤴️Return Direction</label>
                                        <div className='bg-white mx-auto w-full gap-4 p-4 rounded-sm border-t border-gray-300 shadow-md'>
                                            <div className='flex flex-row justify-around '>
                                            {directionoptions.map((option) => (
                                                <div key={option.key} className='flex flex-row border border-gray-300 rounded-sm px-8 py-8 cursor-pointer hover:bg-gray-50 transition-colors'>
                                                    <input
                                                        type='radio'
                                                        id={option.key}
                                                        name='Directionoptions'
                                                        value={option.key}
                                                        checked={direction === option.key}
                                                        onChange={(e) => setDirection(e.target.value)}
                                                        className='flex h-4 w-4 border border-gray-400 text-blue-600 focus:ring-blue-500'
                                                    />
                                                    <label htmlFor={option.key} className='flex ml-2 text-md text-gray-500 cursor-pointer'>
                                                        {option.label}
                                                    </label>
                                                </div>
                                            ))}
                                            </div>
                                            <div className='flex flex-col mt-4 mb-4 boder border-b border-gray-100'></div>
                                            <label className='text-sm font-medium text-gray-600'>Visual AIDS</label>
                                            <div className='flex flex-row justify-around '>
                                            {otherVisualoptions.map((option) => (
                                                <div
                                                    key={option.key}
                                                    onClick={() => setOtherVisual(option.key)}
                                                    className={`flex flex-row rounded-sm px-8 py-3 cursor-pointer transition-colors
                                                        ${otherVisual === option.key ? 'border border-blue-400 bg-blue-50' : 'border border-gray-300 hover:bg-gray-50'}`}
                                                    >
                                                    <input
                                                    type="radio"
                                                    id={option.key}
                                                    name="otherVisual"
                                                    value={option.key}
                                                    checked={otherVisual === option.key}
                                                    onChange={(e) => setOtherVisual(e.target.value)}
                                                    className='h-4 w-4 border border-gray-400 text-blue-600 focus:ring-blue-500'
                                                    />
                                                    <label htmlFor={option.key} className='ml-2 text-sm text-gray-500 cursor-pointer'>
                                                        {option.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                </div>
                                </div>
                                <div className="flex justify-end">
                                <button
                                type="button"
                                onClick={handleSave}
                                className="mt-6 w-20 bg-blue-600 text-white py-3 rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition-colors"
                            >
                                Save
                            </button>
                            </div>
        
        </div>
        </div>
    )

}
