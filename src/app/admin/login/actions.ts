"use server";

import { headers } from "next/headers";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * Pre-login check: rate limit + reCAPTCHA verification.
 * Called before signIn("credentials") on the client.
 */
export async function verifyLoginRequest(
  recaptchaToken?: string,
): Promise<{ success: boolean; message?: string }> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  // Rate limit login attempts by IP
  const limit = rateLimit(`login:${ip}`, RATE_LIMITS.login);
  if (!limit.success) {
    const minutes = Math.ceil(limit.resetMs / 60000);
    return {
      success: false,
      message: `Too many login attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
    };
  }

  // Verify reCAPTCHA
  if (recaptchaToken) {
    const result = await verifyRecaptcha(recaptchaToken, "login");
    if (!result.success) {
      return {
        success: false,
        message: "reCAPTCHA verification failed. Please try again.",
      };
    }
  }

  return { success: true };
}
