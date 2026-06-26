// middleware.ts (วางที่ root)
import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const isAuth = req.nextUrl.pathname.startsWith("/login") ||
                 req.nextUrl.pathname.startsWith("/reset-password")

  if (!token && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\.svg|.*\\.jpg|.*\\.png).*)"],
}