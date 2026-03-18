import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { formatDateShort } from "@/lib/timezone";

interface EventCardProps {
  slug: string;
  title: string;
  description: string;
  dateTime: Date;
  timezone: string;
  location: string;
  imagePublicId: string | null;
  attendeeLimit: number | null;
  acceptedCount: number;
  isPast?: boolean;
}

export function EventCard({
  slug,
  title,
  description,
  dateTime,
  timezone,
  location,
  imagePublicId,
  attendeeLimit,
  acceptedCount,
  isPast,
}: EventCardProps) {
  const formattedDate = formatDateShort(new Date(dateTime), timezone);

  const spotsLeft = attendeeLimit ? attendeeLimit - acceptedCount : null;

  return (
    <Link
      href={`/events/${slug}`}
      className={`group block overflow-hidden rounded-2xl border border-[#222] bg-[#111] transition-colors hover:border-cyan-500/30 ${isPast ? "opacity-70" : ""}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-[#0d0d0d]">
        {imagePublicId ? (
          <Image
            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_600,q_auto,f_auto/${imagePublicId}`}
            alt={title}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isPast ? "grayscale-[40%]" : ""}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <CalendarDays className="h-12 w-12 text-[#333]" />
          </div>
        )}
        {isPast ? (
          <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-[#888] backdrop-blur-sm">
            Ended
          </div>
        ) : spotsLeft !== null ? (
          <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="mb-2 text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-[#888]">{description}</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#999]">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {location}
          </span>
          {attendeeLimit && (
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {acceptedCount} / {attendeeLimit}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
