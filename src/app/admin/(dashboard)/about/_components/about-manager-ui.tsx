"use client";

export const ABOUT_ICON_OPTIONS = [
  { value: "TARGET", label: "Target" },
  { value: "LIGHTBULB", label: "Lightbulb" },
  { value: "GLOBE", label: "Globe" },
  { value: "TRENDING_UP", label: "Trending Up" },
  { value: "SPARKLES", label: "Sparkles" },
  { value: "ZAP", label: "Zap" },
  { value: "HEART_HANDSHAKE", label: "Handshake" },
  { value: "SHIELD", label: "Shield" },
] as const;

export function SectionShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#222] bg-[#111] p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-[#666]">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function CardActionButton({
  onClick,
  children,
  label,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-2 text-[#888] transition hover:border-cyan-500/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function VisibilityPill({ visible }: { visible: boolean }) {
  return visible ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
      Visible
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-500/10 px-3 py-1 text-xs font-medium text-neutral-400">
      Hidden
    </span>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}
