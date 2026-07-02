// app/api/dashboard/route.ts
// ดึงข้อมูลสถิติทั้งหมดสำหรับ Dashboard
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") ?? "month"; // week | month | year
  const fromParam = req.nextUrl.searchParams.get("from"); // custom date range
  const toParam = req.nextUrl.searchParams.get("to");
  const hnFilter = req.nextUrl.searchParams.get("hn")?.trim() ?? ""; // HN search
  // parameterized condition strings — ใช้ ? placeholder เท่านั้น ห้าม concat ค่าเข้า SQL ตรงๆ (SQL injection)
  const hnCondition = hnFilter ? " AND hn = ?" : "";
  const hnConditionJ = hnFilter ? " AND j.hn = ?" : "";
  // ช่วย push ค่า hn เข้า params array เมื่อมีการกรอง (เรียกตามจำนวนครั้งที่ query นั้นมี hn placeholder)
  const withHn = (params: any[], times = 1) =>
    hnFilter ? [...params, ...Array(times).fill(hnFilter)] : params;

  try {
    // ─── กำหนด date range ตาม period ───────────────────────────────────────────
    let currentStart: string;
    let currentEnd: string;
    let prevStart: string;
    let prevEnd: string;
    let trendGroupBy: string;
    let trendLabels: string;

    const now = new Date();

    // ─── ถ้ามี custom from/to ให้ใช้แทน period ────────────────────────────────
    if (fromParam && toParam) {
      currentStart = fromParam;
      currentEnd = toParam;
      // prev = ช่วงเดียวกันของปีก่อน
      prevStart = fromParam.replace(
        /^\d{4}/,
        String(parseInt(fromParam.slice(0, 4)) - 1),
      );
      prevEnd = toParam.replace(
        /^\d{4}/,
        String(parseInt(toParam.slice(0, 4)) - 1),
      );
      trendGroupBy = "DATE(created_at)";
      trendLabels = "DATE_FORMAT(created_at, '%d %b')";
    } else if (period === "week") {
      // จันทร์ – ศุกร์ของสัปดาห์ปัจจุบัน
      const day = now.getDay(); // 0=Sun
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((day + 6) % 7));
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);

      const prevMonday = new Date(monday);
      prevMonday.setDate(monday.getDate() - 7);
      const prevFriday = new Date(friday);
      prevFriday.setDate(friday.getDate() - 7);

      currentStart = monday.toISOString().split("T")[0];
      currentEnd = friday.toISOString().split("T")[0];
      prevStart = prevMonday.toISOString().split("T")[0];
      prevEnd = prevFriday.toISOString().split("T")[0];
      trendGroupBy = "DATE(created_at)";
      trendLabels = "DATE_FORMAT(created_at, '%a %d')";
    } else if (period === "month") {
      currentStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      currentEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${lastDay}`;

      const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
      const prevYear =
        now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      prevStart = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
      const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
      prevEnd = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${prevLastDay}`;
      trendGroupBy = "DATE(created_at)";
      trendLabels = "DATE_FORMAT(created_at, '%d %b')";
    } else {
      // year
      currentStart = `${now.getFullYear()}-01-01`;
      currentEnd = `${now.getFullYear()}-12-31`;
      prevStart = `${now.getFullYear() - 1}-01-01`;
      prevEnd = `${now.getFullYear() - 1}-12-31`;
      trendGroupBy = "MONTH(created_at)";
      trendLabels = "DATE_FORMAT(created_at, '%b')";
    }

    // ─── UNION ทุกฟอร์มที่ saved เป็น "jobs" ──────────────────────────────────
    // นับเฉพาะ status='saved' (ไม่นับ draft)
    // แต่ละฟอร์มมี created_at และ therapist/assessor field
    const jobsUnion = `
      SELECT created_at, hn, therapist AS therapist, 'opd' AS form_type,
             diagnosis, assesment AS assessment_json, pain_score,
             visit_date AS form_date, DAYOFWEEK(created_at) AS dow
      FROM opd_forms WHERE status = 'saved'
      UNION ALL
      SELECT created_at, hn, therapist, 'ipd',
             diagnosis, assesment, pain_score,
             visit_date, DAYOFWEEK(created_at)
      FROM ipd_forms WHERE status = 'saved'
      UNION ALL
      SELECT created_at, hn, physiotherapist, 'cancer',
             diagnosis, NULL, pain_scale,
             assessed_at, DAYOFWEEK(created_at)
      FROM ca_assessments WHERE status = 'saved'
      UNION ALL
      SELECT created_at, hn, assessed_by, 'barthel',
             NULL, NULL, NULL,
             assessed_at, DAYOFWEEK(created_at)
      FROM barthel_assessments WHERE status = 'saved'
      UNION ALL
      SELECT created_at, hn, assessor, 'discharge',
             NULL, NULL, NULL,
             date, DAYOFWEEK(created_at)
      FROM \`discharge\` WHERE status = 'saved'
      UNION ALL
      SELECT created_at, hn, assessed_by, 'koos',
             NULL, NULL, NULL,
             assessed_at, DAYOFWEEK(created_at)
      FROM koos_assessments WHERE status = 'saved'
      UNION ALL
      SELECT created_at, hn, assessor_name, 'hip17',
             NULL, NULL, NULL,
             assessor_date, DAYOFWEEK(created_at)
      FROM hip17_assessments WHERE status = 'saved'
      UNION ALL
      SELECT created_at, patient_hn AS hn, physiotherapist, 'tug',
             NULL, NULL, NULL,
             assessment_date, DAYOFWEEK(created_at)
      FROM tug_assessments
      UNION ALL
      SELECT created_at, hn, assessor_name, 'mobility',
             NULL, NULL, NULL,
             assessor_date, DAYOFWEEK(created_at)
      FROM mobility_assessment
      UNION ALL
      SELECT created_at, hn, provider, 'education',
             NULL, NULL, NULL,
             NULL, DAYOFWEEK(created_at)
      FROM education_records
    `;

    // ─── 1. Total jobs (current vs previous) ──────────────────────────────────
    const [[jobsCurrent], [jobsPrev]] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS cnt FROM job_summary j
         WHERE DATE(created_at) BETWEEN ? AND ?${hnConditionJ}`,
        withHn([currentStart, currentEnd]),
      ),
      pool.query(
        `SELECT COUNT(*) AS cnt FROM job_summary j
         WHERE DATE(created_at) BETWEEN ? AND ?${hnConditionJ}`,
        withHn([prevStart, prevEnd]),
      ),
    ]);
    const totalJobs = (jobsCurrent as any[])[0]?.cnt ?? 0;
    const prevJobs = (jobsPrev as any[])[0]?.cnt ?? 0;
    const jobsDelta = totalJobs - prevJobs;
    const jobsDeltaPct = prevJobs > 0 ? (jobsDelta / prevJobs) * 100 : 0;

    // ─── 2. Unique patients + new patients ────────────────────────────────────
    // Unique HN ที่มี activity ในช่วงนี้
    const [uniqueHNs] = (await pool.query(
      `SELECT COUNT(DISTINCT hn) AS cnt FROM job_summary j
       WHERE DATE(created_at) BETWEEN ? AND ?${hnConditionJ}`,
      withHn([currentStart, currentEnd]),
    )) as any[];
    const uniquePatients = uniqueHNs[0]?.cnt ?? 0;

    // "New" = HN ที่ไม่เคยมีใน jobs ก่อน currentStart
    const [newHNs] = (await pool.query(
      `SELECT COUNT(*) AS cnt FROM (
         SELECT DISTINCT hn FROM job_summary j
         WHERE DATE(created_at) BETWEEN ? AND ?
       ) curr
       WHERE hn NOT IN (
         SELECT DISTINCT hn FROM job_summary j
         WHERE DATE(created_at) < ?
       )`,
      [currentStart, currentEnd, currentStart],
    )) as any[];
    const newPatients = newHNs[0]?.cnt ?? 0;

    // ─── 3. Average pain score ────────────────────────────────────────────────
    const [painRows] = (await pool.query(
      `SELECT AVG(CAST(pain_score AS DECIMAL(4,1))) AS avg_pain
       FROM (
         SELECT pain_score FROM opd_forms WHERE status='saved' AND pain_score REGEXP '^[0-9]+$' AND DATE(created_at) BETWEEN ? AND ?${hnCondition}
         UNION ALL
         SELECT pain_score FROM ipd_forms WHERE status='saved' AND pain_score REGEXP '^[0-9]+$' AND DATE(created_at) BETWEEN ? AND ?${hnCondition}
       ) p`,
      [
        ...withHn([currentStart, currentEnd]),
        ...withHn([currentStart, currentEnd]),
      ],
    )) as any[];
    const avgPain = parseFloat(painRows[0]?.avg_pain ?? "0") || 0;

    // ─── 4. Trend data ────────────────────────────────────────────────────────
    const [trendCurrent] = (await pool.query(
      `SELECT ${trendLabels} AS label, COUNT(*) AS cnt
       FROM job_summary j
       WHERE DATE(created_at) BETWEEN ? AND ?${hnConditionJ}
       GROUP BY ${trendGroupBy}
       ORDER BY created_at ASC`,
      withHn([currentStart, currentEnd]),
    )) as any[];

    const [trendPrev] = (await pool.query(
      `SELECT ${trendLabels} AS label, COUNT(*) AS cnt
       FROM job_summary j
       WHERE DATE(created_at) BETWEEN ? AND ?${hnConditionJ}
       GROUP BY ${trendGroupBy}
       ORDER BY created_at ASC`,
      withHn([prevStart, prevEnd]),
    )) as any[];

    const trendCurrentData = trendCurrent as any[];
    const trendPrevData = trendPrev as any[];
    const trend = {
      labels: trendCurrentData.map((r: any) => r.label),
      current: trendCurrentData.map((r: any) => r.cnt),
      previous: trendPrevData.map((r: any) => r.cnt),
    };

    // ─── 5. Daily distribution (Mon–Fri) ─────────────────────────────────────
    // DAYOFWEEK: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
    const [dailyRows] = (await pool.query(
      `SELECT DAYOFWEEK(created_at) AS dow, COUNT(*) AS cnt
       FROM job_summary j
       WHERE DATE(created_at) BETWEEN ? AND ?
         AND DAYOFWEEK(created_at) BETWEEN 2 AND 6${hnConditionJ}
       GROUP BY DAYOFWEEK(created_at)
       ORDER BY dow`,
      withHn([currentStart, currentEnd]),
    )) as any[];

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const dailyMap: Record<number, number> = {};
    (dailyRows as any[]).forEach((r: any) => {
      dailyMap[r.dow] = r.cnt;
    });
    const daily = {
      labels: dayNames,
      values: [2, 3, 4, 5, 6].map((dow) => dailyMap[dow] ?? 0),
    };

    // ─── 6. Clinical categories (Ortho/Neuro/Cardio) ─────────────────────────
    // ดึงจาก assesment JSON field ใน opd_forms และ ipd_forms
    // JSON key: orthopedics / neurology / cardiopulmonary + checked:true
    const [opdAssmt] = (await pool.query(
      `SELECT assesment FROM opd_forms
       WHERE status='saved' AND assesment IS NOT NULL AND assesment != 'null'
         AND DATE(created_at) BETWEEN ? AND ?${hnCondition}`,
      withHn([currentStart, currentEnd]),
    )) as any[];

    const [ipdAssmt] = (await pool.query(
      `SELECT assesment FROM ipd_forms
       WHERE status='saved' AND assesment IS NOT NULL AND assesment != 'null'
         AND DATE(created_at) BETWEEN ? AND ?${hnCondition}`,
      withHn([currentStart, currentEnd]),
    )) as any[];

    let orthoCount = 0,
      neuroCount = 0,
      cardioCount = 0;
    const allAssmt = [...(opdAssmt as any[]), ...(ipdAssmt as any[])];
    for (const row of allAssmt) {
      try {
        const json =
          typeof row.assesment === "string"
            ? JSON.parse(row.assesment)
            : row.assesment;
        if (json?.orthopedics?.checked) orthoCount++;
        if (json?.neurology?.checked) neuroCount++;
        if (json?.cardiopulmonary?.checked) cardioCount++;
      } catch {
        /* skip malformed */
      }
    }

    const categories = [
      { name: "Orthopedics", count: orthoCount, color: "#2a78d6" },
      { name: "Neurology", count: neuroCount, color: "#4a3aa7" },
      { name: "Cardiopulmonary", count: cardioCount, color: "#e87ba4" },
    ].sort((a, b) => b.count - a.count);

    // ─── 7. Form type distribution ────────────────────────────────────────────
    const [formRows] = (await pool.query(
      `SELECT form_type, COUNT(*) AS cnt
       FROM job_summary j
       WHERE DATE(created_at) BETWEEN ? AND ?${hnConditionJ}
       GROUP BY form_type
       ORDER BY cnt DESC`,
      withHn([currentStart, currentEnd]),
    )) as any[];

    const formLabels: Record<string, string> = {
      opd: "OPD",
      ipd: "IPD",
      cancer: "Cancer (CA)",
      barthel: "Barthel",
      discharge: "Discharge",
      koos: "KOOS/HOOS",
      hip17: "HIP-17",
      tug: "TUG",
      mobility: "Mobility",
      education: "Education",
    };
    const formTypes = (formRows as any[]).map((r: any) => ({
      name: formLabels[r.form_type] ?? r.form_type,
      count: r.cnt,
    }));

    // ─── 8. Top therapists ────────────────────────────────────────────────────
    const [therapistRows] = (await pool.query(
      `SELECT therapist_name AS name, COUNT(*) AS cnt
   FROM job_summary j
   WHERE DATE(created_at) BETWEEN ? AND ?
     AND therapist_name IS NOT NULL AND therapist_name != ''${hnConditionJ}
   GROUP BY therapist_name
   ORDER BY cnt DESC
   LIMIT 5`,
      withHn([currentStart, currentEnd]),
    )) as any[];
    const therapists = (therapistRows as any[]).map((r: any) => ({
      name: r.name,
      count: r.cnt,
    }));

    // ─── 9. OPD vs IPD trend ─────────────────────────────────────────────────
    const [opdTrend] = (await pool.query(
      `SELECT ${trendLabels} AS label, COUNT(*) AS cnt
       FROM opd_forms WHERE status='saved' AND DATE(created_at) BETWEEN ? AND ?${hnCondition}
       GROUP BY ${trendGroupBy} ORDER BY created_at`,
      withHn([currentStart, currentEnd]),
    )) as any[];

    const [ipdTrend] = (await pool.query(
      `SELECT ${trendLabels} AS label, COUNT(*) AS cnt
       FROM ipd_forms WHERE status='saved' AND DATE(created_at) BETWEEN ? AND ?${hnCondition}
       GROUP BY ${trendGroupBy} ORDER BY created_at`,
      withHn([currentStart, currentEnd]),
    )) as any[];

    // Merge labels
    const allLabels = Array.from(
      new Set([
        ...(opdTrend as any[]).map((r: any) => r.label),
        ...(ipdTrend as any[]).map((r: any) => r.label),
      ]),
    );
    const opdMap: Record<string, number> = {};
    const ipdMap: Record<string, number> = {};
    (opdTrend as any[]).forEach((r: any) => {
      opdMap[r.label] = r.cnt;
    });
    (ipdTrend as any[]).forEach((r: any) => {
      ipdMap[r.label] = r.cnt;
    });

    const opdIpdTrend = {
      labels: allLabels,
      opd: allLabels.map((l) => opdMap[l] ?? 0),
      ipd: allLabels.map((l) => ipdMap[l] ?? 0),
    };

    // ─── 10. Patient type (Thai/Expat/Fly-in) from patients table ─────────────
    // ดึงจาก patients table ที่ sync จาก HIS
    const [patientTypeRows] = (await pool.query(
      `SELECT patient_type, COUNT(*) AS cnt
       FROM patients
       WHERE patient_type IS NOT NULL AND last_visit BETWEEN ? AND ?${hnCondition}
       GROUP BY patient_type`,
      withHn([currentStart, currentEnd]),
    )) as any[];

    const typeColors: Record<string, string> = {
      Thai: "#2a78d6",
      Expat: "#1baf7a",
      "Fly-in": "#eda100",
    };
    const patientTypes = (patientTypeRows as any[]).map((r: any) => ({
      label: r.patient_type,
      count: r.cnt,
      color: typeColors[r.patient_type] ?? "#888",
    }));

    // ─── 11. New patient diagnosis breakdown (top diagnoses) ─────────────────
    const [diagRows] = (await pool.query(
      `SELECT diagnosis, COUNT(*) AS cnt
       FROM (
         SELECT diagnosis FROM opd_forms WHERE status='saved' AND diagnosis IS NOT NULL AND diagnosis != ''
           AND DATE(created_at) BETWEEN ? AND ?${hnCondition}
         UNION ALL
         SELECT diagnosis FROM ipd_forms WHERE status='saved' AND diagnosis IS NOT NULL AND diagnosis != ''
           AND DATE(created_at) BETWEEN ? AND ?${hnCondition}
         UNION ALL
         SELECT diagnosis FROM ca_assessments WHERE status='saved' AND diagnosis IS NOT NULL AND diagnosis != ''
           AND DATE(created_at) BETWEEN ? AND ?${hnCondition}
       ) d
       GROUP BY diagnosis ORDER BY cnt DESC LIMIT 6`,
      [
        ...withHn([currentStart, currentEnd]),
        ...withHn([currentStart, currentEnd]),
        ...withHn([currentStart, currentEnd]),
      ],
    )) as any[];

    const topDiagnoses = (diagRows as any[]).map((r: any) => ({
      name: r.diagnosis,
      count: r.cnt,
    }));

    // ─── Response ─────────────────────────────────────────────────────────────
    return NextResponse.json({
      period,
      dateRange: { from: currentStart, to: currentEnd },
      jobs: totalJobs,
      jobsDelta,
      jobsDeltaPct: Math.round(jobsDeltaPct * 10) / 10,
      patients: uniquePatients,
      newPatients,
      avgPain: Math.round(avgPain * 10) / 10,
      trend,
      daily,
      categories,
      formTypes,
      therapists,
      opdIpdTrend,
      patientTypes,
      topDiagnoses,
      patientTypeHasSyncData: patientTypes.length > 0,
      hnFilter,
      isFiltered: !!hnFilter,
    });
  } catch (err: any) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
