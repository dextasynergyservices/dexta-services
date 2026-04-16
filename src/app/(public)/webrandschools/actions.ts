"use server";

import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  schoolWebsiteApplicationSchema,
  type SchoolWebsiteApplicationInput,
} from "@/lib/validators";
import { SCHOOL_WEBSITE_APPLICATIONS_TAG } from "@/lib/we-brand-schools-cache";

export type SchoolWebsiteApplicationActionResult = {
  success: boolean;
  message: string;
};

export async function submitSchoolWebsiteApplication(
  data: SchoolWebsiteApplicationInput,
  recaptchaToken?: string,
): Promise<SchoolWebsiteApplicationActionResult> {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown";

    const limit = rateLimit(`school-website-application:${ip}`, RATE_LIMITS.form);
    if (!limit.success) {
      return {
        success: false,
        message: "Too many requests. Please try again later.",
      };
    }

    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(
        recaptchaToken,
        "school_website_application",
      );

      if (!recaptchaResult.success) {
        return {
          success: false,
          message: "reCAPTCHA verification failed. Please try again.",
        };
      }
    }

    const parsed = schoolWebsiteApplicationSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ??
          "Validation failed. Please check your submission.",
      };
    }

    const payload = parsed.data;

    await prisma.schoolWebsiteApplication.create({
      data: {
        templateId: payload.templateId ?? null,
        selectedTemplateName: payload.selectedTemplateName,
        schoolName: payload.schoolName,
        aboutSchool: payload.aboutSchool,
        vision: payload.vision,
        mission: payload.mission,
        coreValues: payload.coreValues,
        officialPhone: payload.officialPhone,
        officialEmail: payload.officialEmail,
        officialAddress: payload.officialAddress,
        officialWebsiteUrl: payload.officialWebsiteUrl || null,
        officialContactName: payload.officialContactName || null,
        officialContactRole: payload.officialContactRole || null,
        officialContactPhone: payload.officialContactPhone || null,
        officialContactEmail: payload.officialContactEmail || null,
        domainChoice: payload.domainChoice,
        existingDomain: payload.existingDomain || null,
        preferredDomain1: payload.preferredDomain1 || null,
        preferredDomain2: payload.preferredDomain2 || null,
        status: "PENDING",
        adminNotes: null,
      },
    });

    updateTag(SCHOOL_WEBSITE_APPLICATIONS_TAG);
    revalidatePath("/webrandschools");
    revalidatePath("/admin");

    return {
      success: true,
      message:
        "Your school website request has been received. Our team will review it and get in touch.",
    };
  } catch (error) {
    console.error("[Submit School Website Application]", error);

    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}
