import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSessionToken, sessionCookie, verifyPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 },
      );
    }
    const rows = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, String(username)))
      .limit(1);
    const user = rows[0];
    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 },
      );
    }
    const res = NextResponse.json({ ok: true, username: user.username });
    res.cookies.set(sessionCookie.name, createSessionToken(user.username), {
      ...sessionCookie.options,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
