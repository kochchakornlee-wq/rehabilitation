import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { upsertPatient } from "@/lib/upsertPatient";

// GET /api/barthel?hn=xxxxx
// ดึง batch ล่าสุดของ HN นั้น (prefill) — เอาทั้ง draft และ saved
// (ตั้งใจให้ดึง draft มาด้วย เพื่อกันงานหายถ้าปิดฟอร์มไปก่อน save จริง)
export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn");
  if (!hn) return NextResponse.json({ error: "hn required" }, { status: 400 });

  // หา created_at ล่าสุดก่อน (ไม่สนว่า draft หรือ saved)
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
}

// POST /api/barthel
// บันทึก sessions ทั้งหมด (array) — ใช้ UPSERT (INSERT ... ON DUPLICATE KEY UPDATE)
// key ที่ใช้เช็คว่า "แถวเดิม" คือ (hn, session_number, assessed_at)
// ป้องกันปัญหาเดิม: prefill ข้อมูลเก่ามาโชว์ แล้วกด save/autosave ซ้ำ
// กลายเป็น insert แถวใหม่ซ้อนไปเรื่อยๆ ทำให้ dashboard นับ job เพี้ยน
export async function POST(req: NextRequest) {
  const body = await req.json();
  await upsertPatient(pool, body.patientInfo);
  const rows: any[] = Array.isArray(body) ? body : [body];

  // เวลาเดียวกันทั้ง batch นี้ — ทั้งแถวที่ insert ใหม่และแถวที่แค่ update
  // ต้องได้ created_at ตรงกันหมด ไม่งั้น GET (ที่ group ด้วย created_at)
  // จะดึงมาได้ไม่ครบทุก session
  const batchTime = new Date();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const row of rows) {
      const id = crypto.randomUUID();
      // status: ต้องมาจาก payload เท่านั้น ('draft' หรือ 'saved')
      // ถ้าไม่ส่งมาเลย ให้ถือเป็น draft ไว้ก่อนเพื่อความปลอดภัย
      // (กัน field หลุด/ลืมส่งแล้วดันไปนับเป็น job จริงบน dashboard)
      const status = row.status === "saved" ? "saved" : "draft";

      await conn.query(
        `INSERT INTO barthel_assessments 
         (id, hn, session_number, assessed_at, assessed_by, status, created_at,
          feeding, transfers, grooming, toilet_use, bathing,
          mobility, stairs, dressing, bowels, bladder, total_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           assessed_by  = VALUES(assessed_by),
           status       = VALUES(status),
           created_at   = VALUES(created_at),
           feeding      = VALUES(feeding),
           transfers    = VALUES(transfers),
           grooming     = VALUES(grooming),
           toilet_use   = VALUES(toilet_use),
           bathing      = VALUES(bathing),
           mobility     = VALUES(mobility),
           stairs       = VALUES(stairs),
           dressing     = VALUES(dressing),
           bowels       = VALUES(bowels),
           bladder      = VALUES(bladder),
           total_score  = VALUES(total_score)`,
        [
          id,
          row.hn,
          row.session_number,
          row.assessed_at,
          row.assessed_by ?? null,
          status,
          batchTime,
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
