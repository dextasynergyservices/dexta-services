import { PrismaClient } from "@/generated/prisma/client";

const prismaClientSingleton = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (PrismaClient as any)();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
