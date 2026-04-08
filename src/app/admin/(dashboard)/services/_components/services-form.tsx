"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Brush,
  Code,
  ImageIcon,
  Loader2,
  Printer,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/events/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hexToRgba, normalizeHexColor } from "@/lib/color-utils";
import {
  getProjectSectionDefaultCardColor,
  resolveProjectSectionCardColor,
} from "@/lib/project-section";
import {
  projectSectionBackgroundSchema,
  serviceContentSchema,
  type ProjectSectionBackgroundInput,
  type ServiceContentInput,
} from "@/lib/validators";
import type { ServiceContentRow, ServiceType } from "../actions";
import {
  updateProjectSectionBackgroundImage,
  updateServiceContent,
} from "../actions";

const SERVICE_CONFIG: Record<
  ServiceType,
  { icon: LucideIcon; accent: string; border: string }
> = {
  DESIGN: {
    icon: Brush,
    accent: "text-purple-400",
    border: "border-purple-500/20",
  },
  BUILD: {
    icon: Code,
    accent: "text-cyan-400",
    border: "border-cyan-500/20",
  },
  PRINT: {
    icon: Printer,
    accent: "text-pink-400",
    border: "border-pink-500/20",
  },
};

interface ProjectSectionBackgroundFormProps {
  backgroundImagePublicId: string | null;
}

function ProjectSectionBackgroundForm({
  backgroundImagePublicId,
}: ProjectSectionBackgroundFormProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<ProjectSectionBackgroundInput>({
    resolver: zodResolver(projectSectionBackgroundSchema),
    defaultValues: {
      backgroundImagePublicId,
    },
  });

  const currentBackgroundImagePublicId =
    watch("backgroundImagePublicId") ?? null;

  const onSubmit = async (data: ProjectSectionBackgroundInput) => {
    const result = await updateProjectSectionBackgroundImage(data);

    if (result.success) {
      reset({
        backgroundImagePublicId: data.backgroundImagePublicId ?? null,
      });
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  };

  return (
    <div className="rounded-xl border border-[#222] bg-[#111] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg bg-white/5 p-2 text-[#8ab4ff]">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Section Background</h3>
          <p className="text-xs text-[#555]">
            This image sits behind the whole project section with a Dexta blue
            overlay above it.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ImageUpload
          value={currentBackgroundImagePublicId ?? undefined}
          onChange={(publicId) =>
            setValue("backgroundImagePublicId", publicId, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          onRemove={() =>
            setValue("backgroundImagePublicId", null, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          emptyLabel="Upload section background image"
          previewAlt="Project section background"
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="bg-[#000c99] text-white hover:bg-[#081472] disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Background"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface ServiceCardFormProps {
  service: ServiceContentRow;
}

function ServiceCardForm({ service }: ServiceCardFormProps) {
  const config = SERVICE_CONFIG[service.type];
  const Icon = config.icon;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ServiceContentInput>({
    resolver: zodResolver(serviceContentSchema),
    defaultValues: {
      title: service.title,
      description: service.description,
      iconPublicId: service.iconPublicId,
      cardColor: resolveProjectSectionCardColor(
        service.type,
        service.cardColor,
      ),
    },
  });

  const descriptionValue = watch("description") ?? "";
  const currentIconPublicId = watch("iconPublicId") ?? null;
  const currentCardColor = resolveProjectSectionCardColor(
    service.type,
    watch("cardColor"),
  );

  const onSubmit = async (data: ServiceContentInput) => {
    const result = await updateServiceContent(service.type, {
      ...data,
      cardColor: normalizeHexColor(
        data.cardColor,
        getProjectSectionDefaultCardColor(service.type),
      ),
    });

    if (result.success) {
      reset({
        ...data,
        iconPublicId: data.iconPublicId ?? null,
        cardColor: normalizeHexColor(
          data.cardColor,
          getProjectSectionDefaultCardColor(service.type),
        ),
      });
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className={`rounded-xl border ${config.border} bg-[#111] p-6`}>
      <div className="mb-5 flex items-center gap-3">
        <div
          className={`rounded-lg bg-white/5 p-2 ${config.accent}`}
          style={{
            color: currentCardColor,
            boxShadow: `0 0 0 1px ${hexToRgba(currentCardColor, 0.18)} inset`,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className={`text-sm font-bold ${config.accent}`}>
            {service.type}
          </h3>
          <p className="text-xs text-[#555]">Project card settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label
            htmlFor={`title-${service.type}`}
            className="mb-1.5 block text-xs text-[#888]"
          >
            Card title
          </Label>
          <Input
            id={`title-${service.type}`}
            placeholder="e.g. DESIGN"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor={`description-${service.type}`}
            className="mb-1.5 block text-xs text-[#888]"
          >
            Card description
          </Label>
          <Textarea
            id={`description-${service.type}`}
            rows={3}
            placeholder="Describe what this project lane delivers…"
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("description")}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.description ? (
              <p className="text-xs text-red-400">
                {errors.description.message}
              </p>
            ) : (
              <span />
            )}
            <p className="text-xs text-[#555]">
              {descriptionValue.length} / 1000
            </p>
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Card icon</Label>
          <ImageUpload
            value={currentIconPublicId ?? undefined}
            onChange={(publicId) =>
              setValue("iconPublicId", publicId, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            onRemove={() =>
              setValue("iconPublicId", null, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            emptyLabel="Upload project icon"
            previewAlt={`${service.type} icon`}
          />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Card color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={currentCardColor}
              onChange={(event) =>
                setValue("cardColor", event.target.value.toLowerCase(), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="h-12 w-14 cursor-pointer rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-1"
              aria-label={`${service.type} card color`}
            />
            <Input
              placeholder="#c084fc"
              className="border-[#2a2a2a] bg-[#0d0d0d] font-mono uppercase text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("cardColor")}
            />
          </div>
          {errors.cardColor && (
            <p className="mt-1 text-xs text-red-400">
              {errors.cardColor.message}
            </p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs text-[#888]">Preview swatches</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <div
                className="h-14 rounded-xl border"
                style={{
                  backgroundColor: currentCardColor,
                  borderColor: hexToRgba(currentCardColor, 0.32),
                }}
              />
              <p className="text-[11px] text-[#666]">Primary</p>
            </div>
            <div className="space-y-2">
              <div
                className="h-14 rounded-xl border"
                style={{
                  backgroundColor: hexToRgba(currentCardColor, 0.18),
                  borderColor: hexToRgba(currentCardColor, 0.3),
                }}
              />
              <p className="text-[11px] text-[#666]">Soft tint</p>
            </div>
            <div className="space-y-2">
              <div className="flex h-14 items-center justify-center rounded-xl border border-[#1f1f1f] bg-[#090909]">
                <span
                  className="h-7 w-7 rounded-full"
                  style={{
                    backgroundColor: currentCardColor,
                    boxShadow: `0 0 0 1px ${hexToRgba(currentCardColor, 0.26)} inset`,
                  }}
                />
              </div>
              <p className="text-[11px] text-[#666]">Glow</p>
            </div>
          </div>
        </div>

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
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface ServicesFormProps {
  services: ServiceContentRow[];
  sectionBackgroundImagePublicId: string | null;
}

export function ServicesForm({
  services,
  sectionBackgroundImagePublicId,
}: ServicesFormProps) {
  return (
    <div className="space-y-5">
      <ProjectSectionBackgroundForm
        backgroundImagePublicId={sectionBackgroundImagePublicId}
      />
      {services.map((service) => (
        <ServiceCardForm key={service.type} service={service} />
      ))}
    </div>
  );
}
