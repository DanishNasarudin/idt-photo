import { auth } from "@clerk/nextjs/server";
import { startChunkedUpload, UploadError } from "@/lib/server/chunked-upload";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: unknown = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("size" in body) ||
      typeof body.size !== "number"
    ) {
      throw new UploadError("Invalid image size", 400);
    }
    return NextResponse.json(
      await startChunkedUpload(process.cwd(), userId, body.size)
    );
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    throw error;
  }
}
