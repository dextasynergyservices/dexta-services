import { AdminHeader } from "@/components/admin/header";
import { EventForm } from "@/components/admin/events/event-form";
import { createEvent } from "@/app/admin/(dashboard)/events/actions";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <AdminHeader
        title="Create Event"
        description="Set up a new event with custom registration form"
      />
      <EventForm action={createEvent} submitLabel="Create Event" />
    </div>
  );
}
