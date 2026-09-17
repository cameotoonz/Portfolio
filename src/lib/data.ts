import { db } from "@/db";
import {
  projects,
  profile,
  adminUsers,
  services,
  settings,
  projectMedia,
} from "@/db/schema";
import type {
  Project,
  Profile,
  Service,
  Settings,
  ProjectMedia,
} from "@/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";

const DEFAULT_HERO_DESCRIPTION =
  "I'm Nitesh — a video editor and motion designer from Delhi. I shape raw footage into tight, cinematic stories: pacing, sound and motion working together so people feel something when they watch.";

const DEFAULT_ABOUT_HEADING =
  "Editing isn't just about making footage look good. \u2014 it's about making people feel something.";

const DEFAULT_ABOUT_TEXT =
  "For the past few years I've been cutting everything from long-form YouTube documentaries and institute films to fast-moving reels and shorts. My work lives in the timeline: retention-focused pacing, intentional sound design, clean typography and motion that serves the story instead of decorating it. I work in Premiere Pro, After Effects, Photoshop and Illustrator every day — and I obsess over the two seconds you barely notice, because those are the ones that make the whole piece feel expensive.";

const SEED_EXTRA = {
  role: "Editor & Motion Designer",
  tags: "",
  status: "published",
  privacy: "public",
  durationSec: 0,
  width: 0,
  height: 0,
  fps: 0,
  fileSize: 0,
  videoFormat: "",
  embedSettings: "{}",
  deletedAt: null,
};

const SEED_PROJECTS: Array<
  Omit<Project, "id" | "createdAt" | "updatedAt">
