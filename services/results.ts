"use server";

import { Prisma, results } from "@/db/generated/prisma";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type Pagination = {
  lastVisiblePage: number;
  hasNextPage: boolean;
  currentPage: number;
  items: {
    count: number;
    total: number;
    perPage: number;
  };
};

export async function searchData(
  query?: string,
  page: number = 1
): Promise<{ data: results[]; pagination: Pagination }> {
  const currentPage = page || 1;
  const perPage = 10;
  const skip = (currentPage - 1) * perPage;

  const where: Prisma.resultsWhereInput = {};
  if (query) {
    where.originalContent = { contains: query };
  }

  const [total, data] = await Promise.all([
    prisma.results.count({ where }),
    prisma.results.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { created_at: "desc" },
    }),
  ]);

  const lastVisiblePage = Math.ceil(total / perPage);
  const hasNextPage = currentPage < lastVisiblePage;

  return {
    data,
    pagination: {
      lastVisiblePage,
      hasNextPage,
      currentPage,
      items: {
        count: data.length,
        total,
        perPage,
      },
    },
  };
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
