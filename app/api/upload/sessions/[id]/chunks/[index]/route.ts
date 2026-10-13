import { auth } from "@clerk/nextjs/server";
import { UPLOAD_CHUNK_SIZE } from "@/lib/chunked-upload-constants";
import { UploadError, writeUploadChunk } from "@/lib/server/chunked-upload";
import { NextResponse } from "next/server";

async function readChunk(request: Request) {
  if (!request.body) throw new UploadError("Missing chunk", 400);
  const reader = request.body.getReader();
  const parts: Buffer[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > UPLOAD_CHUNK_SIZE) {
        await reader.cancel();
        throw new UploadError("Chunk is too large", 413);
      }
      parts.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(parts, size);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; index: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("content-type") !== "application/octet-stream") {
    return NextResponse.json({ error: "Invalid content type" }, { status: 415 });
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (contentLength > UPLOAD_CHUNK_SIZE) {
    return NextResponse.json({ error: "Chunk is too large" }, { status: 413 });
  }

  const { id, index } = await params;
  try {
    const data = await readChunk(request);
    await writeUploadChunk(process.cwd(), userId, id, Number(index), data);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
