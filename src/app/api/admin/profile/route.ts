import { db } from "@/db";
import { profile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getProfile, serializeProfile } from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const p = await getProfile();
  return NextResponse.json({ profile: p ? serializeProfile(p) : null });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const b = await req.json();
    const current = await getProfile();
    if (!current) {
      return NextResponse.json({ error: "Profile missing" }, { status: 500 });
    }
    const s = (v: unknown, fallback: string) =>
      v === undefined ? fallback : String(v ?? "").trim();

    const [updated] = await db
      .update(profile)
      .set({
        name: s(b.name, current.name) || current.name,
        professionalTitle: s(b.professionalTitle, current.professionalTitle),
        location: s(b.location, current.location),
        email: s(b.email, current.email),
        phone: s(b.phone, current.phone),
        whatsapp: s(b.whatsapp, current.whatsapp),
        instagramHandle: s(b.instagramHandle, current.instagramHandle),
        instagramUrl: s(b.instagramUrl, current.instagramUrl),
        heroEyebrow: s(b.heroEyebrow, current.heroEyebrow),
        heroHeading: s(b.heroHeading, current.heroHeading),
        heroDescription: s(b.heroDescription, current.heroDescription),
        heroPrimaryBtn: s(b.heroPrimaryBtn, current.heroPrimaryBtn),
        heroSecondaryBtn: s(b.heroSecondaryBtn, current.heroSecondaryBtn),
        portraitUrl: s(b.portraitUrl, current.portraitUrl),
        aboutHeading: s(b.aboutHeading, current.aboutHeading),
        aboutText: s(b.aboutText, current.aboutText),
        aboutExtra: s(b.aboutExtra, current.aboutExtra),
        contactHeading: s(b.contactHeading, current.contactHeading),
        contactSubheading: s(b.contactSubheading, current.contactSubheading),
        contactIntro: s(b.contactIntro, current.contactIntro),
        footerName: s(b.footerName, current.footerName),
        copyrightText: s(b.copyrightText, current.copyrightText),
        projectsCount:
          b.projectsCount === undefined
            ? current.projectsCount
            : Math.max(0, Number(b.projectsCount) || 0),
        updatedAt: new Date(),
      })
      .where(eq(profile.id, current.id))
      .returning();
    return NextResponse.json({ profile: serializeProfile(updated) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
  }
}
