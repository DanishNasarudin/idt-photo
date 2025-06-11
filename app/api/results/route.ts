import { searchDataPublic } from "@/services/results";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || authHeader !== `Bearer ${process.env.CLERK_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query } = (await request.json()) as {
    query?: string;
  };

  if (!query) {
    return NextResponse.json({ images: [] }, { status: 201 });
  }
  const results = await searchDataPublic(query);

  return NextResponse.json(
    {
      images:
        results.data.map((item) => ({
          path: item.imagePath,
          invoice: item.invNumber,
        })) || [],
    },
    { status: 201 }
  );
}
