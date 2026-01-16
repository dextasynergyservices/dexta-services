"use server";

import { contactFormSchema, ContactFormState } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import * as brevo from "@getbrevo/brevo";

const recaptchaClient = new RecaptchaEnterpriseServiceClient();

const brevoApiKey = process.env.BREVO_API_KEY;
if (!brevoApiKey) {
  throw new Error("Missing BREVO_API_KEY environment variable");
}
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);

async function createAssessment({
  projectID,
  recaptchaKey,
  token,
}: {
  projectID: string;
  recaptchaKey: string;
  token: string;
}) {
  const projectPath = recaptchaClient.projectPath(projectID);

  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  };

  const [response] = await recaptchaClient.createAssessment(request);

  if (!response.tokenProperties?.valid) {
    console.log(
      `The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`,
    );
    return null;
  }

  if (
    response.riskAnalysis?.score === null ||
    response.riskAnalysis?.score === undefined
  ) {
    console.log(
      `The CreateAssessment call failed because the risk analysis score was not available.`,
    );
    return null;
  }

  return response.riskAnalysis.score;
}

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
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

  const token = formData.get("g-recaptcha-response") as string;

  if (!token) {
    return {
      message: "Please complete the reCAPTCHA.",
    };
  }

  const projectId = process.env.RECAPTCHA_PROJECT_ID;
  const recaptchaKey = process.env.RECAPTCHA_SITE_KEY;

  if (!projectId || !recaptchaKey) {
    return {
      message: "reCAPTCHA is not configured correctly.",
    };
  }

  const score = await createAssessment({
    projectID: projectId,
    recaptchaKey: recaptchaKey,
    token: token,
  });

  // This is a score from 0.0 to 1.0, where 1.0 is very likely a human
  // and 0.0 is very likely a bot. We can set a threshold.
  if (score === null || score < 0.5) {
    return {
      message: "reCAPTCHA verification failed.",
    };
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
    sendSmtpEmail.templateId = 1; // Replace with your Brevo template ID
    sendSmtpEmail.params = {
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      message: validatedFields.data.message,
    };
    sendSmtpEmail.sender = {
      name: "Dexta Synergy",
      email: "noreply@dexta.synergy",
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
