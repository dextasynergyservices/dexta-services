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
      select: {
        id: true,
        title: true,
        dateTime: true,
        location: true,
        status: true,
        attendeeLimit: true,
        _count: { select: { registrations: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.event.count({ where }),
  ]);

  const acceptedCounts =
    events.length > 0
      ? await prisma.eventRegistration.groupBy({
          by: ["eventId"],
          where: {
            eventId: { in: events.map((event) => event.id) },
            status: "ACCEPTED",
          },
          _count: { _all: true },
        })
      : [];

  const acceptedCountByEventId = new Map(
    acceptedCounts.map((entry) => [entry.eventId, entry._count._all]),
  );

  const eventsWithAccepted = events.map((event) => ({
    ...event,
    acceptedCount: acceptedCountByEventId.get(event.id) ?? 0,
  }));

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