> = [
  // ─── LONG FORM ───
  {
    title: "UI/UX Student Success Story",
    slug: "uiux-student-success-story",
    category: "long",
    description:
      "A long-form student success story for ADMEC Multimedia — interview-driven narrative, structured pacing and clean lower-third systems throughout.",
    thumbnailUrl: "https://img.youtube.com/vi/2dtas6lbR80/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtu.be/2dtas6lbR80",
    uploadedVideo: "",
    platform: "youtube",
    orientation: "horizontal",
    client: "ADMEC Multimedia",
    year: "2024",
    tools: "Premiere Pro, After Effects",
    featured: true,
    published: true,
    displayOrder: 1,
    ...SEED_EXTRA,
  },
  {
    title: "UI/UX Design Course — Student Feedback",
    slug: "uiux-design-course-feedback",
    category: "long",
    description:
      "Multi-cam testimonial edit with retention-focused structure, sound design and subtle motion graphics.",
    thumbnailUrl: "https://img.youtube.com/vi/ZdN2ptci7ok/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtu.be/ZdN2ptci7ok",
    uploadedVideo: "",
    platform: "youtube",
    orientation: "horizontal",
    client: "ADMEC Multimedia",
    year: "2024",
    tools: "Premiere Pro",
    featured: false,
    published: true,
    displayOrder: 2,
    ...SEED_EXTRA,
  },
  {
    title: "Students' Journey — Graphic Design",
    slug: "students-journey-graphic-design",
    category: "long",
    description:
      "A documentary-style journey piece following design students — built around b-roll, rhythm and emotional beats.",
    thumbnailUrl: "https://img.youtube.com/vi/pXREsurAuEE/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtu.be/pXREsurAuEE",
    uploadedVideo: "",
    platform: "youtube",
    orientation: "horizontal",
    client: "ADMEC Multimedia",
    year: "2024",
    tools: "Premiere Pro, After Effects",
    featured: false,
    published: true,
    displayOrder: 3,
    ...SEED_EXTRA,
  },
  {
    title: "How Tauseef Mastered PHP & MySQL",
    slug: "how-tauseef-mastered-php-mysql",
    category: "long",
    description:
      "An inspiring student journey film — structured like a mini-documentary with a clear hook, tension and payoff.",
    thumbnailUrl: "https://img.youtube.com/vi/0eVg1vVAmYo/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtu.be/0eVg1vVAmYo",
    uploadedVideo: "",
    platform: "youtube",
    orientation: "horizontal",
    client: "ADMEC Multimedia",
    year: "2024",
    tools: "Premiere Pro",
    featured: false,
    published: true,
    displayOrder: 4,
    ...SEED_EXTRA,
  },
  {
    title: "Mega Design Competition",
    slug: "mega-design-competition",
    category: "long",
    description:
      "Event coverage edit — fast-paced but structured, with energetic cuts and motion-graphic branding moments.",
    thumbnailUrl: "https://img.youtube.com/vi/pPoCS82plQQ/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtu.be/pPoCS82plQQ",
    uploadedVideo: "",
    platform: "youtube",
    orientation: "horizontal",
    client: "ADMEC Multimedia",
    year: "2024",
    tools: "Premiere Pro, After Effects",
    featured: false,
    published: true,
    displayOrder: 5,
    ...SEED_EXTRA,
  },
  {
    title: "Graphic Design — Student Review",
    slug: "graphic-design-student-review",
    category: "long",
    description:
      "Long-form review piece — clean interview cuts, supporting b-roll and branded motion elements.",
    thumbnailUrl: "https://img.youtube.com/vi/xl4ou0YNxDM/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtu.be/xl4ou0YNxDM",
    uploadedVideo: "",
    platform: "youtube",
    orientation: "horizontal",
    client: "ADMEC Multimedia",
    year: "2024",
    tools: "Premiere Pro",
    featured: false,
    published: true,
    displayOrder: 6,
    ...SEED_EXTRA,
  },
  // ─── SHORT FORM ───
  {
    title: "Is Editing Really That Powerful?",
    slug: "is-editing-really-that-powerful",
    category: "short",
    description:
      "A before/after breakdown proving what a timeline can do — hook-first short form built for retention.",
    thumbnailUrl: "https://img.youtube.com/vi/7TuPSZmzOqY/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtube.com/shorts/7TuPSZmzOqY",
    uploadedVideo: "",
    platform: "youtube-shorts",
    orientation: "vertical",
    client: "Self-initiated",
    year: "2024",
    tools: "Premiere Pro, After Effects",
    featured: true,
    published: true,
    displayOrder: 1,
    ...SEED_EXTRA,
  },
  {
    title: "Documentary Edit — Rate It 1–10",
    slug: "documentary-edit-rate-1-10",
    category: "short",
    description:
      "Cinematic documentary grading and pacing compressed into a vertical format.",
    thumbnailUrl: "https://img.youtube.com/vi/WM5w5YWv5jA/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtube.com/shorts/WM5w5YWv5jA",
    uploadedVideo: "",
    platform: "youtube-shorts",
    orientation: "vertical",
    client: "Self-initiated",
    year: "2024",
    tools: "Premiere Pro",
    featured: false,
    published: true,
    displayOrder: 2,
    ...SEED_EXTRA,
  },
  {
    title: "Rate This Edit — Motion Graphics",
    slug: "rate-this-edit-motion-graphics",
    category: "short",
    description:
      "Punchy motion-graphics showcase — typography, transitions and rhythm in under sixty seconds.",
    thumbnailUrl: "https://img.youtube.com/vi/e3TQGlrSkCY/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtube.com/shorts/e3TQGlrSkCY",
    uploadedVideo: "",
    platform: "youtube-shorts",
    orientation: "vertical",
    client: "Self-initiated",
    year: "2024",
    tools: "After Effects",
    featured: false,
    published: true,
    displayOrder: 3,
    ...SEED_EXTRA,
  },
  {
    title: "A Startup Killed Retail Kings",
    slug: "a-startup-killed-retail-kings",
    category: "short",
    description:
      "The Flipkart story told as a vertical micro-documentary — narrative editing with archival texture.",
    thumbnailUrl: "https://img.youtube.com/vi/ATLVCgPAqFM/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtube.com/shorts/ATLVCgPAqFM",
    uploadedVideo: "",
    platform: "youtube-shorts",
    orientation: "vertical",
    client: "Self-initiated",
    year: "2024",
    tools: "Premiere Pro, After Effects",
    featured: false,
    published: true,
    displayOrder: 4,
    ...SEED_EXTRA,
  },
  {
    title: "Video Editing Courses",
    slug: "video-editing-courses",
    category: "short",
    description:
      "Promotional vertical cut — social-first pacing, bold text moments and a clean call to action.",
    thumbnailUrl: "https://img.youtube.com/vi/6UCzopp1q5M/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtube.com/shorts/6UCzopp1q5M",
    uploadedVideo: "",
    platform: "youtube-shorts",
    orientation: "vertical",
    client: "ADMEC Multimedia",
    year: "2024",
    tools: "Premiere Pro",
    featured: false,
    published: true,
    displayOrder: 5,
    ...SEED_EXTRA,
  },
  {
    title: "3 Resume Design Tips",
    slug: "3-resume-design-tips",
    category: "short",
    description:
      "Educational short — three beats, three payoffs. Typography-led editing for social feeds.",
    thumbnailUrl: "https://img.youtube.com/vi/FkyK4tV-kO4/maxresdefault.jpg",
    videoSourceType: "external",
    videoUrl: "https://youtube.com/shorts/FkyK4tV-kO4",
    uploadedVideo: "",
    platform: "youtube-shorts",
    orientation: "vertical",
    client: "ADMEC Multimedia",
    year: "2024",
    tools: "Premiere Pro",
    featured: false,
    published: true,
    displayOrder: 6,
    ...SEED_EXTRA,
  },
];

