import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request: Request) {
  // Authenticate via Clerk
  const session = await auth();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure multipart/form-data
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Invalid content type" },
      { status: 400 }
    );
  }

  // Parse the incoming FormData
  const formData = await request.formData();
  const fileItem = formData.get("file") as Blob | null;
  if (!fileItem) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Convert Blob to Buffer
  const arrayBuffer = await fileItem.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = (fileItem as File).name;

  // Ensure upload directory exists
  const uploadDir = path.join(process.cwd(), "public", "upload");
  await fs.promises.mkdir(uploadDir, { recursive: true });

  // Write file to disk
  const filePath = path.join(uploadDir, filename);
  await fs.promises.writeFile(filePath, buffer);

  // Return the public URL
  return NextResponse.json({ path: `/upload/${encodeURIComponent(filename)}` });
}
