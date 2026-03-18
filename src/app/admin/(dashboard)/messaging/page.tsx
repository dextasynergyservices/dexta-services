import prisma from "@/lib/prisma";
import { AdminHeader } from "@/components/admin/header";
import { ComposeForm } from "@/components/admin/messaging/compose-form";

export default async function MessagingPage() {
  const [totalRecipients, events] = await Promise.all([
    prisma.eventRegistration.count(),
    prisma.event.findMany({
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 ">
      <AdminHeader
        title="Messaging"
        description="Send emails to event registrants"
      />
      <ComposeForm totalRecipients={totalRecipients} events={events} />
    </div>
  );
}
