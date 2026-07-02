import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password)
    return NextResponse.json(
      { error: "กรุณากรอกข้อมูลให้ครบ" },
      { status: 400 },
    );

  const [rows] = await pool.query(
    `SELECT * FROM users WHERE username = ? LIMIT 1`,
    [username],
  );
  const users = rows as any[];

  if (users.length === 0)
    return NextResponse.json(
      { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 },
    );

  const user = users[0];
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid)
    return NextResponse.json(
      { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 },
    );

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" },
  );

  const response = NextResponse.json({
    success: true,
    username: user.username,
  });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 ชั่วโมง
    path: "/",
  });

  return response;
}
