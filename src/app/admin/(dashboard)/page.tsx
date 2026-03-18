import prisma from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/header";
import { DashboardStats } from "@/components/admin/dashboard/stats";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";

export default async function AdminDashboard() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [
    registrationCount,
    messageCount,
    recentRegistrationCount,
    activeEventCount,
    recentRegistrations,
    recentMessages,
  ] = await Promise.all([
    prisma.eventRegistration.count(),
    prisma.contactMessage.count(),
    prisma.eventRegistration.count({
      where: { createdAt: { gte: oneWeekAgo } },
    }),
    prisma.event.count({
      where: { status: "PUBLISHED" },
    }),
    prisma.eventRegistration.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { event: { select: { title: true } } },
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        message: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Dashboard"
        description="Overview of your events, registrations, and messages"
      />
      <DashboardStats
        registrationCount={registrationCount}
        messageCount={messageCount}
        recentRegistrations={recentRegistrationCount}
        activeEvents={activeEventCount}
      />
      <RecentActivity
        recentRegistrations={recentRegistrations.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          role: r.event.title,
          createdAt: r.createdAt,
        }))}
        recentMessages={recentMessages}
      />
    </div>
  );
}
