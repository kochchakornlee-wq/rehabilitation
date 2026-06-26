import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { upsertPatient } from "@/lib/upsertPatient";

// GET /api/koos?hn=xxxxx
export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn");
  const type = req.nextUrl.searchParams.get("type");
  const date = req.nextUrl.searchParams.get("date");

  if (!hn) return NextResponse.json({ error: "hn required" }, { status: 400 });

  let query = `SELECT * FROM koos_assessments WHERE hn = ?`;
  const params: any[] = [hn];

  if (type) {
    query += ` AND assessment_type = ?`;
    params.push(type);
  }
  if (date) {
    query += ` AND assessed_at = ?`;
    params.push(date);
  }

  query += ` ORDER BY created_at DESC LIMIT 1`;

  const [rows] = await pool.query(query, params);
  const data = rows as any[];
  return NextResponse.json(data[0] ?? null);
}

// POST /api/koos
export async function POST(req: NextRequest) {
  const body = await req.json();
  // console.log("patientInfo:", body.patientInfo);
  // await upsertPatient(pool, body.patientInfo);
  const id = crypto.randomUUID();

  await pool.query(
    `INSERT INTO koos_assessments
     (id, hn, ipd_form_id, assessment_type, assessed_at, assessed_by,
      p1,p2,p3,p4,p5,p6,p7,p8,p9, pain_score,
      a1,a2,a3,a4,a5,a6,a7,a8, adl_score, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      body.hn ?? null,
      body.ipd_form_id ?? null,
      body.assessment_type ?? "before",
      body.assessed_at ?? null,
      body.assessed_by ?? null,
      body.p1 ?? null,
      body.p2 ?? null,
      body.p3 ?? null,
      body.p4 ?? null,
      body.p5 ?? null,
      body.p6 ?? null,
      body.p7 ?? null,
      body.p8 ?? null,
      body.p9 ?? null,
      body.pain_score ?? null,
      body.a1 ?? null,
      body.a2 ?? null,
      body.a3 ?? null,
      body.a4 ?? null,
      body.a5 ?? null,
      body.a6 ?? null,
      body.a7 ?? null,
      body.a8 ?? null,
      body.adl_score ?? null,
      body.status ?? "saved", // ← เพิ่ม
    ],
  );

  return NextResponse.json({ success: true, id });
}

// PUT /api/koos?id=xxxxx
export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();

  await pool.query(
    `UPDATE koos_assessments SET
     assessment_type=?, assessed_at=?, assessed_by=?,
     p1=?,p2=?,p3=?,p4=?,p5=?,p6=?,p7=?,p8=?,p9=?, pain_score=?,
     a1=?,a2=?,a3=?,a4=?,a5=?,a6=?,a7=?,a8=?, adl_score=?, status=?
     WHERE id=?`,
    [
      body.assessment_type ?? "before",
      body.assessed_at ?? null,
      body.assessed_by ?? null,
      body.p1 ?? null,
      body.p2 ?? null,
      body.p3 ?? null,
      body.p4 ?? null,
      body.p5 ?? null,
      body.p6 ?? null,
      body.p7 ?? null,
      body.p8 ?? null,
      body.p9 ?? null,
      body.pain_score ?? null,
      body.a1 ?? null,
      body.a2 ?? null,
      body.a3 ?? null,
      body.a4 ?? null,
      body.a5 ?? null,
      body.a6 ?? null,
      body.a7 ?? null,
      body.a8 ?? null,
      body.adl_score ?? null,
      body.status ?? "saved", // ← เพิ่ม
      id,
    ],
  );

  return NextResponse.json({ success: true });
}
