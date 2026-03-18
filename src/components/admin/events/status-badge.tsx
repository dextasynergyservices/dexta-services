import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  DRAFT: { label: "Draft", className: "bg-[#1a1a1a] text-[#888]" },
  PUBLISHED: {
    label: "Published",
    className: "bg-emerald-500/10 text-emerald-400",
  },
  CLOSED: { label: "Closed", className: "bg-red-500/10 text-red-400" },
} as const;

export function EventStatusBadge({
  status,
}: {
  status: keyof typeof statusConfig;
}) {
  const config = statusConfig[status];
  return (
    <Badge variant="secondary" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
