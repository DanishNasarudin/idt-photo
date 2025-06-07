"use server";

import { Prisma, results } from "@/db/generated/prisma";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function searchData() {
  return prisma.results.findMany({});
}

export async function createData(
  data: Partial<results>[]
): Promise<Prisma.BatchPayload> {
  const response = prisma.results.createMany({
    data,
  });

  revalidatePath("/admin");

  return response;
}
