import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { upsertPatient } from "@/lib/upsertPatient";

// GET /api/opd?hn=xxxxx
export async function GET(req: NextRequest) {
  try {
    const hn = req.nextUrl.searchParams.get("hn");
    const type = req.nextUrl.searchParams.get("type"); // เพิ่มตรงนี้
    if (!hn)
      return NextResponse.json({ error: "hn required" }, { status: 400 });

    const [rows] = type
      ? await pool.query(
          `SELECT * FROM opd_forms WHERE hn = ? AND type = ? ORDER BY created_at DESC LIMIT 1`,
          [hn, type],
        )
      : await pool.query(
          `SELECT * FROM opd_forms WHERE hn = ? ORDER BY created_at DESC LIMIT 1`,
          [hn],
        );

    const data = rows as any[];
    return NextResponse.json(data[0] ?? null);
  } catch (err: any) {
    console.error("GET /api/opd error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/opd
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("patientInfo:", body.patientInfo);
    await upsertPatient(pool, body.patientInfo);
    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO opd_forms
   (id, hn, type, visit_date, visit_time, doctor, diagnosis, pain_score,
    visit_number, vn, Transporation, Physio_precaution, precaution, underly, location,
    pain_assesment, characteristic, Duration, frequence, barthel,
    physical_exam, treatmentPlan, short_goal, long_goal, assesment,
    fall_risk, fall_risk_items, vital_signs, chief, therapist, suggest,
    status, treatment_items, treatment_detail)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        body.hn ?? null,
        body.type ?? null,
        body.visit_date ?? null,
        body.visit_time ?? null,
        body.doctor ?? null,
        body.diagnosis ?? null,
        body.pain_score ?? null,
        body.visit_number ?? null,
        body.vn ?? null,
        body.Transporation ?? null,
        body.Physio_precaution ?? null,
        body.precaution ?? null, // ← เพิ่มตรงนี้
        body.underly ? JSON.stringify(body.underly) : null,
        body.location ?? null,
        body.pain_assesment ?? null,
        body.characteristic ? JSON.stringify(body.characteristic) : null,
        body.Duration ?? null,
        body.frequence ?? null,
        body.barthel ?? null,
        body.physical_exam ?? null,
        body.treatmentPlan ?? null,
        body.short_goal ?? null,
        body.long_goal ?? null,
        body.assesment ? JSON.stringify(body.assesment) : null,
        body.fall_risk ?? null,
        body.fall_risk_items ? JSON.stringify(body.fall_risk_items) : null,
        body.vital_signs ? JSON.stringify(body.vital_signs) : null,
        body.chief ?? null,
        body.therapist ?? null,
        body.suggest ?? null,
        body.status ?? null,
        body.treatment_items ? JSON.stringify(body.treatment_items) : null,
        body.treatment_detail ? JSON.stringify(body.treatment_detail) : null,
      ],
    );
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("POST /api/opd error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/opd?id=xxxxx
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    const body = await req.json();

    await pool.query(
      `UPDATE opd_forms SET
     type=?, visit_date=?, visit_time=?, doctor=?, diagnosis=?, pain_score=?,
     visit_number=?, vn=?, Transporation=?, Physio_precaution=?, precaution=?, underly=?,
     location=?, pain_assesment=?, characteristic=?, Duration=?, frequence=?,
     barthel=?, physical_exam=?, treatmentPlan=?, short_goal=?, long_goal=?,
     assesment=?, fall_risk=?, fall_risk_items=?, vital_signs=?, chief=?,
     therapist=?, suggest=?, status=?, treatment_items=?, treatment_detail=?
     WHERE id=?`,
      [
        body.type ?? null,
        body.visit_date ?? null,
        body.visit_time ?? null,
        body.doctor ?? null,
        body.diagnosis ?? null,
        body.pain_score ?? null,
        body.visit_number ?? null,
        body.vn ?? null,
        body.Transporation ?? null,
        body.Physio_precaution ?? null,
        body.precaution ?? null,
        body.underly ?? null,
        body.location ?? null,
        body.pain_assesment ?? null,
        body.characteristic ?? null,
        body.Duration ?? null,
        body.frequence ?? null,
        body.barthel ?? null,
        body.physical_exam ?? null,
        body.treatmentPlan ?? null,
        body.short_goal ?? null,
        body.long_goal ?? null,
        body.assesment ? JSON.stringify(body.assesment) : null,
        body.fall_risk ?? null,
        body.fall_risk_items ? JSON.stringify(body.fall_risk_items) : null,
        body.vital_signs ?? null,
        body.chief ?? null,
        body.therapist ?? null,
        body.suggest ?? null,
        body.status ?? null,
        body.treatment_items ? JSON.stringify(body.treatment_items) : null,
        body.treatment_detail ? JSON.stringify(body.treatment_detail) : null,
        id,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT /api/opd error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