const DEFAULTS = {
  heroEyebrow: "VIDEO EDITOR · MOTION DESIGNER",
  heroHeading:
    "I TURN RAW FOOTAGE\nINTO *visual stories*\nTHAT PEOPLE REMEMBER.",
  heroPrimaryBtn: "View my work",
  heroSecondaryBtn: "Let's talk",
  aboutExtra:
    "Every project starts with a conversation about the story — not the software. Send a message and we'll talk through pacing, references and where the piece needs to land.",
  contactHeading: "HAVE A PROJECT\nIN MIND?",
  contactSubheading: "Let's make it move.",
  contactIntro:
    "Tell me about the story you're trying to tell. I usually reply within a day — WhatsApp is fastest.",
  footerName: "NITESH KUAMR",
  copyrightText: "© 2026 NITESH KUAMR",
};

const SEED_SERVICES = [
  {
    itemNumber: "01",
    title: "VIDEO EDITING",
    description:
      "Long-form storytelling, YouTube content and retention-focused editing that holds attention to the last frame.",
    displayOrder: 1,
    enabled: true,
  },
  {
    itemNumber: "02",
    title: "SHORT FORM",
    description:
      "Reels, Shorts and social content built around pacing, hooks and visual rhythm — seconds that feel intentional.",
    displayOrder: 2,
    enabled: true,
  },
  {
    itemNumber: "03",
    title: "MOTION GRAPHICS",
    description:
      "Typography, transitions, visual effects and motion systems that give every cut a designed feel.",
    displayOrder: 3,
    enabled: true,
  },
  {
    itemNumber: "04",
    title: "CREATIVE EDITING",
    description:
      "Cinematic storytelling, B-roll direction, sound design and visual direction — the full post pipeline.",
    displayOrder: 4,
    enabled: true,
  },
];

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  try {
    const existing = await db.select().from(profile).limit(1);
    if (existing.length === 0) {
      await db.insert(profile).values({
        name: "NITESH KUAMR",
        professionalTitle: "VIDEO EDITOR · MOTION GRAPHIC DESIGNER",
        location: "Delhi, India",
        email: "niteshedits2002@gmail.com",
        phone: "+91 93158 41623",
        whatsapp: "919315841623",
        instagramHandle: "@framesbyniteshh",
        instagramUrl: "https://www.instagram.com/framesbyniteshh/",
        heroEyebrow: DEFAULTS.heroEyebrow,
        heroHeading: DEFAULTS.heroHeading,
        heroDescription: DEFAULT_HERO_DESCRIPTION,
        heroPrimaryBtn: DEFAULTS.heroPrimaryBtn,
        heroSecondaryBtn: DEFAULTS.heroSecondaryBtn,
        portraitUrl: "/images/portrait.webp",
        aboutHeading: DEFAULT_ABOUT_HEADING,
        aboutText: DEFAULT_ABOUT_TEXT,
        aboutExtra: DEFAULTS.aboutExtra,
        contactHeading: DEFAULTS.contactHeading,
        contactSubheading: DEFAULTS.contactSubheading,
        contactIntro: DEFAULTS.contactIntro,
        footerName: DEFAULTS.footerName,
        copyrightText: DEFAULTS.copyrightText,
        projectsCount: 12,
      });
    } else {
      const row = existing[0];
      const patch: Record<string, string> = {};
      const back = (key: keyof typeof row, value: string) => {
        if (!(row[key] as string)) patch[key] = value;
      };
      back("heroEyebrow", DEFAULTS.heroEyebrow);
      back("heroHeading", DEFAULTS.heroHeading);
      back("heroPrimaryBtn", DEFAULTS.heroPrimaryBtn);
      back("heroSecondaryBtn", DEFAULTS.heroSecondaryBtn);
      back("aboutExtra", DEFAULTS.aboutExtra);
      back("contactHeading", DEFAULTS.contactHeading);
      back("contactSubheading", DEFAULTS.contactSubheading);
      back("contactIntro", DEFAULTS.contactIntro);
      back("footerName", row.name || DEFAULTS.footerName);
      back("copyrightText", DEFAULTS.copyrightText);
      if (Object.keys(patch).length > 0) {
        await db.update(profile).set(patch).where(eq(profile.id, row.id));
      }
    }
    const existingServices = await db
      .select({ id: services.id })
      .from(services)
      .limit(1);
    if (existingServices.length === 0) {
      await db.insert(services).values(SEED_SERVICES);
    }
    const existingSettings = await db
      .select({ id: settings.id })
      .from(settings)
      .limit(1);
    if (existingSettings.length === 0) {
      await db.insert(settings).values({
        siteTitle: "Nitesh Kuamr — Video Editor & Motion Graphic Designer",
        siteDescription:
          "Portfolio of Nitesh Kuamr, a video editor and motion graphic designer from Delhi, India.",
      });
    }
    const existingProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .limit(1);
    if (existingProjects.length === 0) {
      await db.insert(projects).values(
        SEED_PROJECTS.map((p) => ({
          ...p,
          tags:
            p.category === "long"
              ? "Video Editing, Documentary, Storytelling"
              : "Short Form, Social Media, Motion Graphics",
        })),
      );
    }
    const existingAdmin = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .limit(1);
    if (existingAdmin.length === 0) {
      await db.insert(adminUsers).values({
        username: process.env.ADMIN_USERNAME || "admin",
        passwordHash: hashPassword(process.env.ADMIN_PASSWORD || "nitesh2026"),
      });
    }
    seeded = true;
  } catch (e) {
    console.error("Seed check failed:", e);
  }
}

