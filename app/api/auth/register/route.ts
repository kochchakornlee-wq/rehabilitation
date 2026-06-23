import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import bcrypt from "bcryptjs"

// POST /api/auth/register
// ใช้สำหรับ admin สร้าง account PT ใหม่
export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json()

  if (!username || !email || !password)
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 })

  // เช็คว่ามี username หรือ email ซ้ำไหม
  const [existing] = await pool.query(
    `SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`,
    [username, email]
  )
  if ((existing as any[]).length > 0)
    return NextResponse.json({ error: "ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว" }, { status: 409 })

  const password_hash = await bcrypt.hash(password, 12)
  const id = crypto.randomUUID()

  await pool.query(
    `INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)`,
    [id, username, email, password_hash]
  )

  return NextResponse.json({ success: true })
}
