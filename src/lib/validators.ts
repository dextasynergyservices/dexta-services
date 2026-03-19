import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(500, { message: "Message must be less than 500 characters." }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const composeEmailSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  body: z.string().min(1, "Email body is required").max(10000),
  recipientFilter: z.enum(["all", "filtered"]),
  roleFilter: z.string().optional(),
  eventFilter: z.string().optional(),
  statusFilter: z.string().optional(),
});

export type ComposeEmailData = z.infer<typeof composeEmailSchema>;

export type ContactFormState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
};

// ─── Event Management ────────────────────────────────────────────────────────

export const eventFormFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Label is required"),
  type: z.enum(["TEXT", "EMAIL", "SELECT", "TEXTAREA", "URL", "CHECKBOX"]),
  placeholder: z.string().optional(),
  required: z.boolean(),
  options: z.string().optional(), // JSON array string for SELECT
  position: z.number().int().min(0),
});

export type EventFormFieldData = z.infer<typeof eventFormFieldSchema>;

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(250)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    ),
  description: z.string().min(1, "Description is required").max(5000),
  dateTime: z.string().min(1, "Date and time is required"),
  timezone: z.string().min(1, "Timezone is required"),
  location: z.string().min(1, "Location is required").max(300),
  imagePublicId: z.string().optional(),
  attendeeLimit: z.number().int().positive().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]),
  formFields: z.array(eventFormFieldSchema),
});

export type EventFormData = z.infer<typeof eventFormSchema>;

// Dynamic registration validator factory — builds a Zod schema at runtime
// from the EventFormField definitions for a specific event.
export function createRegistrationValidator(
  fields: { name: string; type: string; required: boolean }[],
) {
  const shape: Record<string, z.ZodTypeAny> = {
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
  };

  for (const field of fields) {
    // Skip name/email as they're always included above
    if (field.name === "name" || field.name === "email") continue;

    let validator: z.ZodTypeAny;

    switch (field.type) {
      case "EMAIL":
        validator = z.string().email("Please enter a valid email");
        break;
      case "URL":
        validator = z
          .string()
          .url("Please enter a valid URL")
          .or(z.literal(""));
        break;
      case "CHECKBOX":
        validator = z.boolean();
        break;
      default:
        validator = z.string();
    }

    if (!field.required && field.type !== "CHECKBOX") {
      validator = validator.optional().or(z.literal(""));
    } else if (field.required && field.type !== "CHECKBOX") {
      validator = z.string().min(1, `${field.name} is required`);
      if (field.type === "EMAIL") {
        validator = z.string().email("Please enter a valid email");
      } else if (field.type === "URL") {
        validator = z.string().url("Please enter a valid URL");
      }
    }

    shape[field.name] = validator;
  }

  return z.object(shape);
}
