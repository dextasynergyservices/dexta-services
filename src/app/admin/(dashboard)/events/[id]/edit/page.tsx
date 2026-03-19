import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/header";
import { EventForm } from "@/components/admin/events/event-form";
import { updateEvent } from "@/app/admin/(dashboard)/events/actions";
import prisma from "@/lib/prisma";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      formFields: { orderBy: { position: "asc" } },
    },
  });

  if (!event) notFound();

  // Format datetime for the input
  const dateTime = event.dateTime.toISOString().slice(0, 16);

  // Convert JSON options back to comma-separated for the form
  const formFields = event.formFields.map((f) => {
    let options = f.options || "";
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) {
        options = parsed.join(", ");
      }
    } catch {
      // already a string
    }
    return {
      name: f.name,
      label: f.label,
      type: f.type as
        | "TEXT"
        | "EMAIL"
        | "SELECT"
        | "TEXTAREA"
        | "URL"
        | "CHECKBOX",
      placeholder: f.placeholder || "",
      required: f.required,
      options,
      position: f.position,
    };
  });

  const initialData = {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    dateTime,
    timezone: event.timezone,
    location: event.location,
    imagePublicId: event.imagePublicId || "",
    attendeeLimit: event.attendeeLimit,
    status: event.status,
    formFields,
  };

  const boundUpdateEvent = async (data: Parameters<typeof updateEvent>[1]) => {
    "use server";
    return updateEvent(id, data);
  };

  return (
    <div className="space-y-6">
      <AdminHeader title="Edit Event" description={event.title} />
      <EventForm
        initialData={initialData}
        action={boundUpdateEvent}
        submitLabel="Save Changes"
      />
    </div>
  );
}
