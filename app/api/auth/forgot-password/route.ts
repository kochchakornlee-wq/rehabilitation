import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import nodemailer from "nodemailer"
import crypto from "crypto"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  console.log("🔵 forgot-password called")

  const { email } = await req.json()
  if (!email)
    return NextResponse.json({ error: "กรุณากรอกอีเมล" }, { status: 400 })

  try {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    )
    const users = rows as any[]

    // ไม่บอกว่าเจอหรือไม่เจอ (security)
    if (users.length === 0) {
      console.log("🟡 email not found:", email)
      return NextResponse.json({ success: true })
    }

    const user = users[0]
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1000 * 60 * 30) // 30 นาที

    await pool.query(
      `UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?`,
      [token, expires, user.id]
    )

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    await transporter.sendMail({
      from: `"Rehab App" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "รีเซ็ตรหัสผ่าน - ระบบ Rehab Siriroj",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #2563eb; margin-bottom: 8px;">รีเซ็ตรหัสผ่าน</h2>
          <p>สวัสดีคุณ <strong>${user.username}</strong></p>
          <p>มีการขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณากดปุ่มด้านล่างภายใน <strong>30 นาที</strong></p>
          <a href="${resetUrl}"
             style="display:inline-block; background:#2563eb; color:white; padding:12px 28px; border-radius:8px; text-decoration:none; margin: 20px 0; font-weight: 600;">
            รีเซ็ตรหัสผ่าน
          </a>
          <p style="color:#6b7280; font-size:13px;">หากคุณไม่ได้ขอรีเซ็ต ไม่ต้องดำเนินการใดๆ</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;"/>
          <p style="color:#9ca3af; font-size:12px;">Bangkok Hospital Siriroj — Rehabilitation Department</p>
        </div>
      `,
    })

    console.log("✅ email sent to:", email)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("🔴 forgot-password error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}