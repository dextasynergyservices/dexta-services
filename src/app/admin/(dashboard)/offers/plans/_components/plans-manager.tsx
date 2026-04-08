"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { OffersAudienceType } from "@/lib/offers-defaults";
import {
  createBillingOption,
  createOfferGroup,
  createPricingPlan,
  deleteBillingOption,
  deleteOfferGroup,
  deletePricingPlan,
  reorderPlans,
  updateAudienceSettings,
  updateBillingOption,
  updateOfferGroup,
  updatePricingPlan,
  type AudienceRow,
  type BillingOptionRow,
  type OfferGroupRow,
  type PlanRow,
} from "../actions";
import { AudienceSettingsForm } from "./audience-settings-form";
import { BillingOptionForm } from "./billing-option-form";
import { OfferGroupForm } from "./offer-group-form";
import { PlanForm } from "./plan-form";

const AUDIENCE_TABS: Array<{
  type: OffersAudienceType;
  label: string;
  accent: string;
}> = [
  {
    type: "FOR_YOU",
    label: "For You",
    accent:
      "data-[state=active]:border-blue-500/40 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400",
  },
  {
    type: "BUSINESS",
    label: "Business",
    accent:
      "data-[state=active]:border-blue-500/40 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400",
  },
  {
    type: "SCHOOLS",
    label: "Schools",
    accent:
      "data-[state=active]:border-cyan-500/40 data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400",
  },
  {
    type: "CHURCHES",
    label: "Churches",
    accent:
      "data-[state=active]:border-purple-500/40 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-400",
  },
];

const DURATION_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

interface PlansManagerProps {
  offerGroups: OfferGroupRow[];
  audiences: AudienceRow[];
  activeTab: OffersAudienceType;
}

function formatPrice(value: number | null, currency: "USD" | "NGN") {
  if (value == null) return null;
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(value);
}

