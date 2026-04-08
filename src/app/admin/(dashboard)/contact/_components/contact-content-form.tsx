"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, Loader2, MapPin, MessageSquareText, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  contactPageContentSchema,
  type ContactPageContentInput,
} from "@/lib/validators";
import { stringifyLineList } from "@/lib/contact-defaults";
import type { ContactPageContentRow } from "../actions";
import { updateContactPageContent } from "../actions";

type SectionCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

function SectionCard({ title, description, icon, children }: SectionCardProps) {
  return (
    <div className="rounded-xl border border-[#222] bg-[#111] p-6">
      <div className="mb-5 flex items-start gap-3">
        {icon ? (
          <div className="rounded-lg bg-white/5 p-2 text-cyan-400">{icon}</div>
        ) : null}
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-[#555]">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

function fieldClassName() {
  return "border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20";
}

export function ContactContentForm({
  content,
}: {
  content: ContactPageContentRow;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ContactPageContentInput>({
    resolver: zodResolver(contactPageContentSchema),
    defaultValues: {
      homeEyebrow: content.homeEyebrow,
      homeTitle: content.homeTitle,
      homeBody: content.homeBody,
      homeCtaText: content.homeCtaText,
      homeCtaHref: content.homeCtaHref,
      heroEyebrow: content.heroEyebrow,
      heroTitle: content.heroTitle,
      heroBody: content.heroBody,
      infoEyebrow: content.infoEyebrow,
      infoTitle: content.infoTitle,
      infoBody: content.infoBody,
      formEyebrow: content.formEyebrow,
      formTitle: content.formTitle,
      formBody: content.formBody,
      addressLabel: content.addressLabel,
      address: content.address,
      emailLabel: content.emailLabel,
      emailsText: stringifyLineList(content.emails),
      phoneLabel: content.phoneLabel,
      phonesText: stringifyLineList(content.phones),
      socialsLabel: content.socialsLabel,
    },
  });

  useEffect(() => {
    reset({
      homeEyebrow: content.homeEyebrow,
      homeTitle: content.homeTitle,
      homeBody: content.homeBody,
      homeCtaText: content.homeCtaText,
      homeCtaHref: content.homeCtaHref,
      heroEyebrow: content.heroEyebrow,
      heroTitle: content.heroTitle,
      heroBody: content.heroBody,
      infoEyebrow: content.infoEyebrow,
      infoTitle: content.infoTitle,
      infoBody: content.infoBody,
      formEyebrow: content.formEyebrow,
      formTitle: content.formTitle,
      formBody: content.formBody,
      addressLabel: content.addressLabel,
      address: content.address,
      emailLabel: content.emailLabel,
      emailsText: stringifyLineList(content.emails),
      phoneLabel: content.phoneLabel,
      phonesText: stringifyLineList(content.phones),
      socialsLabel: content.socialsLabel,
    });
  }, [content, reset]);

  const onSubmit = async (data: ContactPageContentInput) => {
    const result = await updateContactPageContent(data);

    if (result.success) {
      reset(data);
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <SectionCard
        title="Home Contact Block"
        description="Controls the contact section shown on the home page."
        icon={<Home className="h-5 w-5" />}
      >
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Eyebrow</Label>
          <Input className={fieldClassName()} {...register("homeEyebrow")} />
          <FieldError message={errors.homeEyebrow?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Input className={fieldClassName()} {...register("homeTitle")} />
          <FieldError message={errors.homeTitle?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={4}
            className={`resize-none ${fieldClassName()}`}
            {...register("homeBody")}
          />
          <FieldError message={errors.homeBody?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">CTA text</Label>
            <Input className={fieldClassName()} {...register("homeCtaText")} />
            <FieldError message={errors.homeCtaText?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">CTA href</Label>
            <Input className={fieldClassName()} {...register("homeCtaHref")} />
            <FieldError message={errors.homeCtaHref?.message} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Contact Page Hero"
        description="Controls the heading and intro copy at the top of /contact."
        icon={<MessageSquareText className="h-5 w-5" />}
      >
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Eyebrow</Label>
          <Input className={fieldClassName()} {...register("heroEyebrow")} />
          <FieldError message={errors.heroEyebrow?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Input className={fieldClassName()} {...register("heroTitle")} />
          <FieldError message={errors.heroTitle?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={4}
            className={`resize-none ${fieldClassName()}`}
            {...register("heroBody")}
          />
          <FieldError message={errors.heroBody?.message} />
        </div>
      </SectionCard>

      <SectionCard
        title="Contact Details"
        description="These address, email, phone, and social labels are reused across the public site."
        icon={<MapPin className="h-5 w-5" />}
      >
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Info eyebrow</Label>
          <Input className={fieldClassName()} {...register("infoEyebrow")} />
          <FieldError message={errors.infoEyebrow?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Info title</Label>
          <Input className={fieldClassName()} {...register("infoTitle")} />
          <FieldError message={errors.infoTitle?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Info body</Label>
          <Textarea
            rows={3}
            className={`resize-none ${fieldClassName()}`}
            {...register("infoBody")}
          />
          <FieldError message={errors.infoBody?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Address label
            </Label>
            <Input className={fieldClassName()} {...register("addressLabel")} />
            <FieldError message={errors.addressLabel?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Email label
            </Label>
            <Input className={fieldClassName()} {...register("emailLabel")} />
            <FieldError message={errors.emailLabel?.message} />
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Address</Label>
          <Textarea
            rows={3}
            className={`resize-none ${fieldClassName()}`}
            {...register("address")}
          />
          <FieldError message={errors.address?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">
            Emails
          </Label>
          <Textarea
            rows={4}
            placeholder="One email per line"
            className={`resize-none ${fieldClassName()}`}
            {...register("emailsText")}
          />
          <FieldError message={errors.emailsText?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Phone label
            </Label>
            <Input className={fieldClassName()} {...register("phoneLabel")} />
            <FieldError message={errors.phoneLabel?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Socials label
            </Label>
            <Input className={fieldClassName()} {...register("socialsLabel")} />
            <FieldError message={errors.socialsLabel?.message} />
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Phones</Label>
          <Textarea
            rows={4}
            placeholder="One phone number per line"
            className={`resize-none ${fieldClassName()}`}
            {...register("phonesText")}
          />
          <FieldError message={errors.phonesText?.message} />
        </div>
      </SectionCard>

      <SectionCard
        title="Contact Form Copy"
        description="Controls the form-side heading and helper text on the contact page."
        icon={<Phone className="h-5 w-5" />}
      >
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">
            Form eyebrow
          </Label>
          <Input className={fieldClassName()} {...register("formEyebrow")} />
          <FieldError message={errors.formEyebrow?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Form title</Label>
          <Input className={fieldClassName()} {...register("formTitle")} />
          <FieldError message={errors.formTitle?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Form body</Label>
          <Textarea
            rows={3}
            className={`resize-none ${fieldClassName()}`}
            {...register("formBody")}
          />
          <FieldError message={errors.formBody?.message} />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Contact Content"
          )}
        </Button>
      </div>
    </form>
  );
}
