import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { DynamicRegistrationForm } from "@/components/events/dynamic-registration-form";
import { RecaptchaProvider } from "@/components/layout/recaptcha-provider";
import { registerForEvent } from "./actions";
import prisma from "@/lib/prisma";
import { formatDateInTimezone } from "@/lib/timezone";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { title: true, description: true, imagePublicId: true },
  });

  if (!event) return {};

  const ogImage = event.imagePublicId
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/${event.imagePublicId}`
    : undefined;

  return {
    title: event.title,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630 }] }
        : {}),
    },
  };
}

export default async function EventRegistrationPage({ params }: Props) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { formFields: { orderBy: { position: "asc" } } },
  });

  if (!event || event.status === "DRAFT") notFound();

  const acceptedCount = await prisma.eventRegistration.count({
    where: { eventId: event.id, status: "ACCEPTED" },
  });

  const isClosed = event.status === "CLOSED";
  const spotsLeft = event.attendeeLimit
    ? event.attendeeLimit - acceptedCount
    : null;

  const boundRegister = async (formData: Record<string, string>) => {
    "use server";
    return registerForEvent(slug, formData);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left — Event Info */}
          <div>
            {event.imagePublicId && (
              <div className="mb-6 overflow-hidden rounded-2xl border border-[#222]">
                <Image
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_800,q_auto,f_auto/${event.imagePublicId}`}
                  alt={event.title}
                  width={800}
                  height={400}
                  className="h-48 w-full object-cover sm:h-64"
                  priority
                />
              </div>
            )}

            <p className="mb-2 text-xs font-medium uppercase tracking-[4px] text-cyan-400">
              Event
            </p>
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              {event.title}
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-[#a0a0a0]">
              {event.description}
            </p>

            <div className="space-y-3 rounded-xl border border-[#222] bg-[#111] p-5">
              <div className="flex items-center gap-3 text-sm text-[#a0a0a0]">
                <CalendarDays className="h-4 w-4 text-cyan-400" />
                {formatDateInTimezone(event.dateTime, event.timezone)}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#a0a0a0]">
                <MapPin className="h-4 w-4 text-cyan-400" />
                {event.location}
              </div>
              {event.attendeeLimit && (
                <div className="flex items-center gap-3 text-sm text-[#a0a0a0]">
                  <Users className="h-4 w-4 text-cyan-400" />
                  {isClosed ? (
                    <span className="text-red-400">Registration closed</span>
                  ) : spotsLeft !== null && spotsLeft > 0 ? (
                    `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} remaining`
                  ) : (
                    `${acceptedCount} / ${event.attendeeLimit} accepted`
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right — Registration Form */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <RecaptchaProvider>
              <DynamicRegistrationForm
                eventSlug={slug}
                fields={event.formFields.map((f) => ({
                  name: f.name,
                  label: f.label,
                  type: f.type,
                  placeholder: f.placeholder,
                  required: f.required,
                  options: f.options,
                }))}
                isClosed={isClosed}
                submitAction={boundRegister}
              />
            </RecaptchaProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
