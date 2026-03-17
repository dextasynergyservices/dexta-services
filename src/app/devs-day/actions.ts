"use server";

import { z } from "zod";
import * as Brevo from "@getbrevo/brevo";
import prisma from "@/lib/prisma";

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
    const firstName = name.split(" ")[0];

    // ── Check for existing registration ───────────────────────────────────────
    const existing = await prisma.devsDayRegistration.findFirst({
      where: { email },
    });

    if (existing) {
      return {
        success: false,
        message:
          "You're already registered for Dev Day! Check your inbox for the confirmation email.",
      };
    }

    // ── Save to database ──────────────────────────────────────────────────────
    await prisma.devsDayRegistration.create({
      data: {
        name,
        email,
        role,
        stack: stack || null,
        expectation: expectation || null,
        profile: profile || null,
      },
    });

    // ── Send emails (don't block registration on email failure) ────────────
    const senderEmail = process.env.SENDER_EMAIL!;
    const senderName = process.env.SENDER_NAME!;
    const teamEmail = process.env.TEAM_EMAIL!;
    const teamName = process.env.TEAM_NAME!;

    try {
      const apiInstance = new Brevo.TransactionalEmailsApi();
      apiInstance.setApiKey(
        Brevo.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY!,
      );

      // ── Notification email to Dexta team ────────────────────────────────────
      const notifyEmail = new Brevo.SendSmtpEmail();
      notifyEmail.subject = `Dev Day Registration — ${name}`;
      notifyEmail.sender = { name: senderName, email: senderEmail };
      notifyEmail.to = [{ email: teamEmail, name: teamName }];
      notifyEmail.replyTo = { email, name };
      notifyEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;">
            <div style="max-width:580px;margin:0 auto;padding:40px 24px;">
              <div style="border:1px solid #333;border-radius:12px;padding:32px;background:#1a1a1a;">
                <p style="color:#00b2ff;font-size:12px;letter-spacing:4px;margin:0 0 8px;">DEXTA DEV DAY</p>
                <h1 style="color:#ffffff;font-size:22px;margin:0 0 4px;">New Registration</h1>
                <p style="color:#666;font-size:13px;margin:0 0 28px;">Someone just signed up for Dev Day.</p>

                <div style="border-top:1px solid #333;padding-top:24px;">
                  <table style="width:100%;border-collapse:collapse;">
                    <tr>
                      <td style="padding:10px 0;color:#666;font-size:12px;letter-spacing:1px;width:140px;">NAME</td>
                      <td style="padding:10px 0;color:#fff;font-size:14px;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;color:#666;font-size:12px;letter-spacing:1px;">EMAIL</td>
                      <td style="padding:10px 0;font-size:14px;">
                        <a href="mailto:${email}" style="color:#00b2ff;text-decoration:none;">${email}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;color:#666;font-size:12px;letter-spacing:1px;">ROLE</td>
                      <td style="padding:10px 0;color:#fff;font-size:14px;">${role}</td>
                    </tr>
                    ${
                      stack
                        ? `<tr>
                            <td style="padding:10px 0;color:#666;font-size:12px;letter-spacing:1px;">STACK</td>
                            <td style="padding:10px 0;color:#fff;font-size:14px;">${stack}</td>
                          </tr>`
                        : ""
                    }
                    ${
                      expectation
                        ? `<tr>
                            <td style="padding:10px 0;color:#666;font-size:12px;letter-spacing:1px;">EXPECTATION</td>
                            <td style="padding:10px 0;color:#a0a0a0;font-size:14px;">${expectation}</td>
                          </tr>`
                        : ""
                    }
                    ${
                      profile
                        ? `<tr>
                            <td style="padding:10px 0;color:#666;font-size:12px;letter-spacing:1px;">PROFILE</td>
                            <td style="padding:10px 0;font-size:14px;">
                              <a href="${profile}" style="color:#00b2ff;text-decoration:none;">${profile}</a>
                            </td>
                          </tr>`
                        : ""
                    }
                  </table>
                </div>

                <div style="margin-top:28px;padding-top:20px;border-top:1px solid #333;">
                  <p style="color:#444;font-size:11px;margin:0;">Dexta Synergy Services · @hellodexta</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      await apiInstance.sendTransacEmail(notifyEmail);

      // ── Confirmation email to registrant ────────────────────────────────────
      const confirmEmail = new Brevo.SendSmtpEmail();
      confirmEmail.subject = `You're registered for Dev Day!`;
      confirmEmail.sender = { name: senderName, email: senderEmail };
      confirmEmail.to = [{ email, name }];
      confirmEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;">
            <div style="max-width:580px;margin:0 auto;padding:40px 24px;">
              <div style="border:1px solid #333;border-radius:12px;padding:32px;background:#1a1a1a;">
                <p style="color:#00b2ff;font-size:12px;letter-spacing:4px;margin:0 0 8px;">DEXTA DEV DAY</p>
                <h1 style="color:#ffffff;font-size:24px;margin:0 0 16px;">
                  You're in, ${firstName}!
                </h1>
                <p style="color:#a0a0a0;font-size:14px;line-height:1.8;margin:0 0 24px;">
                  Thanks for registering for <strong style="color:#fff;">Dev Day</strong> — an online space where
                  developers connect, share what they've been building, discover new tools, and talk real experiences.
                </p>
                <div style="background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:20px;margin-bottom:24px;">
                  <p style="color:#666;font-size:11px;letter-spacing:2px;margin:0 0 8px;">WHAT'S NEXT</p>
                  <p style="color:#a0a0a0;font-size:13px;line-height:1.8;margin:0;">
                    We'll send you the event link and final details closer to the date.
                    In the meantime, keep building great things.
                  </p>
                </div>
                <p style="color:#a0a0a0;font-size:13px;margin:0 0 4px;">
                  Questions? Reply to this email or reach us at
                  <a href="mailto:${teamEmail}" style="color:#00b2ff;text-decoration:none;">${teamEmail}</a>
                </p>
                <div style="margin-top:28px;padding-top:20px;border-top:1px solid #333;">
                  <p style="color:#444;font-size:11px;margin:0;">Dexta Synergy Services · @hellodexta · Port Harcourt, Nigeria</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      await apiInstance.sendTransacEmail(confirmEmail);
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
