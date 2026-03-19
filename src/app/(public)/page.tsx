import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import Hero from "@/components/home/hero";
import { ServicesSection } from "@/components/home/services-section";
import { ProjectGallery } from "@/components/home/project-gallery";
import { fetchProjects } from "@/lib/api";
import { ContactForm } from "@/components/home/contact-form";
import { FloatingElements } from "@/components/home/floating-elements";
import TextParallaxSection from "@/components/home/textParallaxSection";

export default async function Home() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  return (
    <>
      <FloatingElements />
      <section id="home">
        <Hero />
      </section>
      <TextParallaxSection />
      <section id="services">
        <ServicesSection />
      </section>
      <section id="projects">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ProjectGallery />
        </HydrationBoundary>
      </section>
      <section id="contact">
        <ContactForm />
      </section>
    </>
  );
}