// ----------------------------------------------------------------------
// ERROR HANDLING APPLIED BELOW: Fallback to Seed data if DB fails
// ----------------------------------------------------------------------

export async function getProfile(): Promise<Profile | null> {
  try {
    await ensureSeeded();
    const rows = await db.select().from(profile).limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error("Database unavailable, falling back to static Profile.");
    // Fallback static profile
    return {
      id: 1,
      name: "NITESH KUAMR",
      professionalTitle: "VIDEO EDITOR · MOTION GRAPHIC DESIGNER",
      location: "Delhi, India",
      email: "niteshedits2002@gmail.com",
      phone: "+91 93158 41623",
      whatsapp: "919315841623",
      instagramHandle: "@framesbyniteshh",
      instagramUrl: "https://www.instagram.com/framesbyniteshh/",
      heroEyebrow: DEFAULTS.heroEyebrow,
      heroHeading: DEFAULTS.heroHeading,
      heroDescription: DEFAULT_HERO_DESCRIPTION,
      heroPrimaryBtn: DEFAULTS.heroPrimaryBtn,
      heroSecondaryBtn: DEFAULTS.heroSecondaryBtn,
      portraitUrl: "/images/portrait.webp",
      aboutHeading: DEFAULT_ABOUT_HEADING,
      aboutText: DEFAULT_ABOUT_TEXT,
      aboutExtra: DEFAULTS.aboutExtra,
      contactHeading: DEFAULTS.contactHeading,
      contactSubheading: DEFAULTS.contactSubheading,
      contactIntro: DEFAULTS.contactIntro,
      footerName: DEFAULTS.footerName,
      copyrightText: DEFAULTS.copyrightText,
      projectsCount: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Profile;
  }
}

export async function getPublishedProjects(): Promise<Project[]> {
  try {
    await ensureSeeded();
    return await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.status, "published"),
          eq(projects.privacy, "public"),
          isNull(projects.deletedAt),
        ),
      )
      .orderBy(asc(projects.displayOrder), asc(projects.id));
  } catch (error) {
    console.error("Database unavailable, falling back to static Projects.");
    // Fallback returning SEED_PROJECTS
    return SEED_PROJECTS.map((p, idx) => ({
      ...p,
      id: idx + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as Project[];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    await ensureSeeded();
    const rows = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.slug, slug),
          eq(projects.status, "published"),
          isNull(projects.deletedAt),
        ),
      )
      .limit(1);
    const p = rows[0];
    if (!p || p.privacy === "private") return null;
    return p;
  } catch (error) {
    console.error("Database unavailable, falling back to static Project By Slug.");
    const found = SEED_PROJECTS.find(p => p.slug === slug);
    if (!found) return null;
    return { ...found, id: 99, createdAt: new Date(), updatedAt: new Date() } as Project;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    await ensureSeeded();
    return await db
      .select()
      .from(projects)
      .where(isNull(projects.deletedAt))
      .orderBy(asc(projects.category), asc(projects.displayOrder), asc(projects.id));
  } catch (error) {
    return SEED_PROJECTS.map((p, idx) => ({
      ...p,
      id: idx + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as Project[];
  }
}

export async function getProjectMedia(projectId: number): Promise<ProjectMedia[]> {
  try {
    return await db
      .select()
      .from(projectMedia)
      .where(eq(projectMedia.projectId, projectId))
      .orderBy(asc(projectMedia.displayOrder), asc(projectMedia.id));
  } catch (error) {
    return []; // Return empty array if DB fails
  }
}

export function serializeMediaItem(m: ProjectMedia) {
  return {
    id: m.id,
    projectId: m.projectId,
    kind: m.kind as "image" | "video" | "embed",
    url: m.url,
    caption: m.caption,
    displayOrder: m.displayOrder,
  };
}

export type ProjectMediaDTO = ReturnType<typeof serializeMediaItem>;

export function serializeProject(p: Project) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category as "long" | "short",
    description: p.description,
    thumbnailUrl: p.thumbnailUrl,
    videoSourceType: p.videoSourceType as "upload" | "external",
    videoUrl: p.videoUrl,
    uploadedVideo: p.uploadedVideo,
    platform: p.platform,
    orientation: p.orientation as "horizontal" | "vertical",
    client: p.client,
    year: p.year,
    role: p.role,
    tools: p.tools,
    tags: p.tags,
    featured: p.featured,
    published: p.published,
    status: p.status as "draft" | "published" | "unpublished",
    privacy: p.privacy as "public" | "unlisted" | "private",
    durationSec: p.durationSec,
    width: p.width,
    height: p.height,
    fps: p.fps,
    fileSize: p.fileSize,
    videoFormat: p.videoFormat,
    embedSettings: p.embedSettings,
    displayOrder: p.displayOrder,
    createdAt: p.createdAt?.toISOString?.() ?? null,
    updatedAt: p.updatedAt?.toISOString?.() ?? null,
  };
}

