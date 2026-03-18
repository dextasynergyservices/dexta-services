"use server";

import { headers } from "next/headers";
import { contactFormSchema, ContactFormState } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import * as brevo from "@getbrevo/brevo";

const brevoApiKey = process.env.BREVO_API_KEY;
if (!brevoApiKey) {
  throw new Error("Missing BREVO_API_KEY environment variable");
}
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Rate limit by IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  const limit = rateLimit(`contact:${ip}`, RATE_LIMITS.contact);
  if (!limit.success) {
    return {
      message: "Too many requests. Please try again later.",
    };
  }

  const validatedFields = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      message: "Please fix the errors below.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Verify reCAPTCHA v3
  const recaptchaToken = formData.get("recaptchaToken") as string;
  if (recaptchaToken) {
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, "contact");
    if (!recaptchaResult.success) {
      return {
        message: "reCAPTCHA verification failed. Please try again.",
      };
    }
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: validatedFields.data.name,
        email: validatedFields.data.email,
        message: validatedFields.data.message,
      },
    });

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [
      { email: validatedFields.data.email, name: validatedFields.data.name },
    ];
    sendSmtpEmail.templateId = 1;
    sendSmtpEmail.params = {
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      message: validatedFields.data.message,
    };
    sendSmtpEmail.sender = {
      name: process.env.SENDER_NAME!,
      email: process.env.SENDER_EMAIL!,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    revalidatePath("/");

    return {
      message: "Your message has been sent successfully!",
    };
  } catch (error) {
    console.error(error);
    return {
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}
