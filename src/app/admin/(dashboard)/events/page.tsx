import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin/header";
import { EventList } from "@/components/admin/events/event-list";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 10;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search ?? "";
  const statusFilter = params.status ?? "";

  const where = {
    ...(search
      ? { title: { contains: search, mode: "insensitive" as const } }
      : {}),
    ...(statusFilter
      ? { status: statusFilter as "DRAFT" | "PUBLISHED" | "CLOSED" }
      : {}),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.event.count({ where }),
  ]);

  // Get accepted counts for each event
  const eventsWithAccepted = await Promise.all(
    events.map(async (event) => {
      const acceptedCount = await prisma.eventRegistration.count({
        where: { eventId: event.id, status: "ACCEPTED" },
      });
      return { ...event, acceptedCount };
    }),
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminHeader title="Events" description="Create and manage events" />
        <Button asChild className="bg-cyan-500 text-black hover:bg-cyan-400">
          <Link href="/admin/events/new">
            <Plus className="mr-1.5 h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      <EventList
        events={eventsWithAccepted}
        total={total}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
