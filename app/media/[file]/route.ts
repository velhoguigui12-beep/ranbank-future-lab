import { open, stat } from "node:fs/promises";
import path from "node:path";

const VIDEO_FILES = new Set([
  "ranbank-demonstracao-01.mp4",
  "ranbank-demonstracao-02.mp4",
  "ranbank-demonstracao-04.mp4",
  "ranbank-historia-2026.mp4",
]);

function videoPath(file: string) {
  return path.join(process.cwd(), "public", "videos", file);
}

function videoHeaders(size: number) {
  return {
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=86400",
    "Content-Length": String(size),
    "Content-Type": "video/mp4",
  };
}

export async function HEAD(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  if (!VIDEO_FILES.has(file)) return new Response(null, { status: 404 });

  try {
    const metadata = await stat(videoPath(file));
    return new Response(null, { headers: videoHeaders(metadata.size) });
  } catch {
    return new Response(null, { status: 404 });
  }
}

export async function GET(request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  if (!VIDEO_FILES.has(file)) return new Response(null, { status: 404 });

  try {
    const handle = await open(videoPath(file), "r");
    const metadata = await handle.stat();
    const range = request.headers.get("range")?.match(/^bytes=(\d+)-(\d*)$/);

    if (range) {
      const start = Number(range[1]);
      const requestedEnd = range[2] ? Number(range[2]) : metadata.size - 1;
      const end = Math.min(requestedEnd, metadata.size - 1);
      if (start > end || start >= metadata.size) {
        await handle.close();
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${metadata.size}` },
        });
      }

      const length = end - start + 1;
      const buffer = Buffer.alloc(length);
      await handle.read(buffer, 0, length, start);
      await handle.close();
      return new Response(buffer, {
        status: 206,
        headers: {
          ...videoHeaders(length),
          "Content-Range": `bytes ${start}-${end}/${metadata.size}`,
        },
      });
    }

    const buffer = await handle.readFile();
    await handle.close();
    return new Response(buffer, { headers: videoHeaders(metadata.size) });
  } catch {
    return new Response(null, { status: 404 });
  }
}
