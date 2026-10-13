import { auth } from "@clerk/nextjs/server";
import { finishChunkedUpload, UploadError } from "@/lib/server/chunked-upload";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    return NextResponse.json(
      await finishChunkedUpload(process.cwd(), userId, (await params).id)
    );
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
