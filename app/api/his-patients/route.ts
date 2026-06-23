// app/api/his-patients/route.ts
import { NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.NEXT_PUBLIC_HIS_API_URL ?? "http://localhost:5550/api/v1"
const API_KEY  = process.env.HIS_API_KEY ?? "demo_full_access_key_12345"
const headers  = { "X-API-Key": API_KEY }

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search")?.trim() ?? ""

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    let url = ""

    if (search) {
      // ลอง HN ก่อน
      const hnRes = await fetch(
        `${BASE_URL}/patient/hn/${encodeURIComponent(search)}`,
        { headers, signal: controller.signal, cache: "no-store" }
      )
      if (hnRes.ok) {
        const hnJson = await hnRes.json()
        if (hnJson.success) {
          clearTimeout(timeout)
          return NextResponse.json([hnJson.data])
        }
      }
      // ค้นชื่อ
      url = `${BASE_URL}/patient/search/name?name=${encodeURIComponent(search)}&limit=50`
    } else {
      // ดึงทุกคน
      url = `${BASE_URL}/patient/search/name?name=&limit=100`
    }

    const res = await fetch(url, { headers, signal: controller.signal, cache: "no-store" })
    clearTimeout(timeout)

    if (!res.ok) return NextResponse.json([])

    const json = await res.json()
    const data = json.data ?? json
    return NextResponse.json(Array.isArray(data) ? data : [])

  } catch {
    clearTimeout(timeout)
    return NextResponse.json([])
  }
}