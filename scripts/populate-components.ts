import { PrismaClient } from "../db/generated/prisma";

const prisma = new PrismaClient();

interface ComponentFields {
  cpu?: string | null;
  gpu?: string | null;
  ram?: string | null;
  cooler?: string | null;
  mobo?: string | null;
  case?: string | null;
  psu?: string | null;
  ssd?: string | null;
  accessories?: string | null;
  fans?: string | null;
}

const keyMap: Record<string, keyof ComponentFields> = {
  CPU: "cpu",
  GPU: "gpu",
  RAM: "ram",
  COOLER: "cooler",
  MOBO: "mobo",
  CASE: "case",
  PSU: "psu",
  SSD: "ssd",
  ACCESSORIES: "accessories",
  FAN: "fans",
};

function parseComponents(content: string): ComponentFields {
  const result: ComponentFields = {};

  for (const line of content.split(/\r?\n/)) {
    const [rawKey, ...rest] = line.split(":");
    if (!rawKey || rest.length === 0) continue;

    const key = rawKey.trim().toUpperCase();
    const field = keyMap[key];
    if (!field) {
      // unknown component – ignore
      continue;
    }

    const value = rest.join(":").trim();
    result[field] = result[field] ? `${result[field]}; ${value}` : value;
  }

  return result;
}

async function main() {
  const rows = await prisma.results.findMany({
    where: { originalContent: { not: null } },
  });

  for (const { id, originalContent } of rows) {
    const data = parseComponents(originalContent!);
    await prisma.results.update({ where: { id }, data });
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
