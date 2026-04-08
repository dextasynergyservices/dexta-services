"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/events/image-upload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import {
  aboutTeamMemberSchema,
  type AboutTeamMemberInput,
} from "@/lib/validators";
import {
  createAboutTeamMember,
  deleteAboutTeamMember,
  reorderAboutTeamMembers,
  updateAboutTeamMember,
  type AboutTeamMemberRow,
} from "../actions";
import {
  CardActionButton,
  FormError,
  SectionShell,
  VisibilityPill,
} from "./about-manager-ui";

type TeamMemberFormValues = z.input<typeof aboutTeamMemberSchema>;

function TeamMemberForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: AboutTeamMemberRow;
  onSubmit: (data: AboutTeamMemberInput) => Promise<void>;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberFormValues, unknown, AboutTeamMemberInput>({
    resolver: zodResolver(aboutTeamMemberSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      role: initialData?.role ?? "",
      bio: initialData?.bio ?? "",
      expertise: JSON.stringify(initialData?.expertise ?? [""]),
      funFact: initialData?.funFact ?? "",
      portfolioUrl: initialData?.portfolioUrl ?? "",
      showPortfolioButton: initialData?.showPortfolioButton ?? true,
      imagePublicId: initialData?.imagePublicId ?? null,
      isVisible: initialData?.isVisible ?? true,
      position: initialData?.position ?? 0,
    },
  });
  const [expertiseText, setExpertiseText] = useState(
    (initialData?.expertise ?? []).join("\n"),
  );

  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      role: initialData?.role ?? "",
      bio: initialData?.bio ?? "",
      expertise: JSON.stringify(initialData?.expertise ?? [""]),
      funFact: initialData?.funFact ?? "",
      portfolioUrl: initialData?.portfolioUrl ?? "",
      showPortfolioButton: initialData?.showPortfolioButton ?? true,
      imagePublicId: initialData?.imagePublicId ?? null,
      isVisible: initialData?.isVisible ?? true,
      position: initialData?.position ?? 0,
    });
    setExpertiseText((initialData?.expertise ?? []).join("\n"));
  }, [initialData, reset]);

  const syncExpertise = (value: string) => {
    setExpertiseText(value);
    const normalized = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    setValue("expertise", JSON.stringify(normalized), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(async (data) => onSubmit(data))}
      className="max-h-[78vh] space-y-4 overflow-y-auto pr-1"
    >
      <input type="hidden" {...register("expertise")} />
      <input type="hidden" {...register("position", { valueAsNumber: true })} />

      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Professional image</Label>
        <ImageUpload
          value={watch("imagePublicId") ?? undefined}
          onChange={(value) =>
            setValue("imagePublicId", value, { shouldDirty: true, shouldValidate: true })
          }
          onRemove={() =>
            setValue("imagePublicId", null, { shouldDirty: true, shouldValidate: true })
          }
          emptyLabel="Upload team member photo"
          previewAlt={watch("name") || "Team member"}
        />
        <p className="mt-2 text-xs text-[#555]">
          Use a clean professional portrait. New team members should include a
          proper profile image.
        </p>
        <FormError message={errors.imagePublicId?.message} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Name</Label>
          <Input className="border-[#2a2a2a] bg-[#0d0d0d] text-white" {...register("name")} />
          <FormError message={errors.name?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Role</Label>
          <Input className="border-[#2a2a2a] bg-[#0d0d0d] text-white" {...register("role")} />
          <FormError message={errors.role?.message} />
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Bio</Label>
        <Textarea
          rows={5}
          className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
          {...register("bio")}
        />
        <FormError message={errors.bio?.message} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Portfolio link</Label>
          <Input
            placeholder="https://portfolio.example.com"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("portfolioUrl")}
          />
          <FormError message={errors.portfolioUrl?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Professional note</Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("funFact")}
          />
          <FormError message={errors.funFact?.message} />
        </div>
      </div>

      <label className="flex items-center justify-between rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Show portfolio button</p>
          <p className="text-xs text-[#666]">
            Keep the profile link saved, but decide whether the public card should show the CTA.
          </p>
        </div>
        <Switch
          checked={watch("showPortfolioButton")}
          onCheckedChange={(checked) =>
            setValue("showPortfolioButton", checked, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </label>

      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Expertise tags</Label>
        <Textarea
          rows={4}
          value={expertiseText}
          onChange={(event) => syncExpertise(event.target.value)}
          className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
          placeholder={"Brand Systems\nCreative Direction\nFrontend Systems"}
        />
        <p className="mt-1 text-xs text-[#555]">One expertise item per line.</p>
        <FormError message={errors.expertise?.message} />
      </div>

      <label className="flex items-center justify-between rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Visible on page</p>
          <p className="text-xs text-[#666]">Hide this profile without deleting it.</p>
        </div>
        <Switch
          checked={watch("isVisible")}
          onCheckedChange={(checked) =>
            setValue("isVisible", checked, { shouldDirty: true, shouldValidate: true })
          }
        />
      </label>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-[#2a2a2a] bg-transparent text-[#aaa] hover:bg-[#1a1a1a] hover:text-white"
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-cyan-500 text-[#03131d] hover:bg-cyan-400">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Team Member"}
        </Button>
      </div>
    </form>
  );
}

function TeamAvatar({ member }: { member: AboutTeamMemberRow }) {
  if (member.imagePublicId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={getCloudinaryUrl(member.imagePublicId, {
          w: 240,
          h: 240,
          c: "fill",
          g: "face",
        })}
        alt={member.name}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <span>
      {member.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}

export function TeamManager({ items }: { items: AboutTeamMemberRow[] }) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AboutTeamMemberRow | null>(null);
  const [deletingItem, setDeletingItem] = useState<AboutTeamMemberRow | null>(null);
  const [movingKey, setMovingKey] = useState<string | null>(null);

  const handleCreate = async (data: AboutTeamMemberInput) => {
    const result = await createAboutTeamMember(data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setIsCreateOpen(false);
    router.refresh();
  };

  const handleUpdate = async (data: AboutTeamMemberInput) => {
    if (!editingItem) return;
    const result = await updateAboutTeamMember(editingItem.id, data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setEditingItem(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    const result = await deleteAboutTeamMember(deletingItem.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setDeletingItem(null);
    router.refresh();
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    setMovingKey(`${id}:${direction}`);
    const result = await reorderAboutTeamMembers(id, direction);
    setMovingKey(null);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.refresh();
  };

  return (
    <>
      <SectionShell
        title="Team Members"
        description="Manage professional staff profiles, portfolio links, image uploads, and whether each profile should show a public portfolio button."
        action={
          <Button
            className="bg-cyan-500 text-[#03131d] hover:bg-cyan-400"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item, index) => (
            <article key={item.id} className="rounded-2xl border border-[#222] bg-[#111] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--dexta-secondary)] to-[var(--dexta-primary)] text-lg font-semibold text-white">
                  <TeamAvatar member={item} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <p className="mt-1 text-sm text-cyan-400">{item.role}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <VisibilityPill visible={item.isVisible} />
                      <span
                        className={
                          item.showPortfolioButton
                            ? "inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400"
                            : "inline-flex items-center gap-1 rounded-full bg-neutral-500/10 px-3 py-1 text-xs font-medium text-neutral-400"
                        }
                      >
                        {item.showPortfolioButton ? "Portfolio button on" : "Portfolio button hidden"}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#9d9d9d]">{item.bio}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.expertise.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-1 text-xs text-[#d0d0d0]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[#555]">Professional note</p>
                <p className="mt-1 text-sm text-white">{item.funFact}</p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <a
                  href={item.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                >
                  Open saved portfolio
                </a>
                <div className="flex items-center gap-2">
                  <CardActionButton
                    onClick={() => handleMove(item.id, "up")}
                    label="Move team member up"
                    disabled={index === 0 || movingKey === `${item.id}:up`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </CardActionButton>
                  <CardActionButton
                    onClick={() => handleMove(item.id, "down")}
                    label="Move team member down"
                    disabled={index === items.length - 1 || movingKey === `${item.id}:down`}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </CardActionButton>
                  <CardActionButton onClick={() => setEditingItem(item)} label="Edit team member">
                    <Pencil className="h-4 w-4" />
                  </CardActionButton>
                  <CardActionButton onClick={() => setDeletingItem(item)} label="Delete team member">
                    <Trash2 className="h-4 w-4" />
                  </CardActionButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-[#222] bg-[#111] text-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <TeamMemberForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="border-[#222] bg-[#111] text-white sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          <TeamMemberForm
            initialData={editingItem ?? undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditingItem(null)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent className="border-[#222] bg-[#111]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete team member?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">
              This removes the profile from the About page team section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2a2a2a] bg-transparent text-[#aaa] hover:bg-[#1a1a1a] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 text-white hover:bg-red-400" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
