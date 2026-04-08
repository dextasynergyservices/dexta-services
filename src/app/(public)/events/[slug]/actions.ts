"use server";

import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { createRegistrationValidator } from "@/lib/validators";
import { sendPendingEmail, sendTeamNotificationEmail } from "@/lib/email";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function registerForEvent(
  slug: string,
  formData: Record<string, string>,
): Promise<{ success: boolean; message: string }> {
  try {
    // Rate limit by IP
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown";

    const limit = rateLimit(`event-reg:${ip}`, RATE_LIMITS.form);
    if (!limit.success) {
      return {
        success: false,
        message: "Too many requests. Please try again later.",
      };
    }

    // Verify reCAPTCHA
    const { recaptchaToken, ...formFields } = formData;
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(
        recaptchaToken,
        "event_registration",
      );
      if (!recaptchaResult.success) {
        return {
          success: false,
          message: "reCAPTCHA verification failed. Please try again.",
        };
      }
    }

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

    const parsed = schema.safeParse(formFields);
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

    const [pendingEmailResult, teamNotificationResult] =
      await Promise.allSettled([
        sendPendingEmail({ name, email }, eventInfo),
        sendTeamNotificationEmail({ name, email, formData: rest }, eventInfo),
      ]);

    const emailSent = pendingEmailResult.status === "fulfilled";

    if (pendingEmailResult.status === "rejected") {
      console.error(
        "[Event Registration] Pending email failed for",
        email,
        pendingEmailResult.reason,
      );
    }

    if (teamNotificationResult.status === "rejected") {
      console.error(
        "[Event Registration] Team notification email failed",
        teamNotificationResult.reason,
      );
    }

    return {
      success: true,
      message: emailSent
        ? "Registration received! Check your inbox for a confirmation."
        : "Registration received! However, the confirmation email could not be sent. Please contact us if you don't hear back.",
    };
  } catch (error) {
    console.error("[Event Registration]", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
