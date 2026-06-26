import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { upsertPatient } from "@/lib/upsertPatient";

// GET /api/ca?hn=xxxxx
export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn");
  if (!hn) return NextResponse.json({ error: "hn required" }, { status: 400 });

  const [rows] = await pool.query(
    `SELECT * FROM ca_assessments WHERE hn = ? ORDER BY created_at DESC LIMIT 1`,
    [hn],
  );

  const data = rows as any[];
  if (
    data[0]?.advice_suggestions &&
    typeof data[0].advice_suggestions === "string"
  ) {
    data[0].advice_suggestions = JSON.parse(data[0].advice_suggestions);
  }
  if (
    data[0]?.current_treatment &&
    typeof data[0].current_treatment === "string"
  ) {
    data[0].current_treatment = JSON.parse(data[0].current_treatment);
  }
  if (data[0]?.past_treatment && typeof data[0].past_treatment === "string") {
    data[0].past_treatment = JSON.parse(data[0].past_treatment);
  }
  return NextResponse.json(data[0] ?? null);
}

// POST /api/ca
export async function POST(req: NextRequest) {
  const body = await req.json();
  await upsertPatient(pool, body.patientInfo);
  const id = crypto.randomUUID();

  await pool.query(
    `INSERT INTO ca_assessments
     (id, hn, patient_name, assessment_mode, assessed_at, assessed_time, physiotherapist,
      diagnosis, pain_scale, underlying_disease,
      current_treatment, current_other, past_treatment, past_other,
      rom_head_neck_right, rom_head_neck_left, rom_head_neck_remark,
      rom_upper_extremities_right, rom_upper_extremities_left, rom_upper_extremities_remark,
      rom_lower_extremities_right, rom_lower_extremities_left, rom_lower_extremities_remark,
      circ_upper_right_position, circ_upper_right_cm, circ_upper_left_position, circ_upper_left_cm, circ_upper_remark,
      circ_lower_right_position, circ_lower_right_cm, circ_lower_left_position, circ_lower_left_cm, circ_lower_remark,
      handgrip_result, handgrip_level, reach_result, reach_level,
      tug_result, tug_level, other_problems, advice_suggestions)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      body.hn ?? null,
      body.patient_name ?? null,
      body.assessment_mode ?? null,
      body.assessed_at ?? null,
      body.assessed_time ?? null,
      body.physiotherapist ?? null,
      body.diagnosis ?? null,
      body.pain_scale ?? null,
      body.underlying_disease ?? null,
      body.current_treatment ? JSON.stringify(body.current_treatment) : null,
      body.current_other ?? null,
      body.past_treatment ? JSON.stringify(body.past_treatment) : null,
      body.past_other ?? null,
      body.rom_head_neck_right ?? null,
      body.rom_head_neck_left ?? null,
      body.rom_head_neck_remark ?? null,
      body.rom_upper_extremities_right ?? null,
      body.rom_upper_extremities_left ?? null,
      body.rom_upper_extremities_remark ?? null,
      body.rom_lower_extremities_right ?? null,
      body.rom_lower_extremities_left ?? null,
      body.rom_lower_extremities_remark ?? null,
      body.circ_upper_right_position ?? null,
      body.circ_upper_right_cm ?? null,
      body.circ_upper_left_position ?? null,
      body.circ_upper_left_cm ?? null,
      body.circ_upper_remark ?? null,
      body.circ_lower_right_position ?? null,
      body.circ_lower_right_cm ?? null,
      body.circ_lower_left_position ?? null,
      body.circ_lower_left_cm ?? null,
      body.circ_lower_remark ?? null,
      body.handgrip_result ?? null,
      body.handgrip_level ?? null,
      body.reach_result ?? null,
      body.reach_level ?? null,
      body.tug_result ?? null,
      body.tug_level ?? null,
      body.other_problems ?? null,
      body.advice_suggestions ? JSON.stringify(body.advice_suggestions) : null,
    ],
  );

  return NextResponse.json({ success: true, id });
}

// PUT /api/ca?id=xxxxx
export async function PUT(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();

  await pool.query(
    `UPDATE ca_assessments SET
     patient_name=?, assessment_mode=?, assessed_at=?, assessed_time=?, physiotherapist=?,
     diagnosis=?, pain_scale=?, underlying_disease=?,
     current_treatment=?, current_other=?, past_treatment=?, past_other=?,
     rom_head_neck_right=?, rom_head_neck_left=?, rom_head_neck_remark=?,
     rom_upper_extremities_right=?, rom_upper_extremities_left=?, rom_upper_extremities_remark=?,
     rom_lower_extremities_right=?, rom_lower_extremities_left=?, rom_lower_extremities_remark=?,
     circ_upper_right_position=?, circ_upper_right_cm=?, circ_upper_left_position=?, circ_upper_left_cm=?, circ_upper_remark=?,
     circ_lower_right_position=?, circ_lower_right_cm=?, circ_lower_left_position=?, circ_lower_left_cm=?, circ_lower_remark=?,
     handgrip_result=?, handgrip_level=?, reach_result=?, reach_level=?,
     tug_result=?, tug_level=?, other_problems=?, advice_suggestions=?
     WHERE id=?`,
    [
      body.patient_name ?? null,
      body.assessment_mode ?? null,
      body.assessed_at ?? null,
      body.assessed_time ?? null,
      body.physiotherapist ?? null,
      body.diagnosis ?? null, // ← เพิ่ม
      body.pain_scale ?? null, // ← เพิ่ม
      body.underlying_disease ?? null, // ← เพิ่ม
      body.current_treatment ? JSON.stringify(body.current_treatment) : null, // ← เพิ่ม
      body.current_other ?? null, // ← เพิ่ม
      body.past_treatment ? JSON.stringify(body.past_treatment) : null, // ← เพิ่ม
      body.past_other ?? null, // ← เพิ่ม
      body.rom_head_neck_right ?? null,
      body.rom_head_neck_left ?? null,
      body.rom_head_neck_remark ?? null,
      body.rom_upper_extremities_right ?? null,
      body.rom_upper_extremities_left ?? null,
      body.rom_upper_extremities_remark ?? null,
      body.rom_lower_extremities_right ?? null,
      body.rom_lower_extremities_left ?? null,
      body.rom_lower_extremities_remark ?? null,
      body.circ_upper_right_position ?? null,
      body.circ_upper_right_cm ?? null,
      body.circ_upper_left_position ?? null,
      body.circ_upper_left_cm ?? null,
      body.circ_upper_remark ?? null,
      body.circ_lower_right_position ?? null,
      body.circ_lower_right_cm ?? null,
      body.circ_lower_left_position ?? null,
      body.circ_lower_left_cm ?? null,
      body.circ_lower_remark ?? null,
      body.handgrip_result ?? null,
      body.handgrip_level ?? null,
      body.reach_result ?? null,
      body.reach_level ?? null,
      body.tug_result ?? null,
      body.tug_level ?? null,
      body.other_problems ?? null,
      body.advice_suggestions ? JSON.stringify(body.advice_suggestions) : null,
      id,
    ],
  );

  return NextResponse.json({ success: true });
}
