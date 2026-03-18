import prisma from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/header";
import { RegistrationsTable } from "@/components/admin/registrations/table";
import { SearchFilters } from "@/components/admin/registrations/search-filters";
import { Prisma } from "@prisma/client";

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    sort?: string;
    event?: string;
  }>;
}

const PAGE_SIZE = 20;

export default async function RegistrationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search || "";
  const _role = params.role || "";
  const sort = params.sort === "asc" ? "asc" : "desc";
  const eventId = params.event || "";

  const where: Prisma.EventRegistrationWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(eventId && { eventId }),
  };

  // For role filter, parse formData (role is stored in formData JSON)
  // We'll filter by event instead since roles vary per event

  const [registrations, total, events] = await Promise.all([
    prisma.eventRegistration.findMany({
      where,
      include: { event: { select: { title: true } } },
      orderBy: { createdAt: sort },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.eventRegistration.count({ where }),
    prisma.event.findMany({
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Map to table format
  const tableRegistrations = registrations.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    event: r.event.title,
    status: r.status,
    createdAt: r.createdAt,
  }));

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Registrations"
        description={`${total} registrations across all events`}
      />
      <SearchFilters
        search={search}
        role={eventId}
        sort={sort}
        roles={events.map((e) => e.title)}
        roleLabel="Event"
        roleValues={events.map((e) => ({ label: e.title, value: e.id }))}
        roleParamName="event"
      />
      <RegistrationsTable
        registrations={tableRegistrations}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
