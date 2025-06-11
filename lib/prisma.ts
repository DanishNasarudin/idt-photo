import { PrismaClient } from "@/db/generated/prisma";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["warn", "error"], // optional: surface warnings/errors
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
