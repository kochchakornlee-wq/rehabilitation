"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Mode = "login" | "signup" | "forgot"

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const router = useRouter()

  // Login state
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // Signup state
  const [signupUsername, setSignupUsername] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("")

  const handleLogin = async () => {
    setError("")
    setLoading(true)
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const result = await res.json()
    setLoading(false)
    if (!res.ok) setError(result.error)
    else router.push("/")
  }

  const handleSignup = async () => {
    setError("")
    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: signupUsername, email: signupEmail, password: signupPassword }),
    })
    const result = await res.json()
    setLoading(false)
    if (!res.ok) setError(result.error)
    else { alert("สมัครสำเร็จ!"); setMode("login") }
  }

  const handleForgot = async () => {
    setError("")
    setLoading(true)
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    })
    setLoading(false)
    setForgotSent(true)
  }

  const isLogin = mode === "login"

  return (
    <div className="flex h-screen w-full overflow-hidden relative bg-white">
      <video className="absolute inset-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline>
        <source src="/background-2.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute top-[-1800px] w-[3000px] h-[3000px] bg-blue-500 rounded-full transition-all duration-700 ease-in-out z-0"
        style={{ left: isLogin ? "-2200px" : "calc(100% - 1000px)" }}
      />

      {/* ฝั่งซ้าย */}
      <div className="w-1/2 flex items-center justify-center relative z-10">

        {/* Login form */}
        <div className={`absolute transition-all duration-500 w-80 ${mode === "login" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20 pointer-events-none"}`}>
          <h2 className="text-6xl font-bold pb-6 mb-6 text-white">Sign in</h2>
          <input
            className="w-full border border-gray-300 rounded-full px-4 py-2 mb-3 text-base"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="w-full border border-gray-300 rounded-full px-4 py-2 mb-2 text-base"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button onClick={() => { setMode("forgot"); setError("") }} className="text-sm text-white hover:underline block mb-4">
            forgot password?
          </button>
          {error && <p className="text-red-300 text-sm mb-2">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-white text-blue-500 rounded-full py-3 text-base font-bold hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "LOGIN"}
          </button>
        </div>

        {/* Forgot password form */}
        <div className={`absolute transition-all duration-500 w-80 ${mode === "forgot" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20 pointer-events-none"}`}>
          {forgotSent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📧</div>
              <h2 className="text-3xl font-bold text-white mb-3">เช็คอีเมลได้เลย!</h2>
              <p className="text-white text-sm mb-6">ถ้าอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตให้ภายใน 30 นาที</p>
              <button onClick={() => { setMode("login"); setForgotSent(false); setForgotEmail("") }}
                className="w-full bg-white text-blue-500 rounded-full py-3 font-bold hover:bg-blue-600 hover:text-white">
                กลับไป Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-2 text-white">Forgot Password?</h2>
              <p className="text-white text-sm mb-6">กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์รีเซ็ตให้</p>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-full px-4 py-2 mb-4 text-base"
                placeholder="Email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
              {error && <p className="text-red-300 text-sm mb-2">{error}</p>}
              <button onClick={handleForgot} disabled={loading}
                className="w-full bg-white text-blue-500 rounded-full py-3 font-bold hover:bg-blue-600 hover:text-white disabled:opacity-50 mb-3">
                {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
              </button>
              <button onClick={() => { setMode("login"); setError("") }}
                className="w-full text-white text-sm hover:underline">
                ← กลับไป Login
              </button>
            </>
          )}
        </div>

        {/* One of us (แสดงตอน signup) */}
        <div className={`absolute transition-all duration-500 text-center w-80 flex flex-col items-center ${mode === "signup" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20 pointer-events-none"}`}>
          <img src="https://media.tenor.com/xYHLtGhDlvkAAAAi/pixel-duck.gif" alt="pixel duck" className="w-32 h-32 object-contain mb-4" />
          <h3 className="text-white text-5xl font-bold mb-2">One of us?</h3>
          <p className="text-white text-base mb-6">Welcome back! Log in to continue.</p>
          <button onClick={() => { setMode("login"); setError("") }}
            className="border-2 border-white text-white rounded-full px-8 py-2 text-sm font-medium hover:bg-white hover:text-blue-500 transition-colors">
            SIGN IN
          </button>
        </div>
      </div>

      {/* ฝั่งขวา */}
      <div className="w-1/2 flex items-center justify-center relative z-10">

        {/* New here (แสดงตอน login/forgot) */}
        <div className={`absolute transition-all duration-500 mt-10 text-center flex flex-col items-center ${mode !== "signup" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20 pointer-events-none"}`}>
          <img src="https://media.tenor.com/xYHLtGhDlvkAAAAi/pixel-duck.gif" alt="pixel duck" className="w-32 h-32 object-contain mb-4" />
          <h3 className="text-white text-5xl font-bold mb-2">New here?</h3>
          <p className="text-white text-base mb-6">Create your account and join us today!</p>
          <button onClick={() => { setMode("signup"); setError("") }}
            className="border-2 border-white text-white rounded-full px-8 py-2 text-sm font-medium hover:bg-white hover:text-blue-500 transition-colors">
            SIGN UP
          </button>
        </div>

        {/* Signup form */}
        <div className={`absolute transition-all duration-500 w-80 ${mode === "signup" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20 pointer-events-none"}`}>
          <h2 className="text-7xl font-bold mb-6 mr-10">Sign up</h2>
          <input className="w-full border border-gray-300 rounded-full px-4 py-3 mb-3 text-base" placeholder="Username"
            value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} />
          <input className="w-full border border-gray-300 rounded-full px-4 py-3 mb-3 text-base" placeholder="Email"
            value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
          <input type="password" className="w-full border border-gray-300 rounded-full px-4 py-3 mb-4 text-base" placeholder="Password"
            value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button onClick={handleSignup} disabled={loading}
            className="w-full bg-white text-blue-500 rounded-full py-3 text-base font-bold hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50">
            {loading ? "กำลังสมัคร..." : "SIGN UP"}
          </button>
        </div>
      </div>
    </div>
  )
}
