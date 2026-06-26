// app/api/patients/route.ts

import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

// GET /api/patients?search=xxx
// ถ้ามี search → filter by name หรือ HN
// ถ้าไม่มี → return ทั้งหมด เรียงตาม last_visit ล่าสุด
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? ""

  try {
    let rows
    if (search.trim()) {
      const like = `%${search.trim()}%`
      ;[rows] = await pool.execute(
        `SELECT * FROM patients
         WHERE hn LIKE ? OR hn_formatted LIKE ? OR name LIKE ?
         ORDER BY last_visit DESC
         LIMIT 50`,
        [like, like, like]
      )
    } else {
      ;[rows] = await pool.execute(
        `SELECT * FROM patients ORDER BY last_visit DESC LIMIT 100`
      )
    }

    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/patients
// body: { hn, hn_formatted, name, gender, age, birthdate, admit_date, allergies }
// upsert — ถ้ามี HN อยู่แล้วให้ update, ถ้าไม่มีให้ insert
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      hn,
      hn_formatted,
      name,
      gender,
      age,
      birthdate,
      admit_date,
      allergies,
    } = body

    if (!hn) return NextResponse.json({ error: "hn is required" }, { status: 400 })

    const allergiesStr = Array.isArray(allergies)
      ? allergies.join(", ")
      : allergies ?? ""

    await pool.execute(
      `INSERT INTO patients (hn, hn_formatted, name, gender, age, birthdate, admit_date, allergies, last_visit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
       ON DUPLICATE KEY UPDATE
         hn_formatted = VALUES(hn_formatted),
         name         = VALUES(name),
         gender       = VALUES(gender),
         age          = VALUES(age),
         birthdate    = VALUES(birthdate),
         admit_date   = VALUES(admit_date),
         allergies    = VALUES(allergies),
         last_visit   = CURDATE()`,
      [hn, hn_formatted ?? hn, name ?? "", gender ?? "", age ?? null, birthdate ?? "", admit_date ?? "", allergiesStr]
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}