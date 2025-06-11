import { PrismaClient } from "@/db/generated/prisma";

declare global {
  // allow global `prisma` across module reloads in dev
  // @ts-ignore
  var prisma: PrismaClient | undefined;
}

// const prismaClientSingleton = () => {
//   return new PrismaClient();
// };

// declare const globalThis: {
//   prismaGlobal: ReturnType<typeof prismaClientSingleton>;
// } & typeof global;

const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["warn", "error"], // optional: surface warnings/errors
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
