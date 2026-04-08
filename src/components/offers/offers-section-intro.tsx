import { cn } from "@/lib/utils";

interface OffersSectionIntroProps {
  label: string;
  title: string;
  body: string;
  align?: "left" | "center";
}

export function OffersSectionIntro({
  label,
  title,
  body,
  align = "center",
}: OffersSectionIntroProps) {
  return (
    <div
      className={cn(
        "max-w-[44rem]",
        align === "center" ? "mx-auto text-center" : "text-left",
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.32em] text-[var(--offers-page-muted)]",
          align === "center" ? "mx-auto max-w-max" : "",
        )}
        style={{ overflowWrap: "anywhere" }}
      >
        {label}
      </p>
      <h2
        className={cn(
          "mt-4 max-w-[15ch] font-display text-3xl tracking-[-0.04em] text-[var(--offers-page-fg-strong)] sm:text-4xl lg:text-[2.8rem]",
          align === "center" ? "mx-auto" : "",
        )}
        style={{ textWrap: "balance", overflowWrap: "anywhere" }}
      >
        {title}
      </h2>
      <p
        className={cn(
          "mt-4 max-w-2xl text-base leading-8 text-[var(--offers-page-muted-soft)] sm:text-lg",
          align === "center" ? "mx-auto" : "",
        )}
        style={{ overflowWrap: "anywhere" }}
      >
        {body}
      </p>
    </div>
  );
}
