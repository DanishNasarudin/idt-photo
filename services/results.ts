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

export type SortProps = {
  type: string;
  direction: "asc" | "desc";
};

export async function searchData(
  query?: string,
  page: number = 1,
  perPage: number = 10,
  isAdmin: boolean = false,
  sort: SortProps[] = []
): Promise<{ data: results[]; pagination: Pagination }> {
  const currentPage = page || 1;
  const currentPerPage = perPage || 10;
  const skip = (currentPage - 1) * currentPerPage;

  const whereClauses: Prisma.Sql[] = [];
  const idMatch = query?.trim().match(/^id:(\d+)$/i);
  if (idMatch) {
    whereClauses.push(Prisma.sql`id = ${Number(idMatch[1])}`);
  } else if (query) {
    const terms = query.split(/\s+/).filter(Boolean);
    if (terms.length) {
      whereClauses.push(
        Prisma.sql`(${Prisma.join(
          terms.map(
            (t) =>
              Prisma.sql`(
              invNumber     LIKE CONCAT('%', ${t}, '%')
              OR originalContent LIKE CONCAT('%', ${t}, '%')
              OR total         LIKE CONCAT('%', ${t}, '%')
              OR nasLocation   LIKE CONCAT('%', ${t}, '%')
            )`
          ),
          " AND "
        )})`
      );
    }
  }
  const whereSql = whereClauses.length
    ? Prisma.sql`WHERE ${Prisma.join(whereClauses, " AND ")}`
    : Prisma.sql``;

  const statusSort = sort.find((s) => s.type === "status");
  const otherSorts = sort.filter((s) => s.type !== "status");
  const statusOrder = ["Ready", "Scheduled", "Posted"] as const;

  const orderClauses: string[] = [];

  if (statusSort) {
    const dir = statusSort.direction.toUpperCase();
    orderClauses.push(
      `FIELD(status, ${statusOrder.map((st) => `'${st}'`).join(", ")}) ${dir}`
    );
  }

  if (otherSorts.length) {
    orderClauses.push(
      ...otherSorts.map((s) => `\`${s.type}\` ${s.direction.toUpperCase()}`)
    );
  }

  if (orderClauses.length === 0) {
    orderClauses.push("created_at DESC");
  }

  const orderByClause = `ORDER BY ${orderClauses.join(", ")}`;

  const [countResult, rawRows] = await Promise.all([
    prisma.$queryRaw<Array<{ count: bigint }>>(
      Prisma.sql`SELECT COUNT(*) AS count FROM results ${whereSql}`
    ),
    prisma.$queryRaw<results[]>(
      Prisma.sql`
        SELECT *
        FROM results
        ${whereSql}
        ${Prisma.raw(orderByClause)}
        LIMIT ${skip}, ${currentPerPage}
      `
    ),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const lastVisiblePage = Math.ceil(total / perPage);

  const data = isAdmin
    ? rawRows
    : rawRows.map((r) => ({
        ...r,
        invNumber: null,
        originalContent:
          r.originalContent
            ?.split("\n")
            .filter((l) => !/^\s*INV#:/i.test(l))
            .join("\n") ?? "",
      }));

  return {
    data,
    pagination: {
      lastVisiblePage,
      hasNextPage: currentPage < lastVisiblePage,
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
  const response = prisma.results.update({
    where: {
      id,
    },
    data,
  });

  revalidatePath("/admin");

  return response;
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
): Promise<{
  data: {
    id: number;
    imagePath: string | null;
  }[];
  pagination: Pagination;
}> {
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
      select: {
        id: true,
        imagePath: true,
      },
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
