import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { upsertPatient } from "@/lib/upsertPatient";

// GET /api/tug?hn=xxxxx
export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn");
  if (!hn) return NextResponse.json({ error: "hn required" }, { status: 400 });

  const [rows] = await pool.query(
    `SELECT * FROM tug_assessments WHERE patient_hn = ? ORDER BY created_at DESC LIMIT 1`,
    [hn],
  );

  const data = rows as any[];
  return NextResponse.json(data[0] ?? null);
}

// POST /api/tug
export async function POST(req: NextRequest) {
  const body = await req.json();
  await upsertPatient(pool, body.patientInfo);
  const id = crypto.randomUUID();

  await pool.query(
    `INSERT INTO tug_assessments
 (id, patient_hn, patient_name, assessment_date, assessment_time,
  assessment_type, physiotherapist, walking_ability, time_to_complete,
  safety_classification, assistive_device, return_direction, visual_aids, status)
 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      body.patient_hn ?? null,
      body.patient_name ?? null,
      body.assessment_date ?? null,
      body.assessment_time ?? null,
      body.assessment_type ?? null,
      body.physiotherapist ?? null,
      body.walking_ability ?? null,
      body.time_to_complete ?? null,
      body.safety_classification ?? null,
      body.assistive_device ?? null,
      body.return_direction ?? null,
      body.visual_aids ?? null,
      body.status ?? "saved", // ← เพิ่ม
    ],
  );

  return NextResponse.json({ success: true, id });
}

// PUT /api/tug?id=xxxxx
export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();

  await pool.query(
    `UPDATE tug_assessments SET
 patient_name=?, assessment_date=?, assessment_time=?, assessment_type=?,
 physiotherapist=?, walking_ability=?, time_to_complete=?,
 safety_classification=?, assistive_device=?, return_direction=?, visual_aids=?,
 status=?
 WHERE id=?`,
    [
      body.patient_name ?? null,
      body.assessment_date ?? null,
      body.assessment_time ?? null,
      body.assessment_type ?? null,
      body.physiotherapist ?? null,
      body.walking_ability ?? null,
      body.time_to_complete ?? null,
      body.safety_classification ?? null,
      body.assistive_device ?? null,
      body.return_direction ?? null,
      body.visual_aids ?? null,
      body.status ?? "saved",
      id,
    ],
  );

  return NextResponse.json({ success: true });
}
