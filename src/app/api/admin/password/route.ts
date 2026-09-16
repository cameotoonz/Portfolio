import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required." },
        { status: 400 },
      );
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
        { status: 400 },
      );
    }
    const rows = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, user))
      .limit(1);
    const admin = rows[0];
    if (!admin || !verifyPassword(String(currentPassword), admin.passwordHash)) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 403 },
      );
    }
    await db
      .update(adminUsers)
      .set({ passwordHash: hashPassword(String(newPassword)) })
      .where(eq(adminUsers.id, admin.id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 });
  }
}
