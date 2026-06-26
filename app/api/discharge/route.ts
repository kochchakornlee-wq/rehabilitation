import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { upsertPatient } from "@/lib/upsertPatient";

// GET /api/discharge?hn=xxxxx
export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn");
  if (!hn) return NextResponse.json({ error: "hn required" }, { status: 400 });

  const [rows] = await pool.query(
    `SELECT * FROM \`Discharge\` WHERE hn = ? ORDER BY date DESC LIMIT 1`,
    [hn],
  );

  const data = rows as any[];
  return NextResponse.json(data[0] ?? null);
}

// POST /api/discharge
export async function POST(req: NextRequest) {
  const body = await req.json();
  await upsertPatient(pool, body.patientInfo);
  const id = crypto.randomUUID();

  await pool.query(
    `INSERT INTO \`Discharge\`
     (id, hn, date, time, doctor, short_goal, long_goal, plan,
      intime, cause, pass, estimate, form_type, assessor, form_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      body.hn ?? null,
      body.date ?? null,
      body.time ?? null,
      body.doctor ?? null,
      body.short_goal ?? null,
      body.long_goal ?? null,
      body.plan ?? null,
      body.intime ?? null,
      body.cause ?? null,
      body.pass ?? null,
      body.estimate ? JSON.stringify(body.estimate) : null,
      body.form_type ?? null,
      body.assessor ?? null,
      body.form_id ?? null,
    ],
  );

  return NextResponse.json({ success: true, id });
}

// PUT /api/discharge?id=xxxxx
export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();

  await pool.query(
    `UPDATE \`Discharge\` SET
     date=?, time=?, doctor=?, short_goal=?, long_goal=?, plan=?,
     intime=?, cause=?, pass=?, estimate=?, form_type=?, assessor=?, form_id=?
     WHERE id=?`,
    [
      body.date ?? null,
      body.time ?? null,
      body.doctor ?? null,
      body.short_goal ?? null,
      body.long_goal ?? null,
      body.plan ?? null,
      body.intime ?? null,
      body.cause ?? null,
      body.pass ?? null,
      body.estimate ? JSON.stringify(body.estimate) : null,
      body.form_type ?? null,
      body.assessor ?? null,
      body.form_id ?? null,
      id,
    ],
  );

  return NextResponse.json({ success: true });
}
