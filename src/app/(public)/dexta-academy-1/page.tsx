import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "DXT GRADE",
  description: "Preview the DXT GRADE school website",
};

export default function DextaAcademyRoute() {
  redirect("/dexta-academy-1/index.html");
}
