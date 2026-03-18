"use server";

import prisma from "@/lib/prisma";
import { createRegistrationValidator } from "@/lib/validators";
import { sendPendingEmail, sendTeamNotificationEmail } from "@/lib/email";

export async function registerForEvent(
  slug: string,
  formData: Record<string, string>,
): Promise<{ success: boolean; message: string }> {
  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: { formFields: { orderBy: { position: "asc" } } },
    });

    if (!event || event.status !== "PUBLISHED") {
      return {
        success: false,
        message: "This event is not accepting registrations.",
      };
    }

    // Validate
    const schema = createRegistrationValidator(
      event.formFields.map((f) => ({
        name: f.name,
        type: f.type,
        required: f.required,
      })),
    );

    const parsed = schema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    const { name, email, ...rest } = parsed.data as Record<string, string>;

    // Check duplicate
    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_email: { eventId: event.id, email } },
    });

    if (existing) {
      return {
        success: false,
        message:
          "You're already registered for this event. Check your inbox for the confirmation email.",
      };
    }

    // Create registration
    await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        name,
        email,
        status: "PENDING",
        formData: JSON.stringify(rest),
      },
    });

    // Send emails (non-blocking)
    const eventInfo = {
      title: event.title,
      dateTime: event.dateTime,
      timezone: event.timezone,
      location: event.location,
    };

    try {
      await sendPendingEmail({ name, email }, eventInfo);
    } catch {
      console.error("[Event Registration] Pending email failed for", email);
    }

    try {
      await sendTeamNotificationEmail(
        { name, email, formData: rest },
        eventInfo,
      );
    } catch {
      console.error("[Event Registration] Team notification email failed");
    }

    return {
      success: true,
      message: "Registration received! Check your inbox for a confirmation.",
    };
  } catch (error) {
    console.error("[Event Registration]", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
