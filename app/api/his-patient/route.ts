// app/api/his-patient/route.ts
// proxy ไว้ฝั่ง server เพื่อไม่ให้ API key โชว์ใน client

import { NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.HIS_API_URL ?? "http://localhost:5550/api/v1"
const API_KEY  = process.env.HIS_API_KEY ?? "demo_full_access_key_12345"

export async function GET(req: NextRequest) {
  const hn = req.nextUrl.searchParams.get("hn")
  if (!hn) return NextResponse.json({ error: "hn is required" }, { status: 400 })

  if (!/^[\w\-]{3,20}$/.test(hn)) {
    return NextResponse.json({ error: "Invalid HN" }, { status: 400 })
  }
  try {
    const res = await fetch(`${BASE_URL}/patient/hn/${encodeURIComponent(hn)}`, {
      headers: { "X-API-Key": API_KEY },
      cache: "no-store",
    })

    if (!res.ok) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

    const json = await res.json()
    if (!json.success) return NextResponse.json({ error: "Patient not found" }, { status: 404 })

    return NextResponse.json(json.data)
  } catch {
    return NextResponse.json({ error: "HIS API unavailable" }, { status: 503 })
  }
}