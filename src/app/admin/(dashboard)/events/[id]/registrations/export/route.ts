import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _request: globalThis.Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      formFields: { orderBy: { position: "asc" } },
      registrations: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const fieldNames = event.formFields.map((f) => f.label);
  const headers = ["Name", "Email", "Status", ...fieldNames, "Date"];

  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = event.registrations.map((reg) => {
    let formData: Record<string, string> = {};
    try {
      formData = JSON.parse(reg.formData);
    } catch {
      // ignore
    }

    return [
      escape(reg.name),
      escape(reg.email),
      reg.status,
      ...event.formFields.map((f) => escape(formData[f.name] || "")),
      new Date(reg.createdAt).toISOString().split("T")[0],
    ].join(",");
  });

  const csv = [headers.map(escape).join(","), ...rows].join("\n");
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${event.slug}-registrations-${date}.csv"`,
    },
  });
}
