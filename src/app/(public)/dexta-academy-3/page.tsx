import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "DXT ACADEMY",
  description: "Preview the DXT ACADEMY school website",
};

export default function DextaAcademyRoute() {
  redirect("/dexta-academy-3/index.html");
}