export function PlansManager({
  offerGroups: initial,
  audiences,
  activeTab: initialTab,
}: PlansManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OffersAudienceType>(initialTab);
  const [offerGroups, setOfferGroups] = useState<OfferGroupRow[]>(initial);

  // Dialog state
  const [editingAudience, setEditingAudience] = useState<AudienceRow | null>(
    null,
  );
  const [creatingGroup, setCreatingGroup] = useState<OffersAudienceType | null>(
    null,
  );
  const [editingGroup, setEditingGroup] = useState<OfferGroupRow | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<OfferGroupRow | null>(
    null,
  );
  const [creatingPlan, setCreatingPlan] = useState<OfferGroupRow | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanRow | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<PlanRow | null>(null);
  const [addingBillingTo, setAddingBillingTo] = useState<PlanRow | null>(null);
  const [editingOption, setEditingOption] = useState<BillingOptionRow | null>(
    null,
  );
  const [deletingOption, setDeletingOption] = useState<BillingOptionRow | null>(
    null,
  );
  const [reorderingGroupId, setReorderingGroupId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  useEffect(() => {
    setOfferGroups(initial);
  }, [initial]);

  const handleTabChange = (value: string) => {
    const next = value as OffersAudienceType;
    setActiveTab(next);
    router.push(`/admin/offers/plans?tab=${next.toLowerCase()}`, {
      scroll: false,
    });
  };

  const refresh = () => router.refresh();

  // ── Audience ────────────────────────────────────────────────────────────────

  const handleAudienceEdit = async (
    data: Parameters<typeof updateAudienceSettings>[1],
  ) => {
    if (!editingAudience) return;
    const result = await updateAudienceSettings(editingAudience.type, data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setEditingAudience(null);
    refresh();
  };

  // ── Offer groups ─────────────────────────────────────────────────────────────

  const handleCreateGroup = async (
    data: Parameters<typeof createOfferGroup>[1],
  ) => {
    if (!creatingGroup) return;
    const result = await createOfferGroup(creatingGroup, data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setCreatingGroup(null);
    refresh();
  };

  const handleEditGroup = async (
    data: Parameters<typeof updateOfferGroup>[1],
  ) => {
    if (!editingGroup) return;
    const result = await updateOfferGroup(editingGroup.id, data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setEditingGroup(null);
    refresh();
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;
    const result = await deleteOfferGroup(deletingGroup.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setDeletingGroup(null);
    refresh();
  };

  // ── Plans ────────────────────────────────────────────────────────────────────

  const handleCreatePlan = async (
    data: Parameters<typeof createPricingPlan>[1],
  ) => {
    if (!creatingPlan) return;
    const result = await createPricingPlan(creatingPlan.id, data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setCreatingPlan(null);
    refresh();
  };

  const handleEditPlan = async (
    data: Parameters<typeof updatePricingPlan>[1],
  ) => {
    if (!editingPlan) return;
    const result = await updatePricingPlan(editingPlan.id, data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setEditingPlan(null);
    refresh();
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return;
    const result = await deletePricingPlan(deletingPlan.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setDeletingPlan(null);
    refresh();
  };

  const movePlan = async (
    group: OfferGroupRow,
    index: number,
    direction: "up" | "down",
  ) => {
    const plans = [...group.plans].sort((a, b) => a.position - b.position);
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= plans.length) return;
    const reordered = [...plans];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];
    setReorderingGroupId(group.id);
    const posMap = new Map(reordered.map((p, i) => [p.id, i]));
    setOfferGroups((current) =>
      current.map((g) =>
        g.id !== group.id
          ? g
          : {
              ...g,
              plans: g.plans.map((p) => ({
                ...p,
                position: posMap.get(p.id) ?? p.position,
              })),
            },
      ),
    );
    const result = await reorderPlans(
      group.id,
      reordered.map((p) => p.id),
    );
    setReorderingGroupId(null);
    if (!result.success) {
      toast.error(result.message);
      setOfferGroups(initial);
      return;
    }
  };

  // ── Billing options ──────────────────────────────────────────────────────────

  const handleAddBilling = async (
    data: Parameters<typeof createBillingOption>[1],
  ) => {
    if (!addingBillingTo) return;
    const result = await createBillingOption(addingBillingTo.id, data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setAddingBillingTo(null);
    refresh();
  };

  const handleEditBilling = async (
    data: Parameters<typeof updateBillingOption>[1],
  ) => {
    if (!editingOption) return;
    const result = await updateBillingOption(editingOption.id, data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setEditingOption(null);
    refresh();
  };

  const handleDeleteBilling = async () => {
    if (!deletingOption) return;
    const result = await deleteBillingOption(deletingOption.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setDeletingOption(null);
    refresh();
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="h-auto flex-wrap gap-2 rounded-xl border border-[#222] bg-[#111] p-2">
          {AUDIENCE_TABS.map((tab) => {
            const count = offerGroups.filter(
              (g) => g.audienceType === tab.type,
            ).length;
            return (
              <TabsTrigger
                key={tab.type}
                value={tab.type}
                className={cn(
                  "rounded-lg border border-transparent px-4 py-2 text-xs font-semibold text-[#777] transition-colors hover:text-white",
                  tab.accent,
                )}
              >
                {tab.label}
                <span className="ml-2 rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-bold text-current">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {AUDIENCE_TABS.map((audienceTab) => {
          const audienceSettings = audiences.find(
            (a) => a.type === audienceTab.type,
          );
          const groups = offerGroups
            .filter((g) => g.audienceType === audienceTab.type)
            .sort((a, b) => a.position - b.position);

          return (
            <TabsContent
              key={audienceTab.type}
              value={audienceTab.type}
              className="mt-6 space-y-4"
            >
              {/* Audience settings bar */}
              {audienceSettings ? (
                <section className="rounded-2xl border border-[#222] bg-[#111] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#555]">
                        Audience Settings
                      </p>
                      <h2 className="mt-1 text-sm font-semibold text-white">
                        {audienceSettings.tabLabel}
                      </h2>
                      <p className="mt-0.5 text-xs text-[#666]">
                        Color:{" "}
                        <span className="capitalize">
                          {audienceSettings.color}
                        </span>
                        {" · "}
                        {audienceSettings.isVisible ? "Visible" : "Hidden"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAudience(audienceSettings)}
                      className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                </section>
              ) : null}

              {/* Offer groups */}
              {groups.map((group) => {
                const sortedPlans = [...group.plans].sort(
                  (a, b) => a.position - b.position,
                );
                return (
                  <section
                    key={group.id}
                    className="rounded-2xl border border-[#222] bg-[#111] p-5 sm:p-6"
                  >
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-2">
                        <Layers className="mt-0.5 h-4 w-4 shrink-0 text-[#555]" />
                        <div>
                          <h2 className="text-sm font-semibold text-white">
                            {group.name}
                          </h2>
                          {group.description ? (
                            <p className="mt-0.5 text-xs text-[#666]">
                              {group.description}
                            </p>
                          ) : null}
                          <p className="mt-1 text-[11px] text-[#444]">
                            {group.isVisible ? "Visible" : "Hidden"} ·{" "}
                            {sortedPlans.length} offer
                            {sortedPlans.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCreatingPlan(group)}
                          className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Offer
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingGroup(group)}
                          className="h-8 w-8 text-[#666] hover:bg-[#1a1a1a] hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingGroup(group)}
                          className="h-8 w-8 text-[#666] hover:bg-red-950/30 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {sortedPlans.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#2a2a2a] px-4 py-8 text-center">
                        <p className="text-sm text-[#555]">
                          No offers yet. Add the first offer to this group.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 lg:grid-cols-2">
                        {sortedPlans.map((plan, index) => (
                          <div
                            key={plan.id}
                            className="rounded-xl border border-[#222] bg-[#0d0d0d] p-4"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h3 className="text-sm font-semibold text-white">
                                    {plan.name}
                                  </h3>
                                  {plan.isHighlighted ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                                      <Sparkles className="h-3 w-3" />{" "}
                                      Recommended
                                    </span>
                                  ) : null}
                                  <span
                                    className={cn(
                                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                      plan.isVisible
                                        ? "bg-cyan-500/10 text-cyan-300"
                                        : "bg-[#1a1a1a] text-[#777]",
                                    )}
                                  >
                                    {plan.isVisible ? "Visible" : "Hidden"}
                                  </span>
                                  {plan.billingEnabled ? (
                                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                                      Billing on
                                    </span>
                                  ) : null}
                                </div>
                                {plan.subtitle ? (
                                  <p className="mt-1 text-xs text-[#666]">
                                    {plan.subtitle}
                                  </p>
                                ) : null}
                              </div>

                              <div className="flex items-start gap-1">
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    type="button"
                                    disabled={
                                      index === 0 ||
                                      reorderingGroupId === group.id
                                    }
                                    onClick={() => movePlan(group, index, "up")}
                                    className="rounded p-1 text-[#555] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label="Move up"
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      index === sortedPlans.length - 1 ||
                                      reorderingGroupId === group.id
                                    }
                                    onClick={() =>
                                      movePlan(group, index, "down")
                                    }
                                    className="rounded p-1 text-[#555] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                    aria-label="Move down"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </button>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingPlan(plan)}
                                  className="h-8 w-8 text-[#666] hover:bg-[#1a1a1a] hover:text-white"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeletingPlan(plan)}
                                  className="h-8 w-8 text-[#666] hover:bg-red-950/30 hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Billing options */}
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-[#555]">
                                  Billing Options
                                </p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setAddingBillingTo(plan)}
                                  className="h-6 px-2 text-[10px] text-[#555] hover:bg-[#1a1a1a] hover:text-white"
                                >
                                  <Plus className="mr-1 h-3 w-3" /> Add
                                </Button>
                              </div>
                              {plan.billingOptions.length === 0 ? (
                                <p className="text-xs text-[#444]">
                                  None — card shows "Custom quote"
                                </p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {[...plan.billingOptions]
                                    .sort((a, b) => a.position - b.position)
                                    .map((opt) => (
                                      <div
                                        key={opt.id}
                                        className="group/opt flex items-center gap-1.5 rounded-lg border border-[#1f1f1f] bg-black/20 px-2.5 py-1.5"
                                      >
                                        <div>
                                          <p className="text-xs font-medium text-[#ccc]">
                                            {DURATION_LABELS[opt.duration] ??
                                              opt.duration}
                                            {opt.isDefault ? (
                                              <span className="ml-1 text-[10px] text-cyan-400">
                                                default
                                              </span>
                                            ) : null}
                                          </p>
                                          <p className="text-[11px] text-[#777]">
                                            {formatPrice(opt.priceNGN, "NGN") ??
                                              "—"}{" "}
                                            /{" "}
                                            {formatPrice(opt.priceUSD, "USD") ??
                                              "—"}
                                          </p>
                                        </div>
                                        <div className="ml-1 flex gap-0.5 opacity-0 transition-opacity group-hover/opt:opacity-100">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setEditingOption(opt)
                                            }
                                            className="rounded p-0.5 text-[#555] hover:text-white"
                                            aria-label="Edit billing option"
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setDeletingOption(opt)
                                            }
                                            className="rounded p-0.5 text-[#555] hover:text-red-400"
                                            aria-label="Remove billing option"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}

              {groups.length === 0 ? (
                <section className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0a0a0a] px-5 py-10 text-center">
                  <p className="text-sm font-medium text-white">
                    No offer groups in {audienceTab.label} yet.
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[#666]">
                    If you just seeded the database, switch to another audience
                    tab like Business, Schools, or Churches, or add the first
                    offer group here.
                  </p>
                </section>
              ) : null}

              {/* Add group button */}
              <button
                type="button"
                onClick={() => setCreatingGroup(audienceTab.type)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0a0a0a] px-4 py-5 text-sm text-[#555] transition-colors hover:border-[#333] hover:text-[#888]"
              >
                <Plus className="h-4 w-4" /> Add Offer Group to{" "}
                {audienceTab.label}
              </button>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* ── Dialogs ── */}

      <Dialog
        open={!!editingAudience}
        onOpenChange={(o) => !o && setEditingAudience(null)}
        modal={false}
      >
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Audience Settings
            </DialogTitle>
          </DialogHeader>
          {editingAudience ? (
            <AudienceSettingsForm
              audience={editingAudience}
              onSubmit={handleAudienceEdit}
              onCancel={() => setEditingAudience(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!creatingGroup}
        onOpenChange={(o) => !o && setCreatingGroup(null)}
        modal={false}
      >
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">New Offer Group</DialogTitle>
          </DialogHeader>
          {creatingGroup ? (
            <OfferGroupForm
              onSubmit={handleCreateGroup}
              onCancel={() => setCreatingGroup(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingGroup}
        onOpenChange={(o) => !o && setEditingGroup(null)}
        modal={false}
      >
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Edit Offer Group</DialogTitle>
          </DialogHeader>
          {editingGroup ? (
            <OfferGroupForm
              initialData={editingGroup}
              onSubmit={handleEditGroup}
              onCancel={() => setEditingGroup(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!creatingPlan}
        onOpenChange={(o) => !o && setCreatingPlan(null)}
        modal={false}
      >
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Add Offer</DialogTitle>
          </DialogHeader>
          {creatingPlan ? (
            <PlanForm
              onSubmit={handleCreatePlan}
              onCancel={() => setCreatingPlan(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingPlan}
        onOpenChange={(o) => !o && setEditingPlan(null)}
        modal={false}
      >
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Edit Offer</DialogTitle>
          </DialogHeader>
          {editingPlan ? (
            <PlanForm
              initialData={editingPlan}
              onSubmit={handleEditPlan}
              onCancel={() => setEditingPlan(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!addingBillingTo}
        onOpenChange={(o) => !o && setAddingBillingTo(null)}
        modal={false}
      >
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Add Billing Option</DialogTitle>
          </DialogHeader>
          {addingBillingTo ? (
            <BillingOptionForm
              onSubmit={handleAddBilling}
              onCancel={() => setAddingBillingTo(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingOption}
        onOpenChange={(o) => !o && setEditingOption(null)}
        modal={false}
      >
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Billing Option
            </DialogTitle>
          </DialogHeader>
          {editingOption ? (
            <BillingOptionForm
              initialData={editingOption}
              onSubmit={handleEditBilling}
              onCancel={() => setEditingOption(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <AlertDialog
        open={!!deletingGroup}
        onOpenChange={(o) => !o && setDeletingGroup(null)}
      >
        <AlertDialogContent className="border-[#222] bg-[#111]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete "{deletingGroup?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">
              This will permanently delete the group and all its offers and
              billing options.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2a2a2a] bg-transparent text-[#888] hover:bg-[#1a1a1a] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingPlan}
        onOpenChange={(o) => !o && setDeletingPlan(null)}
      >
        <AlertDialogContent className="border-[#222] bg-[#111]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete "{deletingPlan?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">
              This will permanently delete the offer and its billing options.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2a2a2a] bg-transparent text-[#888] hover:bg-[#1a1a1a] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Delete Offer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingOption}
        onOpenChange={(o) => !o && setDeletingOption(null)}
      >
        <AlertDialogContent className="border-[#222] bg-[#111]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Remove billing option?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">
              This will remove the{" "}
              {DURATION_LABELS[deletingOption?.duration ?? ""] ?? "selected"}{" "}
              billing option.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2a2a2a] bg-transparent text-[#888] hover:bg-[#1a1a1a] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBilling}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
