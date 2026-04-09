"use client"

import Image from 'next/image'
import { use } from 'react'
import { useRouter } from 'next/navigation'


type PatientCardProps = {
  name: string
  HN: string
  birth: string
  admit: string
  gender: string
  allergies: string
}

function PatientCard({name, HN, birth, admit, gender, allergies}: PatientCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border-t-4 border-blue-500">
      <p className="text-2xl font-bold text-slate-800">{name}</p>
      <p className="text-sm text-slate-500 mt-1">HN: {HN}</p>
      <p className="text-sm text-slate-500 mt-1">Birth: {birth}</p>
      <p className="text-sm text-slate-500 mt-1">Admit: {admit}</p>
      <p className="text-sm text-slate-500 mt-1">Gender: {gender}</p>
      <p className="text-sm text-slate-500 mt-1">Allergies: {allergies}</p>
    </div>
  )
}   

export default function PatientForm() {

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
    return(
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white px-10 py-3 flex justify-start p-4">
                  <div>
                    <Image src="/Hospital logo.svg" alt="Hospital Logo" width={100} height={50}></Image>
                  </div>
                  <p>
                    <a href='/' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                      Home
                    </a>
                    <a href='/patient' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                      Patient Form
                    </a>
                  </p>
          
                </nav>
          <div className='p-2'></div>
          <div className="bg-white p-6 rounded-2xl shadow-md w-300 mx-auto text-blue-900">

            <h2 className="text-xl font-bold mb-4">{patient[0].name}</h2>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-blue-900 font-bold">HN</p>
              <p>{patient[0].HN}</p>

              <p className="text-blue-900 font-bold">Date of Birth</p>
              <p>{patient[0].birth}</p>

              <p className="text-blue-900 font-bold">Admit</p>
              <p>{patient[0].admit}</p>

              <p className="text-blue-900 font-bold">Gender</p>
              <p>{patient[0].gender}</p>

              <p className="text-blue-900 font-bold">Allergies</p>
              <p>{patient[0].allergies}</p>
            </div>

          </div>
          <div className='p-2'></div>
          <main className="p-6 flex flex-col gap-6">
            <div className='bg-white p-6 rounded-xl w-300 mx-auto'>
              <div className="grid grid-cols-4 gap-4">

                

<div className="bg-neutral-primary-soft block max-w-sm border border-default rounded-xl shadow-xs 
  transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-400 cursor-pointer overflow-hidden">
    <a href="/patientForm1">
        <img className="w-full h-48 object-coverrounded-t-md transition-transform duration-300 hover:scale-105" src="/OPD.jpg" alt="opd" />
    </a>
    <div className="p-6 text-center">
        <a href="/patientForm1">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xl font-semibold block w-fit">OPD</span>
          <p className='bg-white p-2'></p>       
          <h6 className='text-gray-400 text-sm text-justify'>OPD  Assessment Physiotherapy Department</h6>
        </a>
        <p className='bg-white p-2'></p>  
        <a href="/patientForm1" className="inline-flex items-center text-white bg-blue-500 box-border rounded-xl border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
            Select
            <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
        </a>
    </div>
</div>

<div className="bg-neutral-primary-soft block max-w-sm border border-default rounded-xl shadow-xs 
  transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-400 cursor-pointer overflow-hidden">
    <a href="/IPDForm">
        <img className="w-full h-48 object-cover rounded-t-md transition-transform duration-300 hover:scale-105" src="/IPD.jpg" alt="ipd" />
    </a>
    <div className="p-6 text-center">
        <a href="/IPDForm">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xl font-semibold block w-fit">IPD</span>
          <p className='bg-white p-2'></p>       
          <h6 className='text-gray-400 text-sm text-justify'>IPD  Assessment Physiotherapy Department</h6>
        </a>
        <p className='bg-white p-2'></p>  
        <a href="/IPDForm" className="inline-flex items-center text-white bg-blue-500 box-border rounded-xl border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
            Select
            <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
        </a>
    </div>
</div>

<div className="bg-neutral-primary-soft block max-w-sm border border-default rounded-xl shadow-xs 
  transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-400 cursor-pointer overflow-hidden">
    <a href="/first_visit">
        <img className="w-full h-48 object-cover rounded-t-md transition-transform duration-300 hover:scale-105" src="/fam-rec.jpg" alt="ipd" />
    </a>
    <div className="p-6 text-center">
        <a href="/first_visit">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xl font-semibold block w-fit">Record</span>
          <p className='bg-white p-2'></p>       
          <h6 className='text-gray-400 text-sm text-justify'>Patient and Family Education Record</h6>
        </a>
        <p className='bg-white p-2'></p>  
        <a href="/first_visit" className="inline-flex items-center text-white bg-blue-500 box-border rounded-xl border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
            Select
            <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
        </a>
    </div>
</div>

<div className="bg-neutral-primary-soft block max-w-sm border border-default rounded-xl shadow-xs 
  transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-400 cursor-pointer overflow-hidden">
    <a href="/discharge">
        <img className="w-full h-48 object-cover rounded-t-md transition-transform duration-300 hover:scale-105" src="/discharge.jpg" alt="discharge" />
    </a>
    <div className="p-6 text-center">
        <a href="/discharge">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xl font-semibold block w-fit">Discharge</span>
          <p className='bg-white p-2'></p>       
          <h6 className='text-gray-400 text-sm text-justify'>Discharge Summary Physiotherapy Department</h6>
        </a>
        <p className='bg-white p-2'></p>  
        <a href="/discharge" className="inline-flex items-center text-white bg-blue-500 box-border rounded-xl border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
            Select
            <svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
        </a>
    </div>
</div>

              </div>
              
            </div>
          </main>
          </div>

        
    )
    
}