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
  page: number = 1,
  perPage?: number
): Promise<{ data: results[]; pagination: Pagination }> {
  const currentPage = page || 1;
  const currentPerPage = perPage || 10;
  const skip = (currentPage - 1) * currentPerPage;

  const searchWords = query?.split(/\s+/).filter(Boolean) || [];

  const where: Prisma.resultsWhereInput = searchWords.length
    ? {
        AND: searchWords.map((word) => ({
          OR: [
            { invNumber: { contains: word } },
            { originalContent: { contains: word } },
            { total: { contains: word } },
            { nasLocation: { contains: word } },
          ],
        })),
      }
    : {};

  const [total, data] = await Promise.all([
    prisma.results.count({ where }),
    prisma.results.findMany({
      where,
      skip,
      take: currentPerPage,
      orderBy: { created_at: "desc" },
    }),
  ]);

  const lastVisiblePage = Math.ceil(total / currentPerPage);
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
        perPage: currentPerPage,
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

export async function updateManyData(
  ids: number[],
  data: Partial<results>
): Promise<{ count: number }> {
  const response = await prisma.results.updateMany({
    where: { id: { in: ids } },
    data,
  });

  revalidatePath("/admin");
  return response;
}

export async function checkDuplicates(
  invoiceNum: string[]
): Promise<{ invNumber: string | null }[]> {
  return prisma.results.findMany({
    where: { invNumber: { in: invoiceNum } },
    select: { invNumber: true },
  });
}

export async function searchDataPublic(
  query?: string,
  page: number = 1,
  perPage: number = 10
): Promise<{ data: results[]; pagination: Pagination }> {
  const currentPage = page || 1;
  const currentPerPage = perPage || 10;
  const skip = (currentPage - 1) * currentPerPage;

  const searchWords = query?.split(/\s+/).filter(Boolean) || [];

  const where: Prisma.resultsWhereInput = searchWords.length
    ? {
        AND: searchWords.map((word) => ({
          OR: [
            { originalContent: { contains: word } },
            { gpu: { contains: word } },
            { case: { contains: word } },
            { cooler: { contains: word } },
          ],
        })),
      }
    : {};

  const [total, data] = await Promise.all([
    prisma.results.count({ where }),
    prisma.results.findMany({
      where,
      skip,
      take: currentPerPage,
      orderBy: { created_at: "desc" },
    }),
  ]);

  const lastVisiblePage = Math.ceil(total / currentPerPage);
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
        perPage: currentPerPage,
      },
    },
  };
}
