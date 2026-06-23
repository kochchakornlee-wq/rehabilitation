"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) router.push("/login")
  }, [token])

  const handleReset = async () => {
    setError("")
    if (password.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return }
    if (password !== confirm) { setError("รหัสผ่านไม่ตรงกัน"); return }

    setLoading(true)
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
    const result = await res.json()
    setLoading(false)
    if (!res.ok) setError(result.error)
    else setSuccess(true)
  }

  const EyeIcon = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle}
      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}
      aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
    >
      {show ? (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.83M9.363 5.365A9.466 9.466 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.453 9.453 0 01-2.756 4.244" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  )

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", position: "relative", background: "#0a0a0a", alignItems: "center", justifyContent: "center" }}>
      <video style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, opacity: 0.5 }} autoPlay loop muted playsInline>
        <source src="/background-2.mp4" type="video/mp4" />
      </video>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(37,99,235,0.55) 0%, rgba(0,0,0,0.4) 100%)", zIndex: 1 }} />
      <div style={{ position: "absolute", top: "-700px", width: "2000px", height: "2000px", background: "rgba(37,99,235,0.85)", borderRadius: "50%", zIndex: 1, left: "calc(50% - 1000px)" }} />

      {success ? (
        <div style={{ position: "relative", zIndex: 10, background: "white", borderRadius: "20px", padding: "40px 36px", width: "360px", textAlign: "center", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ width: "60px", height: "60px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "28px" }}>✅</div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>รีเซ็ตสำเร็จ!</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 24px" }}>รหัสผ่านของคุณถูกเปลี่ยนแล้ว</p>
          <button onClick={() => router.push("/login")}
            style={{ width: "100%", background: "#2563eb", color: "white", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
            กลับไปหน้า Login
          </button>
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 10, background: "white", borderRadius: "20px", padding: "40px 36px", width: "360px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "36px", height: "36px", background: "#eff6ff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>รีเซ็ตรหัสผ่าน</h2>
              <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>Siriroj Rehab System</p>
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>รหัสผ่านใหม่</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "13px 44px 13px 16px", fontSize: "15px", outline: "none", boxSizing: "border-box", color: "#111827" }}
              />
              <EyeIcon show={showPass} toggle={() => setShowPass(!showPass)} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>ยืนยันรหัสผ่านใหม่</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={{ width: "100%", border: `1px solid ${confirm && confirm !== password ? "#ef4444" : "#e5e7eb"}`, borderRadius: "12px", padding: "13px 44px 13px 16px", fontSize: "15px", outline: "none", boxSizing: "border-box", color: "#111827" }}
              />
              <EyeIcon show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
            </div>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", display: "flex", gap: "8px", alignItems: "center" }}>
              <svg width="14" height="14" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <p style={{ color: "#dc2626", fontSize: "13px", margin: 0 }}>{error}</p>
            </div>
          )}

          <button onClick={handleReset} disabled={loading}
            style={{ width: "100%", background: "#2563eb", color: "white", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
          </button>

          <button onClick={() => router.push("/login")}
            style={{ width: "100%", background: "none", border: "none", color: "#9ca3af", fontSize: "13px", cursor: "pointer", marginTop: "12px", padding: "4px" }}>
            ← กลับไปหน้า Login
          </button>
        </div>
      )}
    </div>
  )
}