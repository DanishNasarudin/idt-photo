import { searchDataPublic } from "@/services/results";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { query } = (await request.json()) as {
    query?: string;
  };

  if (!query) {
    return NextResponse.json({ results: [] }, { status: 201 });
  }
  const results = await searchDataPublic(query);

  return NextResponse.json(
    { results: results.data.map((item) => item.imagePath) },
    { status: 201 }
  );
}
