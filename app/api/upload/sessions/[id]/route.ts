import { auth } from "@clerk/nextjs/server";
import { cancelChunkedUpload, UploadError } from "@/lib/server/chunked-upload";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await cancelChunkedUpload(process.cwd(), userId, (await params).id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