export interface EmbedSettings {
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  startTime: number;
}

export function parseEmbedSettings(raw: string): EmbedSettings {
  const base: EmbedSettings = {
    autoplay: true,
    muted: false,
    loop: false,
    controls: true,
    startTime: 0,
  };
  try {
    const parsed = JSON.parse(raw || "{}");
    return {
      autoplay: parsed.autoplay ?? base.autoplay,
      muted: parsed.muted ?? base.muted,
      loop: parsed.loop ?? base.loop,
      controls: parsed.controls ?? base.controls,
      startTime: Number(parsed.startTime) || 0,
    };
  } catch {
    return base;
  }
}

export type ProjectDTO = ReturnType<typeof serializeProject>;

export function serializeProfile(p: Profile) {
  return {
    id: p.id,
    name: p.name,
    professionalTitle: p.professionalTitle,
    location: p.location,
    email: p.email,
    phone: p.phone,
    whatsapp: p.whatsapp,
    instagramHandle: p.instagramHandle,
    instagramUrl: p.instagramUrl,
    heroEyebrow: p.heroEyebrow,
    heroHeading: p.heroHeading,
    heroDescription: p.heroDescription,
    heroPrimaryBtn: p.heroPrimaryBtn,
    heroSecondaryBtn: p.heroSecondaryBtn,
    portraitUrl: p.portraitUrl,
    aboutHeading: p.aboutHeading,
    aboutText: p.aboutText,
    aboutExtra: p.aboutExtra,
    contactHeading: p.contactHeading,
    contactSubheading: p.contactSubheading,
    contactIntro: p.contactIntro,
    footerName: p.footerName,
    copyrightText: p.copyrightText,
    projectsCount: p.projectsCount,
    updatedAt: p.updatedAt?.toISOString?.() ?? null,
  };
}

