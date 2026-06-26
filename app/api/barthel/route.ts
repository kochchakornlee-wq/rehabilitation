import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { upsertPatient } from "@/lib/upsertPatient";

// GET /api/barthel?hn=xxxxx
// ดึง batch ล่าสุดของ HN นั้น (prefill)
// GET /api/barthel?hn=xxxxx
// ดึง batch ล่าสุดของ HN นั้น (prefill)
export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn");
  if (!hn) return NextResponse.json({ error: "hn required" }, { status: 400 });

  // หา created_at ล่าสุดก่อน
  const [latest] = (await pool.query(
    `SELECT created_at FROM barthel_assessments 
     WHERE hn = ? ORDER BY created_at DESC LIMIT 1`,
    [hn],
  )) as any[];

  if (!latest || (latest as any[]).length === 0) return NextResponse.json([]);

  const latestTime = (latest as any[])[0].created_at;
  console.log("latestTime:", latestTime);

  // ดึงทุก row ของ batch นั้น
  const [rows] = await pool.query(
    `SELECT * FROM barthel_assessments 
   WHERE hn = ? AND created_at = ?
   ORDER BY session_number ASC`,
    [hn, latestTime],
  );

  // highlight-start
  // วางทับแทนที่ return NextResponse.json(rows); เดิมตรงนี้ได้เลยครับ
  const data = (rows as any[]).map((row) => ({
    ...row,
    assessed_at:
      row.assessed_at instanceof Date
        ? `${row.assessed_at.getFullYear()}-${String(row.assessed_at.getMonth() + 1).padStart(2, "0")}-${String(row.assessed_at.getDate()).padStart(2, "0")}`
        : String(row.assessed_at).split("T")[0],
  }));
  console.log(
    "returning assessed_at:",
    data.map((r) => r.assessed_at),
  );
  return NextResponse.json(data);
  // highlight-end
}

// POST /api/barthel
// บันทึก sessions ทั้งหมด (array)
export async function POST(req: NextRequest) {
  const body = await req.json();
  await upsertPatient(pool, body.patientInfo);
  const rows: any[] = Array.isArray(body) ? body : [body];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const row of rows) {
      const id = crypto.randomUUID();
      await conn.query(
        `INSERT INTO barthel_assessments 
         (id, hn, session_number, assessed_at, assessed_by,
          feeding, transfers, grooming, toilet_use, bathing,
          mobility, stairs, dressing, bowels, bladder, total_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          row.hn,
          row.session_number,
          row.assessed_at,
          row.assessed_by ?? null,
          row.feeding ?? null,
          row.transfers ?? null,
          row.grooming ?? null,
          row.toilet_use ?? null,
          row.bathing ?? null,
          row.mobility ?? null,
          row.stairs ?? null,
          row.dressing ?? null,
          row.bowels ?? null,
          row.bladder ?? null,
          row.total_score ?? null,
        ],
      );
    }

    await conn.commit();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    await conn.rollback();
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}
