import { Suspense } from "react";
import ProjectPage from "@/components/projectPage";

export const metadata = {
  title: "Projects | Our Work",
  description: "Explore our portfolio of design, print, and website projects",
};

export default function ProjectsPage() {
  return (
    <Suspense>
      <ProjectPage />
    </Suspense>
  );
}
