"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { composeEmailSchema, type ComposeEmailData } from "@/lib/validators";
import { sendEmail, buildEmailHtml } from "@/lib/email";
import { Prisma } from "@prisma/client";

export type SendResult = {
  success: boolean;
  message: string;
  sent?: number;
  failed?: number;
};

export async function sendBulkEmail(
  formData: ComposeEmailData,
): Promise<SendResult> {
  const session = await auth();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  const result = composeEmailSchema.safeParse(formData);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Validation failed",
    };
  }

  const {
    subject,
    body,
    recipientFilter,
    roleFilter,
    eventFilter,
    statusFilter,
  } = result.data;

  // Build query
  const where: Prisma.EventRegistrationWhereInput = {};

  if (recipientFilter === "filtered") {
    if (eventFilter) where.eventId = eventFilter;
    if (statusFilter)
      where.status =
        statusFilter as Prisma.EventRegistrationWhereInput["status"];
  }

  // Legacy support: roleFilter maps to eventId for backwards compat
  if (recipientFilter === "filtered" && roleFilter && !eventFilter) {
    // Try to find an event by title matching the role filter
    const event = await prisma.event.findFirst({
      where: { title: roleFilter },
      select: { id: true },
    });
    if (event) where.eventId = event.id;
  }

  const recipients = await prisma.eventRegistration.findMany({
    where,
    select: { name: true, email: true },
  });

  if (recipients.length === 0) {
    return { success: false, message: "No recipients found" };
  }

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      const firstName = recipient.name.split(" ")[0];
      const bodyHtml = body.replace(/\n/g, "<br />");

      const htmlContent = buildEmailHtml({
        tag: "DEXTA EVENTS",
        heading: subject,
        body: `
          <p style="color:#a0a0a0;font-size:14px;line-height:1.8;margin:0 0 4px;">
            Hi ${firstName},
          </p>
          <div style="color:#a0a0a0;font-size:14px;line-height:1.8;margin:16px 0 24px;">
            ${bodyHtml}
          </div>
        `,
      });

      await sendEmail({
        to: { email: recipient.email, name: recipient.name },
        subject,
        htmlContent,
      });
      sent++;
    } catch (error) {
      console.error(`[Messaging] Failed to send to ${recipient.email}:`, error);
      failed++;
    }
  }

  if (sent === 0) {
    return {
      success: false,
      message: "Failed to send emails. Please check your Brevo configuration.",
      sent,
      failed,
    };
  }

  return {
    success: true,
    message: `Sent ${sent} of ${recipients.length} emails successfully.`,
    sent,
    failed,
  };
}
