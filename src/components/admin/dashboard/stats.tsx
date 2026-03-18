"use client";

import { Users, MessageSquare, TrendingUp, Calendar } from "lucide-react";

interface StatsProps {
  registrationCount: number;
  messageCount: number;
  recentRegistrations: number;
  activeEvents?: number;
}

const stats = (props: StatsProps) => [
  {
    label: "Total Registrations",
    value: props.registrationCount,
    icon: Users,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    label: "Contact Messages",
    value: props.messageCount,
    icon: MessageSquare,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    label: "This Week",
    value: props.recentRegistrations,
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  {
    label: "Active Events",
    value: props.activeEvents ?? 0,
    icon: Calendar,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
];

export function DashboardStats(props: StatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats(props).map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-[#222] bg-[#111] p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-[#666] uppercase tracking-wider">
              {stat.label}
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg border ${stat.bg}`}
            >
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
