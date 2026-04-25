import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function requireAdminSession() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    throw new Error("Unauthorized");
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (!adminUser) {
    throw new Error("Unauthorized");
  }

  return {
    session,
    adminUser,
  };
}
