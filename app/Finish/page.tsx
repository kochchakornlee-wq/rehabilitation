"use client"
import Image from "next/image";
import Lottie from "lottie-react";
import Checkmark from "@/public/Checkmark.json";
import { useRouter } from "next/navigation";

export default function Finish() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-100">
      
      <div className='flex items-end gap-5 bg-white px-4 py-4'>
        <Image
          src="/Hospital logo.svg"
          alt="Hospital Logo"
          width={120}
          height={40}
        />
        <a href='/' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                    Home
                </a>
                <a href='/patient' className='ml-10 text-gray-400 text-sm hover:text-blue-700 hover:underline transition-colors'>
                    Patient Form
                </a>
      </div>

      <div className="bg-white rounded-2xl mx-auto w-1/2 p-4 shadow-md mt-10">
        <div className="flex flex-col items-center">
            <div className="w-60">
        <Lottie animationData={Checkmark} loop={false} />
      </div>
          <label className="text-3xl font-bold text-blue-900">
            Save Success!
          </label>
          <label className="text-medium font-medium text-gray-400 mt-2">
            Inpatient Form has been saved successfully.
          </label>
          <button className="border-1 border-blue-800 text-blue-800 font-medium rounded-lg mt-5 px-8 py-2 text-sm cursor-pointer hover:bg-blue-800 hover:text-white hover:font-bold transition-colors " onClick={() => router.push("/patient")}>
            Back to Home
          </button>
        </div>
      </div>

    </div>
  );
}