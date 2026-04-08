"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContactAdminData } from "../actions";
import { ContactContentForm } from "./contact-content-form";
import { ContactMessagesManager } from "./contact-messages-manager";
import { ContactSocialsManager } from "./contact-socials-manager";

export type ContactSectionKey = "content" | "socials" | "messages";

const SECTION_OPTIONS: Array<{
  value: ContactSectionKey;
  label: string;
  description: string;
}> = [
  {
    value: "content",
    label: "Page Content",
    description:
      "Shared contact copy, address, emails, phones, and labels across the website.",
  },
  {
    value: "socials",
    label: "Social Links",
    description:
      "Create, edit, remove, and reorder social platforms shown everywhere on the site.",
  },
  {
    value: "messages",
    label: "Messages Inbox",
    description:
      "Review contact form submissions, open full details, and delete messages after reading.",
  },
];

export function ContactManager({
  data,
  initialSection,
}: {
  data: ContactAdminData;
  initialSection: ContactSectionKey;
}) {
  const router = useRouter();
  const [section, setSection] = useState<ContactSectionKey>(initialSection);
  const [messageCounts, setMessageCounts] = useState(() => ({
    unreadCount: data.messages.unreadCount,
    totalCount: data.messages.totalCount,
  }));

  const unreadCount = messageCounts.unreadCount;

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    setMessageCounts({
      unreadCount: data.messages.unreadCount,
      totalCount: data.messages.totalCount,
    });
  }, [data.messages.totalCount, data.messages.unreadCount]);

  const handleMessageCountsChange = useCallback(
    (nextCounts: { unreadCount: number; totalCount: number }) => {
      setMessageCounts((currentCounts) =>
        currentCounts.unreadCount === nextCounts.unreadCount &&
        currentCounts.totalCount === nextCounts.totalCount
          ? currentCounts
          : nextCounts,
      );
    },
    [],
  );

  const navigateToSection = (next: ContactSectionKey) => {
    setSection(next);
    router.replace(`/admin/contact?section=${next}`, {
      scroll: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#222] bg-[#111] p-4 sm:p-5">
        <div className="w-full max-w-sm">
          <Label className="mb-2 block text-xs text-[#888]">Section</Label>
          <Select
            value={section}
            onValueChange={(value) => {
              const next = value as ContactSectionKey;
              navigateToSection(next);
            }}
          >
            <SelectTrigger className="w-full border-[#2a2a2a] bg-[#0d0d0d] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[#222] bg-[#111] text-white">
              {SECTION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value === "messages" && unreadCount
                    ? `${option.label} (${unreadCount})`
                    : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {section === "content" ? (
        <ContactContentForm content={data.content} />
      ) : null}
      {section === "socials" ? (
        <ContactSocialsManager items={data.socialLinks} />
      ) : null}
      {section === "messages" ? (
        <ContactMessagesManager
          messages={data.messages}
          onMessageCountsChange={handleMessageCountsChange}
        />
      ) : null}
    </div>
  );
}