export type ProfileDTO = ReturnType<typeof serializeProfile>;

export async function getEnabledServices(): Promise<Service[]> {
  try {
    await ensureSeeded();
    return await db
      .select()
      .from(services)
      .where(eq(services.enabled, true))
      .orderBy(asc(services.displayOrder), asc(services.id));
  } catch (error) {
    console.error("Database unavailable, falling back to static Services.");
    return SEED_SERVICES.map((s, idx) => ({
      ...s,
      id: idx + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as Service[];
  }
}

export async function getAllServices(): Promise<Service[]> {
  try {
    await ensureSeeded();
    return await db
      .select()
      .from(services)
      .orderBy(asc(services.displayOrder), asc(services.id));
  } catch (error) {
    return SEED_SERVICES.map((s, idx) => ({
      ...s,
      id: idx + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as Service[];
  }
}

export function serializeService(s: Service) {
  return {
    id: s.id,
    itemNumber: s.itemNumber,
    title: s.title,
    description: s.description,
    enabled: s.enabled,
    displayOrder: s.displayOrder,
  };
}

export type ServiceDTO = ReturnType<typeof serializeService>;

export async function getSettings(): Promise<Settings | null> {
  try {
    await ensureSeeded();
    const rows = await db.select().from(settings).limit(1);
    return rows[0] ?? null;
  } catch (error) {
    return {
      id: 1,
      siteTitle: "Nitesh Kuamr — Video Editor & Motion Graphic Designer",
      siteDescription: "Portfolio of Nitesh Kuamr",
      createdAt: new Date(),
      updatedAt: new Date()
    } as Settings;
  }
}

export function serializeSettings(s: Settings) {
  return {
    id: s.id,
    siteTitle: s.siteTitle,
    siteDescription: s.siteDescription,
  };
}

export type SettingsDTO = ReturnType<typeof serializeSettings>;
