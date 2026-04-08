import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let unreadContactMessages = 0;

  try {
    const rows = await prisma.$queryRaw<Array<{ count: bigint | number | string }>>(Prisma.sql`
      SELECT COUNT(*)::bigint AS count
      FROM "ContactMessage"
      WHERE "isRead" = FALSE
    `);

    const rawCount = rows[0]?.count;
    unreadContactMessages =
      typeof rawCount === "bigint"
        ? Number(rawCount)
        : typeof rawCount === "string"
          ? Number(rawCount) || 0
          : rawCount ?? 0;
  } catch {
    try {
      unreadContactMessages = await prisma.contactMessage.count();
    } catch {
      unreadContactMessages = 0;
    }
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      <AdminSidebar
        user={session.user}
        unreadContactMessages={unreadContactMessages}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
