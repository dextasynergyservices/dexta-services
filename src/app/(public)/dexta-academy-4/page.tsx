import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "School B",
  description: "Preview the School B website",
};

export default function DextaAcademyFourRoute() {
  redirect("/dexta-academy-4/index.html");
}
