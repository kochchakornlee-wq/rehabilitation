import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.HIS_API_URL ?? "http://10.161.10.17:5556/api/v1";
const API_KEY = process.env.HIS_API_KEY ?? "demo_full_access_key_12345";
const headers = { "X-API-Key": API_KEY };

// ดูเหมือน HN ถ้ามีแต่ตัวเลขและเส้น เช่น "67", "67-13", "6713069554"
function looksLikeHN(s: string) {
  return /^[\d\-]+$/.test(s);
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const fetchOpts = {
    headers,
    signal: controller.signal,
    cache: "no-store" as const,
  };

  try {
    if (!search) {
      clearTimeout(timeout);
      return NextResponse.json([]);
    }

    // ── ค้น HN (input มีแต่ตัวเลขและเส้น)
    if (looksLikeHN(search)) {
      const res = await fetch(
        `${BASE_URL}/patient/hn/${encodeURIComponent(search)}`,
        fetchOpts,
      );
      clearTimeout(timeout);
      if (!res.ok) return NextResponse.json([]);
      const json = await res.json();
      if (json.success && json.data) return NextResponse.json([json.data]);
      return NextResponse.json([]);
    }

    // ── ค้นชื่อ (input มีตัวอักษร)
    const res = await fetch(
      `${BASE_URL}/patient/search/name?name=${encodeURIComponent(search)}&limit=50`,
      fetchOpts,
    );
    clearTimeout(timeout);
    if (!res.ok) return NextResponse.json([]);
    const json = await res.json();
    const data = json.data ?? json;
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch {
    clearTimeout(timeout);
    return NextResponse.json([]);
  }
}
