"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { composeEmailSchema, type ComposeEmailData } from "@/lib/validators";
import { sendBulkEmail } from "@/app/admin/(dashboard)/messaging/actions";
import { PreviewDialog } from "./preview-dialog";
import { SendConfirmation } from "./send-confirmation";

interface ComposeFormProps {
  totalRecipients: number;
  events: { id: string; title: string }[];
}

export function ComposeForm({ totalRecipients, events }: ComposeFormProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComposeEmailData>({
    resolver: zodResolver(composeEmailSchema),
    defaultValues: {
      subject: "",
      body: "",
      recipientFilter: "all",
      roleFilter: "",
      eventFilter: "",
      statusFilter: "",
    },
  });

  const recipientFilter = watch("recipientFilter");
  const subject = watch("subject");
  const body = watch("body");

  const recipientCount =
    recipientFilter === "all" ? totalRecipients : totalRecipients;

  const onConfirmedSend = async () => {
    setShowConfirm(false);
    await handleSubmit(async (data) => {
      const result = await sendBulkEmail(data);
      if (result.success) {
        toast.success(result.message);
        reset();
      } else {
        toast.error(result.message);
      }
    })();
  };

  return (
    <>
      <div className="max-w-2xl rounded-xl border border-[#222] bg-[#111] p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowConfirm(true);
          }}
          className="space-y-5"
          noValidate
        >
          {/* Recipients */}
          <div>
            <Label className="mb-1.5 text-xs text-[#888]">Recipients</Label>
            <Select
              value={recipientFilter}
              onValueChange={(v) =>
                setValue("recipientFilter", v as "all" | "filtered")
              }
            >
              <SelectTrigger className="border-[#2a2a2a] bg-[#0d0d0d] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-[#2a2a2a] bg-[#111]">
                <SelectItem value="all" className="text-white">
                  All registrants ({totalRecipients})
                </SelectItem>
                <SelectItem value="filtered" className="text-white">
                  Filter by event / status
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recipientFilter === "filtered" && (
            <div className="space-y-4">
              {/* Event filter */}
              <div>
                <Label className="mb-1.5 text-xs text-[#888]">Event</Label>
                <Select
                  value={watch("eventFilter") || "all"}
                  onValueChange={(v) =>
                    setValue("eventFilter", v === "all" ? "" : v)
                  }
                >
                  <SelectTrigger className="border-[#2a2a2a] bg-[#0d0d0d] text-white">
                    <SelectValue placeholder="All events" />
                  </SelectTrigger>
                  <SelectContent className="border-[#2a2a2a] bg-[#111]">
                    <SelectItem value="all" className="text-white">
                      All events
                    </SelectItem>
                    {events.map((e) => (
                      <SelectItem
                        key={e.id}
                        value={e.id}
                        className="text-white"
                      >
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status filter */}
              <div>
                <Label className="mb-1.5 text-xs text-[#888]">
                  Registration Status
                </Label>
                <Select
                  value={watch("statusFilter") || "all"}
                  onValueChange={(v) =>
                    setValue("statusFilter", v === "all" ? "" : v)
                  }
                >
                  <SelectTrigger className="border-[#2a2a2a] bg-[#0d0d0d] text-white">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="border-[#2a2a2a] bg-[#111]">
                    <SelectItem value="all" className="text-white">
                      All statuses
                    </SelectItem>
                    <SelectItem value="PENDING" className="text-white">
                      Pending
                    </SelectItem>
                    <SelectItem value="ACCEPTED" className="text-white">
                      Accepted
                    </SelectItem>
                    <SelectItem value="DECLINED" className="text-white">
                      Declined
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <Label htmlFor="subject" className="mb-1.5 text-xs text-[#888]">
              Subject
            </Label>
            <Input
              id="subject"
              placeholder="Email subject..."
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("subject")}
            />
            {errors.subject && (
              <p className="mt-1 text-xs text-red-400">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Body */}
          <div>
            <Label htmlFor="body" className="mb-1.5 text-xs text-[#888]">
              Message
            </Label>
            <Textarea
              id="body"
              rows={8}
              placeholder="Write your message here..."
              className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("body")}
            />
            {errors.body && (
              <p className="mt-1 text-xs text-red-400">{errors.body.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={!subject && !body}
              className="border-[#2a2a2a] bg-[#0d0d0d] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-500 text-black hover:bg-cyan-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to {recipientCount} registrants
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <PreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        subject={subject}
        body={body}
      />

      <SendConfirmation
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onConfirmedSend}
        recipientCount={recipientCount}
        subject={subject}
      />
    </>
  );
}
