"use client"

import Image from 'next/image'
import { use } from 'react'
import { useRouter } from 'next/navigation'

export default function OtherForm() {
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
            <div className="min-h-screen bg-gray-100 font-sans">
              <nav className="bg-white flex justify-start">
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
              <div className='p-2'></div>
              <div className="bg-white p-6 rounded-2xl shadow-md w-300 mx-auto text-red-500">
    
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
                <div className='p-2'></div>
                <div className='mx-auto bg-white w-300 rounded-xl shadow-md'>
                    <div className='flex items-center justify-center p-4'>
                        <p className='font-bold text-3xl text-blue-800'>Other Form Content</p>
                    </div>
                    <div className='grid grid-cols-2 gap-4 p-4'>
                    <div className='flex justify-center mt-10 ml-20'>
                        <a href='/Koos'>
                        <div className='flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300'>
                            
                                <img src="knee.jpg" alt="Knee Image" className='h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 ' />
                            
                            <p className='flex flex-col'>
                                
                            <label className='block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600'>Knee Form</label>
                            
                                <label className='text-sm text-gray-400 ml-7 cursor-pointer'>Knee and Osteoarthritis Outcome Score (KOOS)</label>
                            </p>
                        </div>
                        </a>
                    </div>
                    
                    <div className='flex justify-center mt-10 mr-20'>
                        <a href='/Hip17.1'>
                        <div className='flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300'>
                            
                                <img src="hip.jpg" alt="Hip Image" className='h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 ' />
                            
                            <p className='flex flex-col'>
                                
                            <label className='block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600'>Hip Form</label>
                                <label className='text-sm text-gray-400 ml-7 cursor-pointer'>Hip Disability And Osteoarthritis Outcome Score (HOOS)</label>
                            </p>
                        </div>
                        </a>
                    </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 p-4'>
                    <div className='flex justify-center mt-5 ml-20'>
                        <a href='/modify_rankin'>
                        <div className='flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300'>
                            
                                <img src="stroke.jpg" alt="Stroke Image" className='h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 ' />
                            
                            <p className='flex flex-col'>
                                
                            <label className='block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600'>Stroke Form</label>
                                <label className='text-sm text-gray-400 ml-7 cursor-pointer'>THE MODIFIED RANKIN SCALE</label>
                            </p>
                        </div>
                        </a>
                    </div>

                    <div className='flex justify-center mt-5 mr-20'>
                        <a href='/Barthel'>
                        <div className='flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300'>
                            
                                <img src="barthel.jpg" alt="Barthel Image" className='h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 ' />
                            
                            <p className='flex flex-col'>
                                
                            <label className='block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600'>Barthel Index</label>
                                <label className='text-sm text-gray-400 ml-7 cursor-pointer'>The Barthel Index of Activities of Daily Living</label>
                            </p>
                        </div>
                        </a>
                    </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 p-4'>
                    <div className='flex justify-center mt-5 ml-20'>
                        <a href='/timeup'>
                        <div className='flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300'>
                            
                                <img src="timeup.jpg" alt="Time-Up Test Image" className='h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 ' />
                            
                                <p className='flex flex-col'>
                                    
                            <label className='block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600'>Time-Up Test</label>
                                <label className='text-sm text-gray-400 ml-7 cursor-pointer'>THE TIME-UP TEST</label>
                            </p>
                        </div>
                        </a>
                    </div>

                    <div className='flex justify-center mt-5 mr-20'>
                        <a href='/cancer'>
                        <div className='flex border border-gray-200 rounded-lg w-[400px] bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow duration-300'>
                            
                                <img src="cancer.jpg" alt="Cancer Form Image" className='h-25 w-25 rounded-sm transition-transform duration-300 hover:scale-118 ' />
                            
                                <p className='flex flex-col'>
                                    
                            <label className='block text-lg font-bold ml-7 text-blue-800 mt-2 cursor-pointer hover:text-blue-600'>Cancer Form</label>
                                <label className='text-sm text-gray-400 ml-7 cursor-pointer'>Initial Assessment in Cancer Patient</label>
                            </p>
                        </div>
                        </a>
                    </div>
                    </div>

                </div>
    </div>
    )
}