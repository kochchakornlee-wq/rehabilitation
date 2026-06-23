// app/api/records/route.ts

import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn")?.trim() ?? ""
  const p  = hn ? [`%${hn}%`] : []
  const w  = hn ? "WHERE hn LIKE ?"         : ""
  const wP = hn ? "WHERE patient_hn LIKE ?" : ""   // tug ใช้ patient_hn

  try {
    const [ipd]       = await pool.execute(`SELECT *, 'ipd'       AS form_type FROM ipd_forms          ${w}  ORDER BY created_at DESC LIMIT 100`, p)
    const [opd]       = await pool.execute(`SELECT *, 'opd'       AS form_type FROM opd_forms          ${w}  ORDER BY created_at DESC LIMIT 100`, p)
    const [ca]        = await pool.execute(`SELECT *, 'cancer'    AS form_type FROM ca_assessments     ${w}  ORDER BY created_at DESC LIMIT 100`, p)
    const [barthel]   = await pool.execute(`SELECT *, 'barthel'   AS form_type FROM barthel_assessments ${w} ORDER BY created_at DESC LIMIT 100`, p)
    const [tug]       = await pool.execute(`SELECT *, 'tug'       AS form_type FROM tug_assessments    ${wP} ORDER BY created_at DESC LIMIT 100`, p)
    const [koos]      = await pool.execute(`SELECT *, 'koos'      AS form_type FROM koos_assessments   ${w}  ORDER BY created_at DESC LIMIT 100`, p)
    const [hip17]     = await pool.execute(`SELECT *, 'hip17'     AS form_type FROM hip17_assessments  ${w}  ORDER BY created_at DESC LIMIT 100`, p)
    const [mobility]  = await pool.execute(`SELECT *, 'mobility'  AS form_type FROM mobility_assessment ${w} ORDER BY created_at DESC LIMIT 100`, p)
    const [education] = await pool.execute(`SELECT *, 'education' AS form_type FROM education_records  ${w}  ORDER BY created_at DESC LIMIT 100`, p)

    // discharge ไม่มี created_at ใช้ date แทน
    const wD = hn ? "WHERE hn = ?" : ""
    const [discharge] = await pool.execute(
      `SELECT *, 'discharge' AS form_type, date AS created_at FROM discharge ${wD} ORDER BY date DESC LIMIT 100`, p
    )

    // tug ใช้ patient_hn — normalize ให้เป็น hn เดียวกัน
    const tugNorm = (tug as any[]).map(r => ({ ...r, hn: r.patient_hn ?? r.hn }))

    return NextResponse.json({ ipd, opd, ca, barthel, tug: tugNorm, koos, hip17, mobility, education, discharge })
  } catch (err: any) {
    console.error("[records] error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}