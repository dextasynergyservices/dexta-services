"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendPendingEmail, sendTeamNotificationEmail } from "@/lib/email";

// ─── Validation Schema ────────────────────────────────────────────────────────

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select your role"),
  stack: z.string().max(200, "Keep it under 200 characters").optional(),
  expectation: z.string().max(500, "Keep it under 500 characters").optional(),
  profile: z
    .string()
    .url("Please enter a valid URL (include https://)")
    .optional()
    .or(z.literal("")),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export type ActionResult = {
  success: boolean;
  message: string;
};

// ─── Server Action ────────────────────────────────────────────────────────────

export async function registerForDevDay(
  formData: RegistrationFormData,
): Promise<ActionResult> {
  try {
    const result = registrationSchema.safeParse(formData);

    if (!result.success) {
      return {
        success: false,
        message:
          result.error.issues[0]?.message ??
          "Validation failed. Please check your inputs.",
      };
    }

    const { name, email, role, stack, expectation, profile } = result.data;

    // ── Find the Devs Day event ─────────────────────────────────────────────
    const event = await prisma.event.findFirst({
      where: { slug: { startsWith: "devs-day" } },
    });

    if (!event) {
      return {
        success: false,
        message:
          "Registration is not currently available. Please try again later.",
      };
    }

    // ── Check for existing registration ───────────────────────────────────────
    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId: event.id, email },
    });

    if (existing) {
      return {
        success: false,
        message:
          "You're already registered for Dev Day! Check your inbox for the confirmation email.",
      };
    }

    // ── Check attendee limit ────────────────────────────────────────────────
    if (event.attendeeLimit) {
      const acceptedCount = await prisma.eventRegistration.count({
        where: { eventId: event.id, status: "ACCEPTED" },
      });
      if (acceptedCount >= event.attendeeLimit) {
        return {
          success: false,
          message: "Sorry, this event has reached full capacity.",
        };
      }
    }

    // ── Save to database ──────────────────────────────────────────────────────
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        name,
        email,
        status: "PENDING",
        formData: JSON.stringify({
          role,
          stack: stack || "",
          expectation: expectation || "",
          profile: profile || "",
        }),
      },
    });

    // ── Send emails (don't block registration on email failure) ────────────
    try {
      await sendPendingEmail(
        { name: registration.name, email: registration.email },
        event,
      );

      await sendTeamNotificationEmail(
        {
          name: registration.name,
          email: registration.email,
          formData: {
            role,
            stack: stack || "",
            expectation: expectation || "",
            profile: profile || "",
          },
        },
        event,
      );
    } catch (emailError) {
      console.error("[Dev Day Registration] Email sending failed:", emailError);
    }

    return {
      success: true,
      message: `You're registered! Check your inbox (${email}) for a confirmation.`,
    };
  } catch (error) {
    console.error("[Dev Day Registration]", error);
    return {
      success: false,
      message: "Something went wrong. Please try again or contact support.",
    };
  }
}
