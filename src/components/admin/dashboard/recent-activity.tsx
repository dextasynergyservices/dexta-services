import { Users, MessageSquare } from "lucide-react";

interface Registration {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

interface RecentActivityProps {
  recentRegistrations: Registration[];
  recentMessages: Message[];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function RecentActivity({
  recentRegistrations,
  recentMessages,
}: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Recent Registrations */}
      <div className="rounded-xl border border-[#222] bg-[#111]">
        <div className="flex items-center gap-2 border-b border-[#222] px-5 py-4">
          <Users className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">
            Recent Registrations
          </h2>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {recentRegistrations.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[#666]">
              No registrations yet
            </p>
          ) : (
            recentRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{reg.name}</p>
                  <p className="text-xs text-[#666]">{reg.role}</p>
                </div>
                <span className="text-xs text-[#555]">
                  {formatDate(reg.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="rounded-xl border border-[#222] bg-[#111]">
        <div className="flex items-center gap-2 border-b border-[#222] px-5 py-4">
          <MessageSquare className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white">Recent Messages</h2>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {recentMessages.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[#666]">
              No messages yet
            </p>
          ) : (
            recentMessages.map((msg) => (
              <div key={msg.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{msg.name}</p>
                  <span className="text-xs text-[#555]">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-[#666]">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
