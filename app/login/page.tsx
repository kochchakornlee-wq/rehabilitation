"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Mode = "login" | "signup" | "forgot"

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)

  const [signupUsername, setSignupUsername] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirm, setSignupConfirm] = useState("")
  const [showSignupPass, setShowSignupPass] = useState(false)
  const [showSignupConfirm, setShowSignupConfirm] = useState(false)

  const [forgotEmail, setForgotEmail] = useState("")

  const isLogin = mode === "login"

  const handleLogin = async () => {
    setError("")
    if (!username || !password) {
      setError("กรุณากรอกข้อมูลให้ครบ")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      let result: any = {}
      try {
        result = await res.json()
      } catch {
        result = {}
      }

      if (!res.ok) {
        setError(result.error ?? "เข้าสู่ระบบไม่สำเร็จ")
        return
      }

      router.push("/")
    } catch {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    setError("")
    if (!signupUsername || !signupEmail || !signupPassword || !signupConfirm) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง"); return
    }
    if (signupPassword.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    if (!passwordRegex.test(signupPassword)) {
      setError("รหัสผ่านต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ (@$!%*?&) อย่างน้อย 1 ตัว")
      return
    }
    if (signupPassword !== signupConfirm) {
      setError("รหัสผ่านไม่ตรงกัน"); return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง"); return
    }
    // TODO: เปิดตอนได้โดเมนโรงพยาบาล
    // const ALLOWED_DOMAIN = "@siriroj.com"  // เปลี่ยนเป็นโดเมนจริง
    // if (!signupEmail.endsWith(ALLOWED_DOMAIN)) {
    //   setError(`กรุณาใช้อีเมลโรงพยาบาลเท่านั้น (xxx${ALLOWED_DOMAIN})`)
    //   return
    // }
    setLoading(true)

    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: signupUsername, email: signupEmail, password: signupPassword }),
      })

      let result: any = {}
      try {
        result = await res.json()
      } catch {
        result = {}
      }

      if (!res.ok) {
        setError(result.error ?? "สมัครสมาชิกไม่สำเร็จ")
        return
      }

      setMode("login")
      setError("")
      alert("สมัครสำเร็จ! กรุณาเข้าสู่ระบบ")
    } catch {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้")
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async () => {
    if (!forgotEmail) return
    setLoading(true)
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    })
    setLoading(false)
    setForgotSent(true)
  }

  const closeForgot = () => {
    setShowForgot(false)
    setForgotSent(false)
    setForgotEmail("")
  }

  const EyeIcon = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button
      type="button"
      onClick={toggle}
      style={{
        position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", cursor: "pointer", padding: "4px",
        color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center",
      }}
      aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
    >
      {show ? (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.83M9.363 5.365A9.466 9.466 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.453 9.453 0 01-2.756 4.244M9.878 9.88A3 3 0 0014.12 14.12" strokeLinecap="round"/>
          <path d="M3 3s2.647 3.294 4.5 5.5M21 21s-2.647-3.294-4.5-5.5" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  )

  const inputBase: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "12px", padding: "13px 16px", fontSize: "15px", color: "white",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
  }
  const inputWithEye: React.CSSProperties = { ...inputBase, paddingRight: "44px" }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", position: "relative", background: "#0a0a0a" }}>
      <video
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, opacity: 0.5 }}
        autoPlay loop muted playsInline
      >
        <source src="/background-2.mp4" type="video/mp4" />
      </video>

      {/* overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(37,99,235,0.55) 0%, rgba(0,0,0,0.4) 100%)", zIndex: 1 }} />

      {/* animated circle */}
      <div style={{
        position: "absolute", top: "-1800px", width: "3000px", height: "3000px",
        background: "rgba(37,99,235,0.85)", borderRadius: "50%", zIndex: 1,
        transition: "left 0.7s cubic-bezier(0.4,0,0.2,1)",
        left: isLogin ? "-1800px" : "calc(100% - 1200px)",
      }} />

      {/* ฝั่งซ้าย */}
      <div style={{ width: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2 }}>

        {/* Login form */}
        <div style={{
          position: "absolute", width: "320px", transition: "all 0.5s",
          opacity: mode === "login" ? 1 : 0,
          transform: mode === "login" ? "translateX(0)" : "translateX(-60px)",
          pointerEvents: mode === "login" ? "auto" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", letterSpacing: "0.05em" }}>SIRIROJ REHAB</span>
          </div>
          <h2 style={{ fontSize: "48px", fontWeight: 700, color: "white", margin: "0 0 6px", lineHeight: 1.1 }}>Welcome<br/>back</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: "0 0 28px" }}>เข้าสู่ระบบด้วยบัญชีของคุณ</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>USERNAME</label>
              <input
                style={inputBase} placeholder="ชื่อผู้ใช้"
                value={username} onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input
                  style={inputWithEye} type={showPass ? "text" : "password"} placeholder="รหัสผ่าน"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <EyeIcon show={showPass} toggle={() => setShowPass(!showPass)} />
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForgot(true)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: "13px", cursor: "pointer", padding: "8px 0 0", display: "block" }}
          >
            ลืมรหัสผ่าน?
          </button>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "10px", padding: "10px 14px", marginTop: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
              <svg width="14" height="14" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <p style={{ color: "#fca5a5", fontSize: "13px", margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin} disabled={loading}
            style={{
              width: "100%", background: "white", color: "#2563eb", border: "none",
              borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", marginTop: "20px",
              opacity: loading ? 0.7 : 1, transition: "all 0.2s", letterSpacing: "0.03em",
            }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </div>

        {/* One of us (signup side) */}
        <div style={{
          position: "absolute", width: "320px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center",
          transition: "all 0.5s", opacity: mode === "signup" ? 1 : 0,
          transform: mode === "signup" ? "translateX(0)" : "translateX(-60px)",
          pointerEvents: mode === "signup" ? "auto" : "none",
        }}>
          <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzBvbDl2NHlkdTR1aHF1Y3hndHFxYXlxaWZyNWZ6MDJ0NmdmZTlmZSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/10IEUy0f5V3WLu/giphy.webp" alt="" className="w-28 h-28 object-contain mb-4" style={{ width: "112px", height: "112px", objectFit: "contain", marginBottom: "16px" }} />
          <h3 style={{ color: "white", fontSize: "40px", fontWeight: 700, margin: "0 0 8px" }}>มีบัญชีแล้ว?</h3>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", margin: "0 0 24px" }}>เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
          <button
            onClick={() => { setMode("login"); setError("") }}
            style={{ border: "1.5px solid rgba(255,255,255,0.6)", color: "white", background: "transparent", borderRadius: "50px", padding: "10px 32px", fontSize: "14px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em" }}
          >
            SIGN IN
          </button>
        </div>
      </div>

      {/* ฝั่งขวา */}
      <div style={{ width: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2 }}>

        {/* New here (login side) */}
        <div style={{
          position: "absolute", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center",
          transition: "all 0.5s", opacity: mode !== "signup" ? 1 : 0,
          transform: mode !== "signup" ? "translateX(0)" : "translateX(60px)",
          pointerEvents: mode !== "signup" ? "auto" : "none",
        }}>
          <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzBvbDl2NHlkdTR1aHF1Y3hndHFxYXlxaWZyNWZ6MDJ0NmdmZTlmZSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/10IEUy0f5V3WLu/giphy.webp" alt="" style={{ width: "112px", height: "112px", objectFit: "contain", marginBottom: "16px" }} />
          <h3 style={{ color: "white", fontSize: "40px", fontWeight: 700, margin: "0 0 8px" }}>ยังไม่มีบัญชี?</h3>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", margin: "0 0 24px" }}>สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>
          <button
            onClick={() => { setMode("signup"); setError("") }}
            style={{ border: "1.5px solid rgba(255,255,255,0.6)", color: "white", background: "transparent", borderRadius: "50px", padding: "10px 32px", fontSize: "14px", fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em" }}
          >
            SIGN UP
          </button>
        </div>

        {/* Signup form */}
        <div style={{
          position: "absolute", width: "320px", transition: "all 0.5s",
          opacity: mode === "signup" ? 1 : 0,
          transform: mode === "signup" ? "translateX(0)" : "translateX(60px)",
          pointerEvents: mode === "signup" ? "auto" : "none",
        }}>
          <h2 style={{ fontSize: "42px", fontWeight: 700, color: "white", margin: "0 0 4px" }}>สร้างบัญชี</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", margin: "0 0 20px" }}>สำหรับนักกายภาพบำบัดเท่านั้น</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", letterSpacing: "0.06em", display: "block", marginBottom: "5px" }}>USERNAME</label>
              <input style={inputBase} placeholder="ชื่อผู้ใช้" value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} />
            </div>
            <div>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", letterSpacing: "0.06em", display: "block", marginBottom: "5px" }}>EMAIL</label>
              <input style={inputBase} type="email" placeholder="อีเมลโรงพยาบาล" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", letterSpacing: "0.06em", display: "block", marginBottom: "5px" }}>PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input style={inputWithEye} type={showSignupPass ? "text" : "password"} placeholder="อย่างน้อย 8 ตัวอักษร" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                <EyeIcon show={showSignupPass} toggle={() => setShowSignupPass(!showSignupPass)} />
              </div>
            </div>
            <div>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", letterSpacing: "0.06em", display: "block", marginBottom: "5px" }}>CONFIRM PASSWORD</label>
              <div style={{ position: "relative" }}>
                <input style={{ ...inputWithEye, borderColor: signupConfirm && signupConfirm !== signupPassword ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.25)" }} type={showSignupConfirm ? "text" : "password"} placeholder="ยืนยันรหัสผ่าน" value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} />
                <EyeIcon show={showSignupConfirm} toggle={() => setShowSignupConfirm(!showSignupConfirm)} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "10px", padding: "10px 14px", marginTop: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
              <svg width="14" height="14" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <p style={{ color: "#fca5a5", fontSize: "13px", margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleSignup} disabled={loading}
            style={{
              width: "100%", background: "white", color: "#2563eb", border: "none",
              borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", marginTop: "16px",
              opacity: loading ? 0.7 : 1, letterSpacing: "0.03em",
            }}
          >
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "20px", padding: "36px", width: "360px", maxWidth: "90vw",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          }}>
            {forgotSent ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "56px", height: "56px", background: "rgba(37,99,235,0.2)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="26" height="26" fill="none" stroke="#60a5fa" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 style={{ color: "white", fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>เช็คอีเมลของคุณ</h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", lineHeight: 1.6, margin: "0 0 24px" }}>
                  ถ้าอีเมลนี้มีในระบบ เราจะส่งลิงก์รีเซ็ตให้ภายใน 30 นาที
                </p>
                <button onClick={closeForgot} style={{ width: "100%", background: "#2563eb", color: "white", border: "none", borderRadius: "12px", padding: "13px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
                  รับทราบ
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ color: "white", fontSize: "22px", fontWeight: 700, margin: "0 0 4px" }}>รีเซ็ตรหัสผ่าน</h3>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: 0 }}>กรอกอีเมลที่ลงทะเบียนไว้</p>
                  </div>
                  <button onClick={closeForgot} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
                <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>EMAIL</label>
                <input
                  type="email" placeholder="your@email.com"
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleForgot()}
                  style={{ ...inputBase, marginBottom: "16px" }}
                />
                <button
                  onClick={handleForgot} disabled={loading || !forgotEmail}
                  style={{
                    width: "100%", background: "#2563eb", color: "white", border: "none",
                    borderRadius: "12px", padding: "13px", fontSize: "15px", fontWeight: 600,
                    cursor: loading || !forgotEmail ? "not-allowed" : "pointer",
                    opacity: loading || !forgotEmail ? 0.6 : 1,
                  }}
                >
                  {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}