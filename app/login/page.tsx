"use client"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"



export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()


  const [username, setUsername] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")


  const handleLogin = async () => {
  setError("")
  setLoading(true)

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  setLoading(false)
  if (error) {
    setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
  } else {
    router.push("/")  // ไปหน้า home
  }
}


const handleSignup = async () => {
  setError("")
  setLoading(true)

  const { error } = await supabase.auth.signUp({
    email: signupEmail,
    password: signupPassword,
    options: {
      data: {
        username: username, // เก็บใน user metadata
      },
    },
  })

  setLoading(false)

  if (error) {
    setError(error.message)
  } else {
    alert("สมัครสำเร็จ! กรุณาเช็คอีเมลเพื่อยืนยัน")
    setIsLogin(true)
  }
}

  return (
    <div className="flex h-screen w-full overflow-hidden relative bg-white">
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/background-2.mp4" type="video/mp4" />
      </video>

      {/* วงกลม — ต้องมี transition-all และ class ไม่ชนกัน */}
      <div
        className="absolute top-[-1800px] w-[3000px] h-[3000px] bg-blue-500 rounded-full transition-all duration-700 ease-in-out z-0"
        style={{
          left: isLogin ? "-2200px" : "calc(100% - 1000px)"
        }}
      />

      {/* ฝั่งซ้าย — form */}
      {/* ฝั่งซ้าย — form + One of us? */}
        <div className="w-1/2 flex items-center justify-center relative z-10">

          {/* Sign in form */}
          <div className={`absolute transition-all duration-500 w-80 ${
            isLogin ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20 pointer-events-none"
          }`}>
            <h2 className="text-6xl font-bold pb-6 mb-6 text-white">Sign in</h2>
            <input className="w-full border border-gray-300 rounded-full px-4 py-2 mb-3 text-base" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input className="w-full border border-gray-300 rounded-full px-4 py-2 mb-2 text-base" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
            <a href="#" className="text-sm text-white hover:underline block mb-4">forgot password?</a>
            {error && <p className="text-red-300 text-sm mb-2">{error}</p>}
            <button className="w-full bg-white text-blue-500 rounded-full py-3 text-base cursor-point font-bold hover:bg-blue-600 hover:text-white transition-colors" onClick={handleLogin} disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "LOGIN"}
              
            </button>
          </div>
          

          {/* ======================================
              One of us? — อยู่ใน div เดียวกัน
              จะได้อยู่กึ่งกลางฝั่งซ้ายพอดี
              ====================================== */}
              
          {/* ฝั่งซ้าย — "One of us?" + gif รวมกัน */}
          <div className={`absolute transition-all duration-500 text-center w-80 flex flex-col items-center ${
            !isLogin ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20 pointer-events-none"
          }`}>
            {/* gif อยู่บน */}
            <img
              src="https://media.tenor.com/xYHLtGhDlvkAAAAi/pixel-duck.gif"
              alt="pixel duck"
              className="w-32 h-32 object-contain mb-4"
            />
            <h3 className="text-white text-5xl font-bold mb-2">One of us?</h3>
            <p className="text-white text-base mb-6">Welcome back! Log in to continue.</p>
            <button
              onClick={() => setIsLogin(true)}
              className="border-2 border-white text-white rounded-full px-8 py-2 text-sm font-medium hover:bg-white hover:text-blue-500 transition-colors"
            >
              SIGN IN
            </button>
          </div>

        </div>


      {/* ฝั่งขวา — รูปภาพ + ปุ่มสลับ */}
      <div className="w-1/2 flex items-center justify-center relative z-10">
        <div className={`absolute transition-all duration-500 mt-10 text-center flex flex-col items-center ${
          isLogin ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20 pointer-events-none"
        }`}>
          <img
            src="https://media.tenor.com/xYHLtGhDlvkAAAAi/pixel-duck.gif"
            alt="pixel duck"
            className="w-32 h-32 object-contain mb-4"
          />
          <h3 className="text-white text-5xl font-bold mb-2">New here?</h3>
          <p className="text-white text-base mb-6">Create your account and join us today!</p>
          <button
            onClick={() => setIsLogin(false)}
            className="border-2 border-white text-white rounded-full px-8 py-2 text-sm font-medium hover:bg-white hover:text-blue-500 transition-colors"
          >
            SIGN UP
          </button>
        </div>

{/* ลบ div gif แยกฝั่งขวาทิ้งด้วย */}

        {/* ตอน Signup*/}
        <div className={`absolute transition-all duration-500 w-80 ${
          !isLogin ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20 pointer-events-none"
        }`}>
          <div className="">
          <h2 className="text-7xl font-bold mb-6 mr-10">Sign up</h2>
          <input
            className="w-full border border-gray-300 rounded-full px-4 py-3 mb-3 text-base"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="w-full border border-gray-300 rounded-full px-4 py-3 mb-3 text-base"
            placeholder="Email"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
          />

          <input
            className="w-full border border-gray-300 rounded-full px-4 py-3 mb-4 text-base"
            type="password"
            placeholder="Password"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
          />
          <button
            onClick={handleSignup}
            className="w-full bg-white text-blue-500 rounded-full py-3 text-base font-bold hover:bg-blue-600 hover:text-white transition-colors"
          >
            {loading ? "กำลังสมัคร..." : "SIGN UP"}
          </button>
          </div>
        </div>

      </div>

    </div>
  )
}
