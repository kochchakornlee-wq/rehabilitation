import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

// POST /api/auth/reset-password
export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password)
    return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });

  // หา user จาก token และเช็คว่ายังไม่หมดอายุ
  const [rows] = await pool.query(
    `SELECT * FROM users 
     WHERE reset_token = ? AND reset_token_expires > NOW() 
     LIMIT 1`,
    [token],
  );
  const users = rows as any[];

  if (users.length === 0)
    return NextResponse.json(
      { error: "ลิงก์หมดอายุหรือไม่ถูกต้อง" },
      { status: 400 },
    );

  const user = users[0];
  const password_hash = await bcrypt.hash(password, 12);

  // อัปเดต password และล้าง token
  await pool.query(
    `UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?`,
    [password_hash, user.id],
  );

  return NextResponse.json({ success: true });
}
