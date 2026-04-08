"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { OffersPlanData } from "@/lib/api";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import type { AudienceColor, BillingDuration } from "@/lib/offers-defaults";
import { cn } from "@/lib/utils";
import { getOffersReachCardStyle } from "./offers-theme";

function formatMoney(value: number | null, currency: "USD" | "NGN") {
  if (value == null) return null;
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(value);
}

function getDurationLabel(duration: BillingDuration) {
  switch (duration) {
    case "DAILY":
      return "Daily";
    case "WEEKLY":
      return "Weekly";
    case "MONTHLY":
      return "Monthly";
    case "QUARTERLY":
      return "Quarterly";
    case "YEARLY":
      return "Yearly";
    default:
      return duration;
  }
}

function hexToRgb(value: string) {
  const sanitized = value.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(sanitized)) {
    return null;
  }

  const normalized =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : sanitized;

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function withAlpha(value: string, alpha: number) {
  const rgb = hexToRgb(value);

  if (!rgb) {
    return undefined;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function getPriceSupport(
  formattedNgn: string | null,
  formattedUsd: string | null,
  hasBilling: boolean,
) {
  if (formattedNgn && formattedUsd) {
    return `Also available in USD at ${formattedUsd}.`;
  }

  if (formattedNgn) {
    return hasBilling
      ? "USD quote available on request."
      : "USD quote can be provided on request.";
  }

  if (formattedUsd) {
    return hasBilling
      ? "NGN quote available on request."
      : "NGN quote can be provided on request.";
  }

  return "Pricing depends on your scope, timing, and delivery needs.";
}

function buildWhatsAppHref(baseHref: string | null, message: string) {
  if (!baseHref) {
    return "/contact";
  }

  try {
    const url = new URL(baseHref);
    url.searchParams.set("text", message);
    return url.toString();
  } catch {
    const encodedMessage = encodeURIComponent(message);
    return baseHref.includes("?")
      ? `${baseHref}&text=${encodedMessage}`
      : `${baseHref}?text=${encodedMessage}`;
  }
}

function resolvePlanImageSrc(imagePublicId: string | null) {
  if (!imagePublicId) {
    return "/images/services.png";
  }

  return /^https?:\/\//i.test(imagePublicId)
    ? imagePublicId
    : getCloudinaryUrl(imagePublicId, {
        w: 1400,
        h: 900,
        c: "fill",
        f: "auto",
        g: "auto",
        q: "auto",
      });
}

interface PlanCardProps {
  plan: OffersPlanData;
  audienceLabel: string;
  offerGroupName: string;
  offersWhatsAppHref: string | null;
  audienceColor: AudienceColor;
  popularBadgeText: string;
  featuresLabel: string;
  choosePlanText: string;
  requestQuoteText: string;
}

export function PlanCard({
  plan,
  audienceLabel,
  offerGroupName,
  offersWhatsAppHref,
  audienceColor,
  popularBadgeText,
  featuresLabel,
  choosePlanText,
  requestQuoteText,
}: PlanCardProps) {
  const accentStyle = getOffersReachCardStyle(audienceColor);
  const billingOptions = useMemo(
    () => [...plan.billingOptions].sort((a, b) => a.position - b.position),
    [plan.billingOptions],
  );
  const defaultOption = useMemo(
    () => billingOptions.find((option) => option.isDefault) ?? billingOptions[0] ?? null,
    [billingOptions],
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    defaultOption?.id ?? null,
  );

  useEffect(() => {
    setSelectedOptionId(defaultOption?.id ?? null);
  }, [defaultOption?.id, plan.id]);

  const selectedOption =
    billingOptions.find((option) => option.id === selectedOptionId) ??
    defaultOption;
  const hasBillingToggle = plan.billingEnabled && billingOptions.length > 1;
  const formattedNgn = formatMoney(selectedOption?.priceNGN ?? null, "NGN");
  const formattedUsd = formatMoney(selectedOption?.priceUSD ?? null, "USD");
  const primaryPrice = formattedNgn ?? formattedUsd ?? "Custom quote";
  const priceSupport = getPriceSupport(
    formattedNgn,
    formattedUsd,
    plan.billingEnabled,
  );
  const hasCustomHighlightOverride = Boolean(
    plan.isHighlighted && (plan.highlightBgColor || plan.highlightTextColor),
  );
  const customHighlightBg =
    plan.isHighlighted && plan.highlightBgColor
      ? plan.highlightBgColor
      : hasCustomHighlightOverride
        ? "var(--offers-card-tint)"
        : null;
  const customHighlightText =
    plan.isHighlighted && plan.highlightTextColor
      ? plan.highlightTextColor
      : plan.isHighlighted && plan.highlightBgColor
        ? "#ffffff"
        : null;
  const hasCustomHighlightColors = hasCustomHighlightOverride;
  const customSoftBorderColor =
    customHighlightText ? withAlpha(customHighlightText, 0.22) : undefined;
  const customSoftSurfaceColor =
    customHighlightText ? withAlpha(customHighlightText, 0.12) : undefined;
  const customMutedColor =
    customHighlightText ? withAlpha(customHighlightText, 0.76) : undefined;
  const selectedBillingLabel = selectedOption
    ? selectedOption.label || getDurationLabel(selectedOption.duration)
    : null;
  const planImageSrc = resolvePlanImageSrc(plan.imagePublicId);
  const draftedMessage = [
    `Hello Dexta, I'm interested in the "${plan.name}" offer under ${offerGroupName} for ${audienceLabel}.`,
    selectedBillingLabel
      ? `I'm looking at the ${selectedBillingLabel}${primaryPrice !== "Custom quote" ? ` option priced at ${primaryPrice}` : " option"}.`
      : "",
    "Please share the next step.",
  ]
    .filter(Boolean)
    .join(" ");
  const ctaHref = buildWhatsAppHref(offersWhatsAppHref, draftedMessage);
  const ctaLabel =
    formattedNgn || formattedUsd ? choosePlanText : requestQuoteText;
  const isExternalCta = !ctaHref.startsWith("/");
  const customHighlightCardStyle =
    hasCustomHighlightOverride && customHighlightBg && customHighlightText
      ? {
          backgroundColor: customHighlightBg,
          color: customHighlightText,
          borderColor: customSoftBorderColor ?? customHighlightText,
        }
      : undefined;
  const customHighlightSurfaceStyle =
    hasCustomHighlightOverride && customHighlightText
      ? {
          backgroundColor: customSoftSurfaceColor,
          borderColor: customSoftBorderColor,
          color: customHighlightText,
        }
      : undefined;
  const customHighlightInverseStyle =
    hasCustomHighlightOverride && customHighlightBg && customHighlightText
      ? {
          backgroundColor: customHighlightText,
          borderColor: customHighlightText,
          color: customHighlightBg,
        }
      : undefined;
  const customHighlightMutedStyle =
    hasCustomHighlightOverride && customMutedColor
      ? { color: customMutedColor }
      : undefined;

  return (
    <article
      style={
        hasCustomHighlightColors
          ? { ...accentStyle, ...customHighlightCardStyle }
          : accentStyle
      }
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[28px] border p-6 sm:p-7",
        plan.isHighlighted
          ? hasCustomHighlightColors
            ? "text-current"
            : "border-[var(--offers-card-border)] bg-[var(--offers-card-tint)] text-[var(--offers-card-fg)]"
          : "border-[var(--offers-page-border)] bg-white text-[var(--offers-page-fg-strong)]",
      )}
    >
      <div
        className="-mx-6 -mt-6 mb-5 overflow-hidden sm:-mx-7 sm:-mt-7"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={planImageSrc}
          alt={`${plan.name} offer image`}
          className="h-44 w-full object-cover sm:h-48"
          loading="lazy"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              "inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
              plan.isHighlighted
                ? hasCustomHighlightColors
                  ? ""
                  : "border-white/20 bg-white/10 text-white"
                : "border-[var(--offers-page-border)] bg-white text-[var(--offers-page-muted)]",
            )}
            style={
              plan.isHighlighted && hasCustomHighlightColors
                ? customHighlightSurfaceStyle
                : undefined
            }
          >
            Offer
          </span>
          {plan.isHighlighted ? (
            <span
              className={cn(
                "inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                hasCustomHighlightColors
                  ? ""
                  : "border-white/20 bg-white text-[var(--offers-accent-strong)]",
              )}
              style={
                hasCustomHighlightColors
                  ? customHighlightInverseStyle
                  : undefined
              }
            >
              {popularBadgeText}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <h3
          className={cn(
            "font-display text-[1.85rem] leading-tight tracking-[-0.045em] sm:text-[2rem]",
            plan.isHighlighted
              ? hasCustomHighlightColors
                ? "text-current"
                : "text-white"
              : "text-[var(--offers-page-fg-strong)]",
          )}
          style={{ textWrap: "balance", overflowWrap: "anywhere" }}
        >
          {plan.name}
        </h3>
        {plan.subtitle ? (
          <p
            className={cn(
              "mt-2 text-sm leading-6",
              plan.isHighlighted
                ? hasCustomHighlightColors
                  ? ""
                  : "text-white/75"
                : "text-[var(--offers-page-muted-soft)]",
            )}
            style={{
              overflowWrap: "anywhere",
              ...(plan.isHighlighted && hasCustomHighlightColors
                ? customHighlightMutedStyle
                : undefined),
            }}
          >
            {plan.subtitle}
          </p>
        ) : null}
      </div>

      {hasBillingToggle ? (
        <div className="mt-5 space-y-2">
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.22em]",
              plan.isHighlighted
                ? hasCustomHighlightColors
                  ? ""
                  : "text-white/70"
                : "text-[var(--offers-page-muted)]",
            )}
            style={
              plan.isHighlighted && hasCustomHighlightColors
                ? customHighlightMutedStyle
                : undefined
            }
          >
            Billing Options
          </p>
          <div className="grid grid-cols-2 gap-2">
            {billingOptions.map((option) => {
              const isActive = option.id === selectedOption?.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOptionId(option.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    isActive
                      ? plan.isHighlighted && hasCustomHighlightColors
                        ? "border"
                        : "border-white bg-white text-[var(--offers-accent-strong)]"
                      : plan.isHighlighted
                        ? hasCustomHighlightColors
                          ? "border text-current"
                          : "border-white/20 bg-white/10 text-white hover:bg-white/15"
                        : "border-[var(--offers-page-border)] bg-[var(--offers-page-surface-subtle)] text-[var(--offers-page-fg-strong)] hover:border-[var(--offers-accent-border-strong)]",
                  )}
                  style={
                    plan.isHighlighted && hasCustomHighlightColors
                      ? isActive
                        ? customHighlightInverseStyle
                        : customHighlightSurfaceStyle
                      : undefined
                  }
                >
                  <span className="block text-sm font-semibold">
                    {option.label || getDurationLabel(option.duration)}
                  </span>
                  <span className="mt-0.5 block text-[11px] uppercase tracking-[0.14em] opacity-70">
                    {getDurationLabel(option.duration)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
          <span
            className={cn(
              "font-display text-[2.4rem] leading-none tracking-[-0.045em] sm:text-[2.7rem]",
              plan.isHighlighted
                ? hasCustomHighlightColors
                  ? "text-current"
                  : "text-white"
                : "text-[var(--offers-page-fg-strong)]",
            )}
          >
            {primaryPrice}
          </span>
        </div>
        {selectedOption ? (
          <p
            className={cn(
              "mt-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
              plan.isHighlighted
                ? hasCustomHighlightColors
                  ? ""
                  : "text-white/70"
                : "text-[var(--offers-page-muted)]",
            )}
            style={
              plan.isHighlighted && hasCustomHighlightColors
                ? customHighlightMutedStyle
                : undefined
            }
          >
            {selectedOption.label || getDurationLabel(selectedOption.duration)}
          </p>
        ) : null}
        <p
          className={cn(
            "mt-2 text-xs leading-5",
            plan.isHighlighted
              ? hasCustomHighlightColors
                ? ""
                : "text-white/75"
              : "text-[var(--offers-page-muted-soft)]",
          )}
          style={
            plan.isHighlighted && hasCustomHighlightColors
              ? customHighlightMutedStyle
              : undefined
          }
        >
          {priceSupport}
        </p>
      </div>

      <div
        className={cn(
          "mt-5 border-t pt-5",
          plan.isHighlighted
            ? hasCustomHighlightColors
              ? ""
              : "border-white/20"
            : "border-[var(--offers-page-border)]",
        )}
        style={
          plan.isHighlighted && hasCustomHighlightColors
            ? { borderColor: customSoftBorderColor }
            : undefined
        }
      >
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.24em]",
            plan.isHighlighted
              ? hasCustomHighlightColors
                ? ""
                : "text-white/70"
              : "text-[var(--offers-page-muted)]",
          )}
          style={
            plan.isHighlighted && hasCustomHighlightColors
              ? customHighlightMutedStyle
              : undefined
          }
        >
          {featuresLabel}
        </p>

        <ul className="mt-3 space-y-3">
          {plan.features.map((feature, index) => (
            <li
              key={`${plan.id}-${index}`}
              className={cn(
                "flex items-start gap-3 text-sm leading-6",
                plan.isHighlighted
                  ? hasCustomHighlightColors
                    ? "text-current"
                    : "text-white/90"
                  : "text-[var(--offers-page-fg-strong)]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  plan.isHighlighted
                    ? hasCustomHighlightColors
                      ? ""
                      : "bg-white text-[var(--offers-accent-strong)]"
                    : "bg-[var(--offers-page-surface-subtle)] text-[var(--offers-accent-strong)]",
                )}
                style={
                  plan.isHighlighted && hasCustomHighlightColors
                    ? customHighlightSurfaceStyle
                    : undefined
                }
              >
                <Check className="h-3 w-3" />
              </span>
              <span style={{ overflowWrap: "anywhere" }}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={cn(
          "mt-6 border-t pt-5",
          plan.isHighlighted
            ? hasCustomHighlightColors
              ? ""
              : "border-white/20"
            : "border-[var(--offers-page-border)]",
        )}
        style={
          plan.isHighlighted && hasCustomHighlightColors
            ? { borderColor: customSoftBorderColor }
            : undefined
        }
      >
        <Link
          href={ctaHref}
          target={isExternalCta ? "_blank" : undefined}
          rel={isExternalCta ? "noreferrer" : undefined}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
            plan.isHighlighted
              ? hasCustomHighlightColors
                ? "border hover:opacity-95"
                : "bg-white text-[var(--offers-accent-strong)] hover:opacity-95 focus-visible:ring-offset-[var(--offers-card-tint)]"
              : "border border-[var(--offers-accent-border-strong)] text-[var(--offers-page-fg-strong)] hover:bg-[var(--offers-accent-strong)] hover:text-white focus-visible:ring-offset-white",
          )}
          style={
            plan.isHighlighted && hasCustomHighlightColors
              ? customHighlightInverseStyle
              : undefined
          }
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>
    </article>
  );
}
