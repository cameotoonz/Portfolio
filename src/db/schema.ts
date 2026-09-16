import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().default(""),
  category: text("category").notNull().default("long"), // "long" | "short"
  description: text("description").notNull().default(""),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  videoSourceType: text("video_source_type").notNull().default("external"), // "upload" | "external"
  videoUrl: text("video_url").notNull().default(""), // external link
  uploadedVideo: text("uploaded_video").notNull().default(""), // local /uploads path
  platform: text("platform").notNull().default("other"),
  orientation: text("orientation").notNull().default("horizontal"), // horizontal | vertical
  client: text("client").notNull().default(""),
  year: text("year").notNull().default(""),
  role: text("role").notNull().default(""),
  tools: text("tools").notNull().default(""), // comma separated
  tags: text("tags").notNull().default(""), // comma separated
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  // draft | published | unpublished
  status: text("status").notNull().default("published"),
  // public | unlisted | private
  privacy: text("privacy").notNull().default("public"),
  // technical metadata detected during processing
  durationSec: integer("duration_sec").notNull().default(0),
  width: integer("width").notNull().default(0),
  height: integer("height").notNull().default(0),
  fps: integer("fps").notNull().default(0),
  fileSize: integer("file_size").notNull().default(0),
  videoFormat: text("video_format").notNull().default(""),
  // embed display settings (JSON string)
  embedSettings: text("embed_settings").notNull().default("{}"),
  displayOrder: integer("display_order").notNull().default(0),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Supporting media items inside a project (Behance-style case study). */
export const projectMedia = pgTable("project_media", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  kind: text("kind").notNull().default("image"), // image | video | embed
  url: text("url").notNull().default(""),
  caption: text("caption").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  // personal
  name: text("name").notNull().default("NITESH KUAMR"),
  professionalTitle: text("professional_title")
    .notNull()
    .default("VIDEO EDITOR · MOTION GRAPHIC DESIGNER"),
  location: text("location").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  instagramHandle: text("instagram_handle").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  // hero
  heroEyebrow: text("hero_eyebrow").notNull().default(""),
  heroHeading: text("hero_heading").notNull().default(""),
  heroDescription: text("hero_description").notNull().default(""),
  heroPrimaryBtn: text("hero_primary_btn").notNull().default(""),
  heroSecondaryBtn: text("hero_secondary_btn").notNull().default(""),
  portraitUrl: text("portrait_url").notNull().default("/images/portrait.webp"),
  // about
  aboutHeading: text("about_heading").notNull().default(""),
  aboutText: text("about_text").notNull().default(""),
  aboutExtra: text("about_extra").notNull().default(""),
  // contact
  contactHeading: text("contact_heading").notNull().default(""),
  contactSubheading: text("contact_subheading").notNull().default(""),
  contactIntro: text("contact_intro").notNull().default(""),
  // footer
  footerName: text("footer_name").notNull().default(""),
  copyrightText: text("copyright_text").notNull().default(""),
  // misc
  projectsCount: integer("projects_count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  itemNumber: text("item_number").notNull().default("01"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  enabled: boolean("enabled").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  siteTitle: text("site_title").notNull().default(""),
  siteDescription: text("site_description").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull().default("image"), // image | video
  url: text("url").notNull(),
  fileName: text("file_name").notNull().default(""),
  mimeType: text("mime_type").notNull().default(""),
  size: integer("size").notNull().default(0),
  durationSec: integer("duration_sec").notNull().default(0),
  width: integer("width").notNull().default(0),
  height: integer("height").notNull().default(0),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Profile = typeof profile.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type ProjectMedia = typeof projectMedia.$inferSelect;
