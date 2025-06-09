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

export async function deleteData(id: number) {
  const response = prisma.results.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin");

  return response;
}

export async function updateData(id: number, data: Partial<results>) {
  return prisma.results.update({
    where: {
      id,
    },
    data,
  });
}
