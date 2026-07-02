import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { upsertPatient } from "@/lib/upsertPatient";

// GET /api/education?hn=xxxxx
export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn");
  if (!hn) return NextResponse.json({ error: "hn required" }, { status: 400 });

  const [rows] = await pool.query(
    `SELECT * FROM education_records WHERE hn = ? ORDER BY created_at ASC`,
    [hn],
  );

  return NextResponse.json(rows); // ← return array เลย ไม่ต้อง [0]
}
// POST /api/education
export async function POST(req: NextRequest) {
  const body = await req.json();
  await upsertPatient(pool, body.patientInfo);
  const records = Array.isArray(body) ? body : [body];

  const ids: string[] = [];
  for (const item of records) {
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO education_records
 (id, hn, datetime, topics, specify, education, readiness, barriers, methods, evaluation, provider, status)
 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        item.hn ?? null,
        item.datetime ?? null,
        item.topics ?? null,
        item.specify ?? null,
        item.education ?? null,
        item.readiness ?? null,
        item.barriers ?? null,
        item.methods ?? null,
        item.evaluation ?? null,
        item.provider ?? null,
        item.status ?? "saved", // ← เพิ่ม
      ],
    );
    ids.push(id);
  }

  return NextResponse.json({ success: true, ids });
}

// PUT /api/education?id=xxxxx
export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();

  await pool.query(
    `UPDATE education_records SET
 datetime=?, topics=?, specify=?, education=?, readiness=?,
 barriers=?, methods=?, evaluation=?, provider=?, status=?
 WHERE id=?`,
    [
      body.datetime ?? null,
      body.topics ?? null,
      body.specify ?? null,
      body.education ?? null,
      body.readiness ?? null,
      body.barriers ?? null,
      body.methods ?? null,
      body.evaluation ?? null,
      body.provider ?? null,
      body.status ?? "saved",
      id,
    ],
  );

  return NextResponse.json({ success: true });
}
