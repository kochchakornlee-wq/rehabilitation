import { NextResponse } from "next/server"

// POST /api/auth/logout
export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set("token", "", { maxAge: 0, path: "/" })
  return response
}
