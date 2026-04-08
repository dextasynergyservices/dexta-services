"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  contactSocialLinkSchema,
  type ContactSocialLinkInput,
} from "@/lib/validators";
import {
  CONTACT_SOCIAL_PLATFORM_META,
  CONTACT_SOCIAL_PLATFORM_OPTIONS,
} from "@/lib/contact-socials";
import {
  createContactSocialLink,
  deleteContactSocialLink,
  moveContactSocialLink,
  updateContactSocialLink,
  type ContactSocialLinkRow,
} from "../actions";

function fieldClassName() {
  return "border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20";
}

function SocialLinkForm({
  initialValues,
  mode,
  onCancel,
  onSubmit,
}: {
  initialValues?: ContactSocialLinkInput;
  mode: "create" | "edit";
  onCancel: () => void;
  onSubmit: (data: ContactSocialLinkInput) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactSocialLinkInput>({
    resolver: zodResolver(contactSocialLinkSchema),
    defaultValues: initialValues ?? {
      platform: "LINKEDIN",
      label: CONTACT_SOCIAL_PLATFORM_META.LINKEDIN.label,
      href: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label
          htmlFor="social-platform"
          className="mb-1.5 block text-xs text-[#888]"
        >
          Platform
        </Label>
        <select
          id="social-platform"
          className="h-10 w-full rounded-md border border-[#2a2a2a] bg-[#0d0d0d] px-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
          {...register("platform")}
        >
          {CONTACT_SOCIAL_PLATFORM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.platform ? (
          <p className="mt-1 text-xs text-red-400">{errors.platform.message}</p>
        ) : null}
      </div>

      <div>
        <Label
          htmlFor="social-label"
          className="mb-1.5 block text-xs text-[#888]"
        >
          Label
        </Label>
        <Input
          id="social-label"
          className={fieldClassName()}
          placeholder="What visitors will see"
          {...register("label")}
        />
        {errors.label ? (
          <p className="mt-1 text-xs text-red-400">{errors.label.message}</p>
        ) : null}
      </div>

      <div>
        <Label
          htmlFor="social-href"
          className="mb-1.5 block text-xs text-[#888]"
        >
          Link
        </Label>
        <Input
          id="social-href"
          className={fieldClassName()}
          placeholder="https://..."
          {...register("href")}
        />
        {errors.href ? (
          <p className="mt-1 text-xs text-red-400">{errors.href.message}</p>
        ) : null}
      </div>

      <div className="rounded-xl border border-[#222] bg-[#0d0d0d] p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-400">
          Uniform Icons
        </p>
        <p className="mt-2 text-sm leading-6 text-[#8d8d8d]">
          The platform you choose controls the icon everywhere on the site. If a
          platform is not created here, that icon will not show publicly.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-[#2a2a2a] bg-transparent text-white hover:bg-[#1a1a1a]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-cyan-500 text-black hover:bg-cyan-400"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : mode === "create" ? (
            "Add Social Link"
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}

export function ContactSocialsManager({
  items,
}: {
  items: ContactSocialLinkRow[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContactSocialLinkRow | null>(
    null,
  );
  const [deletingItem, setDeletingItem] = useState<ContactSocialLinkRow | null>(
    null,
  );
  const [movingKey, setMovingKey] = useState<string | null>(null);

  const existingPlatforms = useMemo(
    () => new Set(items.map((item) => item.platform)),
    [items],
  );

  const remainingPlatforms = CONTACT_SOCIAL_PLATFORM_OPTIONS.filter(
    (option) => !existingPlatforms.has(option.value),
  );

  const handleCreate = async (data: ContactSocialLinkInput) => {
    const result = await createContactSocialLink(data);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setCreateOpen(false);
    router.refresh();
  };

  const handleUpdate = async (data: ContactSocialLinkInput) => {
    if (!editingItem) return;

    const result = await updateContactSocialLink(editingItem.id, data);

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

    const result = await deleteContactSocialLink(deletingItem.id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setDeletingItem(null);
    router.refresh();
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    setMovingKey(`${id}-${direction}`);
    const result = await moveContactSocialLink(id, direction);
    setMovingKey(null);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">
              Social Platforms
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              Only created socials will render on the website
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8d8d8d]">
              This keeps the icon set clean. No row here means no icon on the
              home page, contact page, or footer.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={!remainingPlatforms.length}
            className="bg-cyan-500 text-black hover:bg-cyan-400"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Social Link
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#222] bg-[#0d0d0d] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
              Active socials
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {items.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#222] bg-[#0d0d0d] p-4 sm:col-span-2 xl:col-span-3">
            <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
              Remaining platforms
            </p>
            <p className="mt-2 text-sm leading-6 text-[#8d8d8d]">
              {remainingPlatforms.length
                ? remainingPlatforms.map((option) => option.label).join(", ")
                : "All supported social platforms have already been added."}
            </p>
          </div>
        </div>
      </div>

      {items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item, index) => {
            const meta = CONTACT_SOCIAL_PLATFORM_META[item.platform];
            const Icon = meta.icon;

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[#222] bg-[#111] p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                          {meta.label}
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-white">
                          {item.label}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          disabled={
                            index === 0 || movingKey === `${item.id}-up`
                          }
                          onClick={() => moveItem(item.id, "up")}
                          className="border-[#2a2a2a] bg-transparent text-white hover:bg-[#1a1a1a]"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          disabled={
                            index === items.length - 1 ||
                            movingKey === `${item.id}-down`
                          }
                          onClick={() => moveItem(item.id, "down")}
                          className="border-[#2a2a2a] bg-transparent text-white hover:bg-[#1a1a1a]"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      <span className="truncate">{item.href}</span>
                      <ExternalLink className="h-4 w-4 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                    className="border-[#2a2a2a] bg-transparent text-white hover:bg-[#1a1a1a]"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingItem(item)}
                    className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#111] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Globe className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">
            No socials are live yet
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#8d8d8d]">
            Add only the platforms you want to show. The public site will stay
            empty until you create them here, so unused icons will never appear.
          </p>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-[#222] bg-[#111] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Social Link</DialogTitle>
            <DialogDescription className="text-[#8d8d8d]">
              Create a shared social handle that will appear everywhere on the
              public site.
            </DialogDescription>
          </DialogHeader>
          <SocialLinkForm
            mode="create"
            initialValues={
              remainingPlatforms[0]
                ? {
                    platform: remainingPlatforms[0].value,
                    label: remainingPlatforms[0].label,
                    href: "",
                  }
                : undefined
            }
            onCancel={() => setCreateOpen(false)}
            onSubmit={handleCreate}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingItem)}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
      >
        <DialogContent className="border-[#222] bg-[#111] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Social Link</DialogTitle>
            <DialogDescription className="text-[#8d8d8d]">
              Update this platform once and it changes across the site.
            </DialogDescription>
          </DialogHeader>
          {editingItem ? (
            <SocialLinkForm
              mode="edit"
              initialValues={{
                platform: editingItem.platform,
                label: editingItem.label,
                href: editingItem.href,
              }}
              onCancel={() => setEditingItem(null)}
              onSubmit={handleUpdate}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
      >
        <AlertDialogContent className="border-[#222] bg-[#111] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete social link?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8d8d8d]">
              {deletingItem
                ? `This will remove ${deletingItem.label} everywhere it appears on the website.`
                : "This social link will be removed from the public site."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2a2a2a] bg-transparent text-white hover:bg-[#1a1a1a]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-400"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
