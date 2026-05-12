import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "DXT Academy",
  description: "Preview the DXT Academy school website",
};

export default function DextaAcademyFiveRoute() {
  redirect("/dexta-academy-5/index.html");
}
