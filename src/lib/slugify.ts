import { randomBytes } from "crypto";

export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = randomBytes(2).toString("hex");
  return `${base}-${suffix}`;
}
