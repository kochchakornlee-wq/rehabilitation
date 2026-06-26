import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { upsertPatient } from "@/lib/upsertPatient";

export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn") ?? "";
  const type = req.nextUrl.searchParams.get("type") ?? "";
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const includeDraft = req.nextUrl.searchParams.get("includeDraft") === "true";

  // ถ้าไม่มี date → prefill จาก record ล่าสุด (รวม draft)
  if (!date) {
    const statusFilter = includeDraft
      ? `AND (status = 'saved' OR status = 'draft' OR status IS NULL)`
      : `AND (status = 'saved' OR status IS NULL)`;

    const [rows]: any = await pool.execute(
      `SELECT * FROM ipd_forms 
       WHERE hn = ? AND type = ? ${statusFilter}
       ORDER BY created_at DESC LIMIT 1`,
      [hn, type],
    );
    return NextResponse.json(rows[0] ?? null);
  }

  // ถ้ามี date → check ว่าวันนี้บันทึกไปแล้วไหม (saved เท่านั้น)
  const [rows]: any = await pool.execute(
    `SELECT * FROM ipd_forms 
     WHERE hn = ? AND type = ? AND DATE(visit_date) = ? AND (status = 'saved' OR status IS NULL)
     ORDER BY created_at DESC LIMIT 1`,
    [hn, type, date],
  );
  return NextResponse.json(rows[0] ?? null);
}

// POST /api/ipd
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    //await upsertPatient(pool, body.patientInfo);
    const id = crypto.randomUUID();

    // SQL — เพิ่ม ? ให้ครบ 34 ตัว และจัดลำดับ treatment_detail_text_said ให้ถูก
    await pool.query(
      `INSERT INTO ipd_forms
 (id, hn, type, visit_date, visit_time, doctor, room, transporation,
  vital_signs, chief, diagnosis, physio_precaution, underly, pain_score,
  location, pain_assesment, characteristic, duration, frequence,
  fall_risk, fall_risk_items, precaution, barthel, physical_exam,
  treatmentplan, short_goal, long_goal, treatment_items, treatment_detail,
  treatment_detail_text, treatment_detail_text_said,
  suggest, status, therapist, assesment)
 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        body.hn ?? null,
        body.type ?? null,
        body.visit_date ?? null,
        body.visit_time ?? null,
        body.doctor ?? null,
        body.room ?? null,
        body.transporation ?? null,
        body.vital_signs ? JSON.stringify(body.vital_signs) : null,
        body.chief ?? null,
        body.diagnosis ?? null,
        body.physio_precaution ?? null,
        body.underly ? JSON.stringify(body.underly) : null,
        body.pain_score ?? null,
        body.location ?? null,
        body.pain_assesment ?? null,
        body.characteristic ? JSON.stringify(body.characteristic) : null,
        body.duration ?? null,
        body.frequence ?? null,
        body.fall_risk ?? null,
        body.fall_risk_items != null
          ? JSON.stringify(body.fall_risk_items)
          : null,
        body.precaution != null ? String(body.precaution) : null,
        body.barthel ?? null,
        body.physical_exam ?? null,
        body.treatmentplan ?? null,
        body.short_goal ?? null,
        body.long_goal ?? null,
        body.treatment_items ? JSON.stringify(body.treatment_items) : null,
        body.treatment_detail ? JSON.stringify(body.treatment_detail) : null,
        body.treatment_detail_text ?? null,
        body.treatment_detail_text_said ?? null, // ← ย้ายมาถูกที่
        body.suggest ? JSON.stringify(body.suggest) : null,
        body.status ?? null,
        body.therapist ?? null,
        body.assesment ? JSON.stringify(body.assesment) : null,
      ],
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("POST /api/ipd error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/ipd?id=xxxxx
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    const body = await req.json();

    await pool.query(
      `UPDATE ipd_forms SET
     type=?, visit_date=?, visit_time=?, doctor=?, room=?, transporation=?,
     vital_signs=?, chief=?, diagnosis=?, physio_precaution=?, underly=?,
     pain_score=?, location=?, pain_assesment=?, characteristic=?, duration=?,
     frequence=?, fall_risk=?, fall_risk_items=?, precaution=?, barthel=?,
     physical_exam=?, treatmentplan=?, short_goal=?, long_goal=?,treatment_detail_text_said=?,
     treatment_items=?, treatment_detail=?,treatment_detail_text=?, treatment_detail_text_said=?, suggest=?, status=?, therapist=?,
     assesment=?
     WHERE id=?`,
      [
        body.type ?? null,
        body.visit_date ?? null,
        body.visit_time ?? null,
        body.doctor ?? null,
        body.room ?? null,
        body.transporation ?? null,
        body.vital_signs ? JSON.stringify(body.vital_signs) : null,
        body.chief ?? null,
        body.diagnosis ?? null,
        body.physio_precaution ?? null,
        body.underly ?? null,
        body.pain_score ?? null,
        body.location ?? null,
        body.pain_assesment ?? null,
        body.characteristic ? JSON.stringify(body.characteristic) : null,
        body.duration ?? null,
        body.frequence ?? null,
        body.fall_risk ?? null,
        body.fall_risk_items ? JSON.stringify(body.fall_risk_items) : null,
        body.precaution ?? null,
        body.barthel ?? null,
        body.physical_exam ? JSON.stringify(body.physical_exam) : null,
        body.treatmentplan ?? null,
        body.short_goal ?? null,
        body.long_goal ?? null,
        body.treatment_detail_text_said ?? null,
        body.treatment_items ? JSON.stringify(body.treatment_items) : null,
        body.treatment_detail ? JSON.stringify(body.treatment_detail) : null,
        body.suggest ?? null,
        body.status ?? null,
        body.therapist ?? null,
        body.assesment ? JSON.stringify(body.assesment) : null,
        id,
        body.treatment_detail_text ?? null,
        body.treatment_detail_text_said ?? null,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT /api/ipd error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 },
    );
  }
}
