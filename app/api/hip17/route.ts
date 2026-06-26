import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { upsertPatient } from "@/lib/upsertPatient";

// GET /api/hip17?hn=xxxxx&visit_type=xxxxx
export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn");
  const visit_type = req.nextUrl.searchParams.get("visit_type");
  if (!hn) return NextResponse.json({ error: "hn required" }, { status: 400 });

  const [rows] = visit_type
    ? await pool.query(
        `SELECT * FROM hip17_assessments WHERE hn = ? AND visit_type = ? LIMIT 1`,
        [hn, visit_type],
      )
    : await pool.query(
        `SELECT * FROM hip17_assessments WHERE hn = ? ORDER BY created_at DESC LIMIT 1`,
        [hn],
      );

  const data = rows as any[];
  return NextResponse.json(data[0] ?? null);
}

// POST /api/hip17  (upsert by hn + visit_type)
export async function POST(req: NextRequest) {
  const body = await req.json();
  await upsertPatient(pool, body.patientInfo);

  // ตรวจว่ามีอยู่แล้วไหม
  const [existing] = (await pool.query(
    `SELECT id FROM hip17_assessments WHERE hn = ? AND visit_type = ?`,
    [body.hn, body.visit_type],
  )) as any[];

  if ((existing as any[]).length > 0) {
    // UPDATE
    const existingId = (existing as any[])[0].id;
    await pool.query(
      `UPDATE hip17_assessments SET
       pain_straightening=?, pain_straightening_th=?, pain_bending=?, pain_bending_th=?,
       pain_sitting=?, pain_sitting_th=?, pain_standing=?, pain_standing_th=?,
       pain_walking=?, pain_walking_th=?, pain_total=?, pain_percent=?,
       act_lying=?, act_lying_th=?, act_sitting=?, act_sitting_th=?,
       act_rising=?, act_rising_th=?, act_standing=?, act_standing_th=?,
       act_walking=?, act_walking_th=?, act_total=?, act_percent=?,
       pain_date_0=?, pain_date_1=?, pain_date_2=?, pain_date_3=?, pain_date_4=?,
       act_date_0=?, act_date_1=?, act_date_2=?, act_date_3=?, act_date_4=?,
       assessor_name=?, assessor_date=?, assessor_time=?, notes=?, updated_at=NOW()
       WHERE id=?`,
      [
        body.pain_straightening ?? null,
        body.pain_straightening_th ?? null,
        body.pain_bending ?? null,
        body.pain_bending_th ?? null,
        body.pain_sitting ?? null,
        body.pain_sitting_th ?? null,
        body.pain_standing ?? null,
        body.pain_standing_th ?? null,
        body.pain_walking ?? null,
        body.pain_walking_th ?? null,
        body.pain_total ?? null,
        body.pain_percent ?? null,
        body.act_lying ?? null,
        body.act_lying_th ?? null,
        body.act_sitting ?? null,
        body.act_sitting_th ?? null,
        body.act_rising ?? null,
        body.act_rising_th ?? null,
        body.act_standing ?? null,
        body.act_standing_th ?? null,
        body.act_walking ?? null,
        body.act_walking_th ?? null,
        body.act_total ?? null,
        body.act_percent ?? null,
        body.pain_date_0 ?? null,
        body.pain_date_1 ?? null,
        body.pain_date_2 ?? null,
        body.pain_date_3 ?? null,
        body.pain_date_4 ?? null,
        body.act_date_0 ?? null,
        body.act_date_1 ?? null,
        body.act_date_2 ?? null,
        body.act_date_3 ?? null,
        body.act_date_4 ?? null,
        body.assessor_name ?? null,
        body.assessor_date ?? null,
        body.assessor_time ?? null,
        body.notes ?? null,
        existingId,
      ],
    );
    return NextResponse.json({ success: true, id: existingId });
  } else {
    // INSERT
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO hip17_assessments
       (id, hn, visit_type,
        pain_straightening, pain_straightening_th, pain_bending, pain_bending_th,
        pain_sitting, pain_sitting_th, pain_standing, pain_standing_th,
        pain_walking, pain_walking_th, pain_total, pain_percent,
        act_lying, act_lying_th, act_sitting, act_sitting_th,
        act_rising, act_rising_th, act_standing, act_standing_th,
        act_walking, act_walking_th, act_total, act_percent,
        pain_date_0, pain_date_1, pain_date_2, pain_date_3, pain_date_4,
        act_date_0, act_date_1, act_date_2, act_date_3, act_date_4,
        assessor_name, assessor_date, assessor_time, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        body.hn,
        body.visit_type,
        body.pain_straightening ?? null,
        body.pain_straightening_th ?? null,
        body.pain_bending ?? null,
        body.pain_bending_th ?? null,
        body.pain_sitting ?? null,
        body.pain_sitting_th ?? null,
        body.pain_standing ?? null,
        body.pain_standing_th ?? null,
        body.pain_walking ?? null,
        body.pain_walking_th ?? null,
        body.pain_total ?? null,
        body.pain_percent ?? null,
        body.act_lying ?? null,
        body.act_lying_th ?? null,
        body.act_sitting ?? null,
        body.act_sitting_th ?? null,
        body.act_rising ?? null,
        body.act_rising_th ?? null,
        body.act_standing ?? null,
        body.act_standing_th ?? null,
        body.act_walking ?? null,
        body.act_walking_th ?? null,
        body.act_total ?? null,
        body.act_percent ?? null,
        body.pain_date_0 ?? null,
        body.pain_date_1 ?? null,
        body.pain_date_2 ?? null,
        body.pain_date_3 ?? null,
        body.pain_date_4 ?? null,
        body.act_date_0 ?? null,
        body.act_date_1 ?? null,
        body.act_date_2 ?? null,
        body.act_date_3 ?? null,
        body.act_date_4 ?? null,
        body.assessor_name ?? null,
        body.assessor_date ?? null,
        body.assessor_time ?? null,
        body.notes ?? null,
      ],
    );
    return NextResponse.json({ success: true, id });
  }
}
