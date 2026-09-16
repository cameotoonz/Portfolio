export interface WizardState {
  id: number | null;
  title: string;
  slug: string;
  category: "long" | "short";
  description: string;
  thumbnailUrl: string;
  videoSourceType: "upload" | "external";
  videoUrl: string;
  uploadedVideo: string;
  orientation: "horizontal" | "vertical";
  client: string;
  year: string;
  role: string;
  tools: string;
  tags: string;
  featured: boolean;
  status: "draft" | "published" | "unpublished";
  privacy: "public" | "unlisted" | "private";
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  fileSize: number;
  videoFormat: string;
  embedSettings: {
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    controls: boolean;
    startTime: number;
  };
}

export interface SupportingMedia {
  id: number | string;
  kind: "image" | "video" | "embed";
  url: string;
  caption: string;
  persisted: boolean;
}

export const STEPS = [
  { key: "media", label: "Media" },
  { key: "details", label: "Details" },
  { key: "thumbnail", label: "Thumbnail" },
  { key: "settings", label: "Settings" },
  { key: "preview", label: "Preview" },
  { key: "publish", label: "Publish" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

export const TAG_SUGGESTIONS = [
  "Video Editing",
  "Motion Graphics",
  "Documentary",
  "Social Media",
  "Brand Video",
  "Storytelling",
  "Short Form",
  "Sound Design",
  "Color Grading",
  "Typography",
];

export function emptyWizardState(category: "long" | "short"): WizardState {
  return {
    id: null,
    title: "",
    slug: "",
    category,
    description: "",
    thumbnailUrl: "",
    videoSourceType: "upload",
    videoUrl: "",
    uploadedVideo: "",
    orientation: category === "short" ? "vertical" : "horizontal",
    client: "",
    year: new Date().getFullYear().toString(),
    role: "",
    tools: "",
    tags: "",
    featured: false,
    status: "draft",
    privacy: "public",
    durationSec: 0,
    width: 0,
    height: 0,
    fps: 0,
    fileSize: 0,
    videoFormat: "",
    embedSettings: {
      autoplay: true,
      muted: false,
      loop: false,
      controls: true,
      startTime: 0,
    },
  };
}
