export type Platform =
  | "upload"
  | "youtube"
  | "youtube-shorts"
  | "instagram"
  | "vimeo"
  | "tiktok"
  | "other";

export interface ParsedVideo {
  platform: Platform;
  embedUrl: string | null;
  externalUrl: string;
  thumbnail: string | null;
  embeddable: boolean;
}

function youtubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?[^#]*v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function parseVideoUrl(raw: string): ParsedVideo {
  const url = (raw || "").trim();
  const none: ParsedVideo = {
    platform: "other",
    embedUrl: null,
    externalUrl: url,
    thumbnail: null,
    embeddable: false,
  };
  if (!url) return { ...none, externalUrl: "" };

  if (url.startsWith("/uploads/") || url.startsWith("/api/")) {
    return {
      platform: "upload",
      embedUrl: null,
      externalUrl: url,
      thumbnail: null,
      embeddable: true,
    };
  }

  const yt = youtubeId(url);
  if (yt) {
    const isShorts = /youtube\.com\/shorts\//.test(url);
    return {
      platform: isShorts ? "youtube-shorts" : "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      externalUrl: isShorts
        ? `https://www.youtube.com/shorts/${yt}`
        : `https://www.youtube.com/watch?v=${yt}`,
      thumbnail: `https://img.youtube.com/vi/${yt}/maxresdefault.jpg`,
      embeddable: true,
    };
  }

  const ig = url.match(/instagram\.com\/(reel|reels|p)\/([a-zA-Z0-9_-]+)/);
  if (ig) {
    return {
      platform: "instagram",
      embedUrl: `https://www.instagram.com/${ig[1] === "p" ? "p" : "reel"}/${ig[2]}/embed/captioned/`,
      externalUrl: url,
      thumbnail: null,
      embeddable: true,
    };
  }

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return {
      platform: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&title=0&byline=0&portrait=0`,
      externalUrl: url,
      thumbnail: null,
      embeddable: true,
    };
  }

  const tiktok = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (tiktok) {
    return {
      platform: "tiktok",
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktok[1]}`,
      externalUrl: url,
      thumbnail: null,
      embeddable: true,
    };
  }

  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)) {
    return {
      platform: "upload",
      embedUrl: null,
      externalUrl: url,
      thumbnail: null,
      embeddable: true,
    };
  }

  return none;
}

export function platformLabel(platform: string): string {
  switch (platform) {
    case "upload":
      return "Hosted video";
    case "youtube":
      return "YouTube";
    case "youtube-shorts":
      return "YouTube Shorts";
    case "instagram":
      return "Instagram";
    case "vimeo":
      return "Vimeo";
    case "tiktok":
      return "TikTok";
    default:
      return "External";
  }
}
