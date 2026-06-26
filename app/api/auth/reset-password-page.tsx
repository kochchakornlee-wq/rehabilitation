"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
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
    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      return
    }
    if (password !== confirm) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }

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

  if (success) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center w-80">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
          <h2 className="text-2xl font-bold mb-2">รีเซ็ตสำเร็จ!</h2>
          <p className="text-gray-500 mb-6">รหัสผ่านของคุณถูกเปลี่ยนแล้ว</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-500 text-white rounded-full py-3 font-bold hover:bg-blue-600"
          >
            กลับไปหน้า Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="w-80">
        <h2 className="text-3xl font-bold mb-6 text-blue-500">รีเซ็ตรหัสผ่าน</h2>
        <input
          type="password"
          placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)"
          className="w-full border border-gray-300 rounded-full px-4 py-3 mb-3 text-base"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="ยืนยันรหัสผ่านใหม่"
          className="w-full border border-gray-300 rounded-full px-4 py-3 mb-4 text-base"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-blue-500 text-white rounded-full py-3 font-bold hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
        </button>
      </div>
    </div>
  )
}
