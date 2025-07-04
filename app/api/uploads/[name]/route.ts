import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    (await params).name
  );

  try {
    const fileBuffer = await fs.readFile(filePath);
    const uint8Array = new Uint8Array(fileBuffer);

    const url = new URL(request.url);
    const hasCacheBypass = url.searchParams.has("t");

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "image/*",
        "Cache-Control": hasCacheBypass
          ? "no-store"
          : "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
