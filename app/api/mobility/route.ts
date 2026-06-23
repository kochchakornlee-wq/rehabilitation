import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

// GET /api/mobility?hn=xxxxx
export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn")
  if (!hn) return NextResponse.json({ error: "hn required" }, { status: 400 })

  const [rows] = await pool.query(
    `SELECT * FROM mobility_assessment WHERE hn = ? ORDER BY created_at DESC LIMIT 1`,
    [hn]
  )

  const data = rows as any[]
  return NextResponse.json(data[0] ?? null)
}

// POST /api/mobility  (upsert by hn)
export async function POST(req: NextRequest) {
  const body = await req.json()

  const [existing] = await pool.query(
    `SELECT id FROM mobility_assessment WHERE hn = ?`,
    [body.hn]
  ) as any[]

  if ((existing as any[]).length > 0) {
    const existingId = (existing as any[])[0].id
    await pool.query(
      `UPDATE mobility_assessment SET
       admission_score=?, admission_date=?, admission_label=?,
       dc_score=?, dc_date=?, dc_label=?,
       fu_score=?, fu_date=?, fu_label=?,
       assessor_name=?, assessor_date=?, assessor_time=?, notes=?, updated_at=NOW()
       WHERE id=?`,
      [
        body.admission_score??null, body.admission_date??null, body.admission_label??null,
        body.dc_score??null, body.dc_date??null, body.dc_label??null,
        body.fu_score??null, body.fu_date??null, body.fu_label??null,
        body.assessor_name??null, body.assessor_date??null, body.assessor_time??null,
        body.notes??null,
        existingId,
      ]
    )
    return NextResponse.json({ success: true, id: existingId })
  } else {
    const id = crypto.randomUUID()
    await pool.query(
      `INSERT INTO mobility_assessment
       (id, hn, admission_score, admission_date, admission_label,
        dc_score, dc_date, dc_label, fu_score, fu_date, fu_label,
        assessor_name, assessor_date, assessor_time, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, body.hn,
        body.admission_score??null, body.admission_date??null, body.admission_label??null,
        body.dc_score??null, body.dc_date??null, body.dc_label??null,
        body.fu_score??null, body.fu_date??null, body.fu_label??null,
        body.assessor_name??null, body.assessor_date??null, body.assessor_time??null,
        body.notes??null,
      ]
    )
    return NextResponse.json({ success: true, id })
  }
}
