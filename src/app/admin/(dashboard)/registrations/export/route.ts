import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const eventId = searchParams.get("event") || "";

  const where: Prisma.EventRegistrationWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(eventId && { eventId }),
  };

  const registrations = await prisma.eventRegistration.findMany({
    where,
    include: { event: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV
  const headers = ["Name", "Email", "Event", "Status", "Date"];
  const rows = registrations.map((r) => [
    escapeCsv(r.name),
    escapeCsv(r.email),
    escapeCsv(r.event.title),
    escapeCsv(r.status),
    r.createdAt.toISOString(),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new globalThis.Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="registrations-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
