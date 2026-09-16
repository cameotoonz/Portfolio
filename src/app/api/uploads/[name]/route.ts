import { stat } from "fs/promises";
import { createReadStream } from "fs";
import { Readable } from "stream";
import path from "path";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const MIMES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ name: string }> },
) {
  const { name } = await ctx.params;
  const fileName = name ?? "";
  if (!fileName || !/^[a-zA-Z0-9._-]+$/.test(fileName)) {
    return new Response("Bad request", { status: 400 });
  }
  const uploadsRoot = path.join(process.cwd(), "uploads");
  const filePath = path.join(uploadsRoot, fileName);
  if (!filePath.startsWith(uploadsRoot)) {
    return new Response("Bad request", { status: 400 });
  }

  let st;
  try {
    st = await stat(filePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const mime = MIMES[path.extname(fileName).toLowerCase()] ?? "application/octet-stream";
  const size = st.size;
  const range = req.headers.get("range");

  // HTTP Range support so <video> seeking works for uploaded files
  if (range) {
    const m = range.match(/bytes=(\d+)-(\d*)/);
    if (m) {
      const start = Number(m[1]);
      const end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
      if (start >= size || start > end) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${size}` },
        });
      }
      const stream = createReadStream(filePath, { start, end });
      return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(end - start + 1),
          "Content-Type": mime,
          "Cache-Control": "private, max-age=3600",
        },
      });
    }
  }

  const stream = createReadStream(filePath);
  return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
    status: 200,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Length": String(size),
      "Content-Type": mime,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
