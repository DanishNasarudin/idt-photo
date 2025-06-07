import { createData } from "@/services/results";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const items = (await request.json()) as Array<{
    invNumber?: string;
    total?: string;
    originalContent?: string;
    nasLocation?: string;
    imagePath?: string;
    status?: string;
  }>;

  await createData(items);

  return NextResponse.json({ inserted: items.length }, { status: 201 });
}
