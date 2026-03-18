import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Users, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/admin/events/status-badge";
import { RegistrationTable } from "@/components/admin/events/registration-table";
import prisma from "@/lib/prisma";
import { formatDateInTimezone } from "@/lib/timezone";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      formFields: { orderBy: { position: "asc" } },
      registrations: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!event) notFound();

  const stats = {
    total: event.registrations.length,
    accepted: event.registrations.filter((r) => r.status === "ACCEPTED").length,
    pending: event.registrations.filter((r) => r.status === "PENDING").length,
    declined: event.registrations.filter((r) => r.status === "DECLINED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{event.title}</h1>
            <EventStatusBadge status={event.status} />
          </div>
          <p className="text-sm text-[#999]">
            {formatDateInTimezone(event.dateTime, event.timezone)} &middot;{" "}
            {event.location}
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
        >
          <Link href={`/admin/events/${id}/edit`}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit Event
          </Link>
        </Button>
      </div>

      {/* Event image */}
      {event.imagePublicId && (
        <div className="overflow-hidden rounded-xl border border-[#222]">
          <Image
            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,q_auto,f_auto/${event.imagePublicId}`}
            alt={event.title}
            width={1200}
            height={400}
            className="h-48 w-full object-cover sm:h-64"
            priority
          />
        </div>
      )}

      {/* Description */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-5">
        <p className="text-sm leading-relaxed text-[#a0a0a0]">
          {event.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total",
            value: stats.total,
            icon: Users,
            color: "text-cyan-400",
          },
          {
            label: "Accepted",
            value: stats.accepted,
            icon: CheckCircle,
            color: "text-emerald-400",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            color: "text-amber-400",
          },
          {
            label: "Declined",
            value: stats.declined,
            icon: XCircle,
            color: "text-red-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#222] bg-[#111] p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-[#999]">{stat.label}</p>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold text-white">
              {stat.value}
              {stat.label === "Accepted" && event.attendeeLimit && (
                <span className="text-sm font-normal text-[#555]">
                  {" "}
                  / {event.attendeeLimit}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Registrations */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Registrations</h2>
        <RegistrationTable
          registrations={event.registrations}
          formFields={event.formFields.map((f) => ({
            name: f.name,
            label: f.label,
            type: f.type,
          }))}
        />
      </div>
    </div>
  );
}
