"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  Monitor,
  Package,
  Palette,
  Save,
  Smartphone,
  Tablet,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/events/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { resolveSchoolTemplateAsset } from "@/lib/school-template-assets";
import { cn } from "@/lib/utils";
import {
  type SchoolTemplateProjectContent,
  type SchoolTemplateProjectFieldSnapshot,
  type SchoolTemplateProjectPageContent,
  type SchoolTemplateProjectSectionContent,
  type SchoolTemplateProjectSectionSnapshot,
  type SchoolTemplateSourceSnapshot,
} from "@/lib/school-template-project-content";
import {
  exportSchoolWebsiteProject,
  saveSchoolWebsiteProjectDraft,
} from "../../../actions";

type ProjectEditorWorkspaceProps = {
  projectId: string;
  applicationId: string;
  projectStatus: string;
  content: SchoolTemplateProjectContent;
  sourceSnapshot: SchoolTemplateSourceSnapshot;
  updatedAt: string;
  lastExportedAt: string | null;
  exportZipUrl: string | null;
};

type SelectedScope = "page" | "shared";
type PreviewMode = "desktop" | "tablet" | "mobile";
type EditableFieldValue = string | number | boolean | null;

type SectionBinding = {
  content: SchoolTemplateProjectSectionContent;
  snapshot: SchoolTemplateProjectSectionSnapshot | null;
};

type SaveDraftOptions = {
  createRevision?: boolean;
  note?: string;
  showToast?: boolean;
  autosave?: boolean;
};

type DraftUpdater =
  | SchoolTemplateProjectContent
  | ((
      currentDraft: SchoolTemplateProjectContent,
    ) => SchoolTemplateProjectContent);

type ModelValidationCandidate = {
  field: SchoolTemplateProjectFieldSnapshot;
  value: EditableFieldValue;
  label: string;
};

type ModelValidationProbeResult = {
  ok: boolean;
  status: number;
  contentType: string | null;
};

const MODEL_VALIDATION_PREVIEW_KEY = "preview-models";

const PREVIEW_MODES: Array<{
  id: PreviewMode;
  label: string;
  width: number | "100%";
  icon: typeof Monitor;
}> = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "mobile", label: "Mobile", width: 390, icon: Smartphone },
];

function getProjectPreviewHref(
  projectId: string,
  pageSlug: string,
  key: number,
) {
  return `/admin/we-brand-schools/projects/${projectId}/preview/${pageSlug}?editorPreview=${key}`;
}

function getTemplateBaseHref(previewPath: string) {
  const parts = previewPath.split("/");
  parts.pop();
  return `${parts.join("/") || ""}/`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getFieldControlKind(field: SchoolTemplateProjectFieldSnapshot | null) {
  return field?.type ?? "text";
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function getNumberValue(value: unknown) {
  return typeof value === "number" ? value : Number(value) || 0;
}

function isFilledFieldValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

function getFieldDisplayValue(
  field: SchoolTemplateProjectFieldSnapshot,
  value: EditableFieldValue,
) {
  if (value !== null && value !== "") {
    return value;
  }

  return field.defaultValue ?? value;
}

function getRepeatableItemFields(
  section: SectionBinding,
): SchoolTemplateProjectFieldSnapshot[] {
  const fields = section.snapshot?.fields ?? [];
  const repeatable = section.snapshot?.repeatable;
  if (!repeatable) return [];

  const itemFieldKeys = new Set(
    section.content.repeatable?.items.flatMap((item) => Object.keys(item)) ??
      [],
  );

  if (itemFieldKeys.size > 0) {
    return fields.filter((field) => itemFieldKeys.has(field.key));
  }

  const sectionSelector = section.snapshot?.selector.trim();
  const itemSelector = repeatable.itemSelector.trim();
  const sectionTargetsItems =
    sectionSelector === itemSelector ||
    sectionSelector
      ?.split(",")
      .map((selector) => selector.trim())
      .includes(itemSelector);

  if (sectionTargetsItems) return fields;

  const sectionLevelKeys = new Set([
    "body",
    "ctaHref",
    "ctaText",
    "eyebrow",
    "intro",
    "title",
  ]);

  return fields.filter((field) => !sectionLevelKeys.has(field.key));
}

function resolveModelValidationUrl({
  value,
  field,
  sourceSnapshot,
}: {
  value: EditableFieldValue;
  field: SchoolTemplateProjectFieldSnapshot;
  sourceSnapshot: SchoolTemplateSourceSnapshot;
}) {
  const resolved = resolveSchoolTemplateAsset(value, field, {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
    proxyCloudinaryRawModels: false,
  }).trim();

  if (!resolved) {
    return "";
  }

  const modelUrl = resolved;

  if (/^(https?:|blob:|data:)/i.test(modelUrl)) {
    return modelUrl;
  }

  if (modelUrl.startsWith("/")) {
    return new URL(modelUrl, window.location.origin).href;
  }

  try {
    const templateBaseUrl = new URL(
      getTemplateBaseHref(sourceSnapshot.previewPath),
      window.location.origin,
    );

    return new URL(modelUrl.replace(/^\.\//, ""), templateBaseUrl).href;
  } catch {
    return modelUrl;
  }
}

function getProbeResult(
  response: globalThis.Response,
): ModelValidationProbeResult {
  return {
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get("content-type"),
  };
}

async function probeModelValidationUrl(
  url: string,
): Promise<ModelValidationProbeResult> {
  if (/^(blob:|data:)/i.test(url)) {
    return {
      ok: true,
      status: 200,
      contentType: null,
    };
  }

  const headResponse = await fetch(url, {
    method: "HEAD",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (headResponse.status !== 405 && headResponse.status !== 501) {
    return getProbeResult(headResponse);
  }

  const getResponse = await fetch(url, {
    method: "GET",
    headers: {
      Range: "bytes=0-0",
    },
    credentials: "same-origin",
    cache: "no-store",
  });
  await getResponse.body?.cancel();

  return getProbeResult(getResponse);
}

function getModelValidationErrorMessage({
  label,
  status,
  contentType,
}: {
  label: string;
  status: number;
  contentType: string | null;
}) {
  if (contentType?.toLowerCase().includes("text/html")) {
    return `${label} resolved to an HTML page instead of a .glb/.gltf file. Check the model URL or upload the model again.`;
  }

  if (status === 400) {
    return `${label} has an invalid Cloudinary model URL or public ID. Upload a valid .glb file and try preview again.`;
  }

  if (status === 401) {
    return `${label} could not be checked because your admin session was not authorized. Sign in again, then try preview.`;
  }

  if (status === 403) {
    return `${label} exists but is not accessible from preview. Check the Cloudinary file permissions or upload it again.`;
  }

  if (status === 404) {
    return `${label} was not found on Cloudinary. Upload the 3D model again or choose another file.`;
  }

  return `${label} could not be loaded for preview. Cloudinary returned ${status}.`;
}

function collectSectionModelValidationCandidates(
  section: SectionBinding,
  labelPrefix: string,
) {
  const candidates: ModelValidationCandidate[] = [];
  const repeatableItemFields = section.content.repeatable
    ? new Set(getRepeatableItemFields(section).map((field) => field.key))
    : new Set<string>();

  for (const field of section.snapshot?.fields ?? []) {
    if (field.type !== "model3d") {
      continue;
    }

    if (section.content.repeatable && repeatableItemFields.has(field.key)) {
      continue;
    }

    const value = getFieldDisplayValue(
      field,
      section.content.fields[field.key] ?? null,
    );

    if (!isFilledFieldValue(value)) {
      continue;
    }

    candidates.push({
      field,
      value: value as EditableFieldValue,
      label: `${labelPrefix} ${field.label}`,
    });
  }

  if (!section.content.repeatable) {
    return candidates;
  }

  const modelItemFields = getRepeatableItemFields(section).filter(
    (field) => field.type === "model3d",
  );

  for (const [itemIndex, item] of section.content.repeatable.items.entries()) {
    for (const field of modelItemFields) {
      const value = getFieldDisplayValue(field, item[field.key] ?? null);

      if (!isFilledFieldValue(value)) {
        continue;
      }

      candidates.push({
        field,
        value: value as EditableFieldValue,
        label: `${labelPrefix} item ${itemIndex + 1} ${field.label}`,
      });
    }
  }

  return candidates;
}

function getPreviewModelValidationCandidates({
  content,
  sourceSnapshot,
  pageSlug,
}: {
  content: SchoolTemplateProjectContent;
  sourceSnapshot: SchoolTemplateSourceSnapshot;
  pageSlug: string;
}) {
  const candidates: ModelValidationCandidate[] = [];

  for (const sectionContent of content.sharedSections) {
    candidates.push(
      ...collectSectionModelValidationCandidates(
        {
          content: sectionContent,
          snapshot:
            sourceSnapshot.sharedSections.find(
              (section) => section.id === sectionContent.id,
            ) ?? null,
        },
        sectionContent.label,
      ),
    );
  }

  const page = content.pages.find((item) => item.slug === pageSlug);
  const pageSnapshot = sourceSnapshot.pages.find(
    (item) => item.slug === pageSlug,
  );

  for (const sectionContent of page?.sections ?? []) {
    candidates.push(
      ...collectSectionModelValidationCandidates(
        {
          content: sectionContent,
          snapshot:
            pageSnapshot?.sections.find(
              (section) => section.id === sectionContent.id,
            ) ?? null,
        },
        sectionContent.label,
      ),
    );
  }

  return candidates;
}

function FieldControl({
  field,
  value,
  onChange,
  onValidateModel,
  isValidatingModel = false,
}: {
  field: SchoolTemplateProjectFieldSnapshot;
  value: EditableFieldValue;
  onChange: (value: EditableFieldValue) => void;
  onValidateModel?: (value: EditableFieldValue) => Promise<void> | void;
  isValidatingModel?: boolean;
}) {
  const controlKind = getFieldControlKind(field);
  const displayValue = getFieldDisplayValue(field, value);
  const displayStringValue = getStringValue(displayValue);
  const commonInputClass =
    "border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder:text-[#555]";

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-[#b3b3b3]">
        {field.label}
      </label>

      {controlKind === "textarea" || controlKind === "richText" ? (
        <Textarea
          rows={4}
          value={getStringValue(displayValue)}
          onChange={(event) => onChange(event.target.value)}
          className={cn("resize-none", commonInputClass)}
        />
      ) : controlKind === "image" || controlKind === "model3d" ? (
        <div className="space-y-2">
          <ImageUpload
            value={displayStringValue}
            onChange={(publicId) => {
              onChange(publicId);
              if (controlKind === "model3d") {
                void onValidateModel?.(publicId);
              }
            }}
            onRemove={() => onChange("")}
            emptyLabel={
              controlKind === "model3d" ? "Upload GLB model" : "Upload image"
            }
            previewAlt={field.label}
            resourceType={controlKind === "model3d" ? "raw" : "image"}
            allowedFormats={field.acceptedFileTypes?.map((format) =>
              format.replace(/^\./, ""),
            )}
            maxFileSize={controlKind === "model3d" ? 10_000_000 : undefined}
            deletePreviousOnReplace={false}
            successMessage={
              controlKind === "model3d"
                ? "3D model uploaded successfully"
                : undefined
            }
          />
          {controlKind === "model3d" &&
          displayStringValue &&
          onValidateModel ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void onValidateModel?.(displayStringValue)}
              disabled={isValidatingModel}
              className="w-full border-[#333] bg-[#0d0d0d] text-[#888] hover:border-cyan-500/30 hover:text-white"
            >
              {isValidatingModel ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-1.5 h-4 w-4" />
              )}
              Test model in preview
            </Button>
          ) : null}
        </div>
      ) : controlKind === "color" ? (
        <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-2">
          <Input
            type="color"
            value={getStringValue(displayValue) || "#000000"}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 border-[#2a2a2a] bg-[#0d0d0d] p-1"
          />
          <Input
            value={getStringValue(displayValue)}
            onChange={(event) => onChange(event.target.value)}
            className={commonInputClass}
            placeholder="#000000"
          />
        </div>
      ) : controlKind === "number" ? (
        <div className="space-y-2">
          {field.min !== undefined && field.max !== undefined ? (
            <Input
              type="range"
              value={getNumberValue(displayValue)}
              min={field.min}
              max={field.max}
              step={field.step ?? 1}
              onChange={(event) => onChange(Number(event.target.value))}
              className="h-8 border-[#2a2a2a] bg-[#0d0d0d]"
            />
          ) : null}
          <div className="grid grid-cols-[minmax(0,1fr)_64px] gap-2">
            <Input
              type="number"
              value={getNumberValue(displayValue)}
              min={field.min}
              max={field.max}
              step={field.step ?? 1}
              onChange={(event) => onChange(Number(event.target.value))}
              className={commonInputClass}
            />
            <div className="flex h-9 items-center justify-center rounded-md border border-[#2a2a2a] bg-[#0d0d0d] text-xs text-[#777]">
              {field.unit ?? "value"}
            </div>
          </div>
        </div>
      ) : (
        <Input
          value={getStringValue(displayValue)}
          onChange={(event) => onChange(event.target.value)}
          className={commonInputClass}
          placeholder={field.placeholder ?? ""}
        />
      )}
      {field.helpText ? (
        <p className="text-xs leading-5 text-[#666]">{field.helpText}</p>
      ) : null}
    </div>
  );
}

export function SchoolWebsiteProjectEditor({
  projectId,
  applicationId,
  projectStatus,
  content,
  sourceSnapshot,
  updatedAt,
  lastExportedAt,
  exportZipUrl,
}: ProjectEditorWorkspaceProps) {
  const [draft, setDraft] = useState(content);
  const [selectedScope, setSelectedScope] = useState<SelectedScope>("page");
  const [selectedPageSlug, setSelectedPageSlug] = useState(
    content.pages.find((page) => page.isHome)?.slug ??
      content.pages[0]?.slug ??
      "",
  );
  const [selectedSectionId, setSelectedSectionId] = useState(
    content.pages.find((page) => page.isHome)?.sections[0]?.id ??
      content.pages[0]?.sections[0]?.id ??
      content.sharedSections[0]?.id ??
      "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(updatedAt);
  const [currentProjectStatus, setCurrentProjectStatus] =
    useState(projectStatus);
  const [currentExportZipUrl, setCurrentExportZipUrl] = useState(exportZipUrl);
  const [currentLastExportedAt, setCurrentLastExportedAt] =
    useState(lastExportedAt);
  const [autosaveStatus, setAutosaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [validatingModelKey, setValidatingModelKey] = useState<string | null>(
    null,
  );
  const draftRef = useRef(draft);
  const isDirtyRef = useRef(isDirty);
  const isSavingRef = useRef(isSaving);
  const dirtyVersionRef = useRef(0);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    isSavingRef.current = isSaving;
  }, [isSaving]);

  const selectedPage = useMemo(
    () =>
      draft.pages.find((page) => page.slug === selectedPageSlug) ??
      draft.pages[0],
    [draft.pages, selectedPageSlug],
  );

  const selectedPageSnapshot = useMemo(
    () =>
      sourceSnapshot.pages.find((page) => page.slug === selectedPage?.slug) ??
      sourceSnapshot.pages[0],
    [selectedPage?.slug, sourceSnapshot.pages],
  );

  const sectionBindings = useMemo<SectionBinding[]>(() => {
    if (selectedScope === "shared") {
      return draft.sharedSections.map((section) => ({
        content: section,
        snapshot:
          sourceSnapshot.sharedSections.find(
            (snapshotSection) => snapshotSection.id === section.id,
          ) ?? null,
      }));
    }

    return (selectedPage?.sections ?? []).map((section) => ({
      content: section,
      snapshot:
        selectedPageSnapshot?.sections.find(
          (snapshotSection) => snapshotSection.id === section.id,
        ) ?? null,
    }));
  }, [
    draft.sharedSections,
    selectedPage?.sections,
    selectedPageSnapshot?.sections,
    selectedScope,
    sourceSnapshot.sharedSections,
  ]);

  const activeSection =
    sectionBindings.find(
      (section) => section.content.id === selectedSectionId,
    ) ??
    sectionBindings[0] ??
    null;

  const previewHref = selectedPage
    ? getProjectPreviewHref(projectId, selectedPage.slug, previewKey)
    : sourceSnapshot.previewPath;
  const activePreviewMode =
    PREVIEW_MODES.find((mode) => mode.id === previewMode) ?? PREVIEW_MODES[0];
  const isPreviewValidatingModel =
    validatingModelKey === MODEL_VALIDATION_PREVIEW_KEY;
  const activeFieldGroups = useMemo(() => {
    const groups = new Map<string, SchoolTemplateProjectFieldSnapshot[]>();
    const repeatableItemFields = activeSection
      ? new Set(
          getRepeatableItemFields(activeSection).map((field) => field.key),
        )
      : new Set<string>();

    for (const field of activeSection?.snapshot?.fields ?? []) {
      if (
        activeSection?.content.repeatable &&
        repeatableItemFields.has(field.key)
      ) {
        continue;
      }

      const groupName = field.uiGroup ?? "Content";
      groups.set(groupName, [...(groups.get(groupName) ?? []), field]);
    }

    return Array.from(groups.entries()).map(([name, fields]) => ({
      name,
      fields: fields.sort(
        (left, right) => (left.uiOrder ?? 0) - (right.uiOrder ?? 0),
      ),
    }));
  }, [activeSection?.snapshot?.fields]);

  const selectPage = (page: SchoolTemplateProjectPageContent) => {
    setSelectedScope("page");
    setSelectedPageSlug(page.slug);
    setSelectedSectionId(page.sections[0]?.id ?? "");
  };

  const selectSharedSections = () => {
    setSelectedScope("shared");
    setSelectedSectionId(draft.sharedSections[0]?.id ?? "");
  };

  const updateDraft = (updater: DraftUpdater) => {
    const nextDraft =
      typeof updater === "function" ? updater(draftRef.current) : updater;

    dirtyVersionRef.current += 1;
    draftRef.current = nextDraft;
    isDirtyRef.current = true;
    setDraft(nextDraft);
    setIsDirty(true);
  };

  const updateSectionField = (
    sectionId: string,
    fieldKey: string,
    value: string | number | boolean | null,
  ) => {
    if (selectedScope === "shared") {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        sharedSections: currentDraft.sharedSections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                fields: {
                  ...section.fields,
                  [fieldKey]: value,
                },
              }
            : section,
        ),
      }));
      return;
    }

    updateDraft((currentDraft) => ({
      ...currentDraft,
      pages: currentDraft.pages.map((page) =>
        page.slug === selectedPageSlug
          ? {
              ...page,
              sections: page.sections.map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      fields: {
                        ...section.fields,
                        [fieldKey]: value,
                      },
                    }
                  : section,
              ),
            }
          : page,
      ),
    }));
  };

  const updateRepeatableItemField = (
    sectionId: string,
    itemIndex: number,
    fieldKey: string,
    value: string | number | boolean | null,
  ) => {
    const updateSection = (
      section: SchoolTemplateProjectSectionContent,
    ): SchoolTemplateProjectSectionContent =>
      section.id === sectionId
        ? {
            ...section,
            repeatable: {
              items: (section.repeatable?.items ?? []).map((item, index) =>
                index === itemIndex
                  ? {
                      ...item,
                      [fieldKey]: value,
                    }
                  : item,
              ),
            },
          }
        : section;

    if (selectedScope === "shared") {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        sharedSections: currentDraft.sharedSections.map(updateSection),
      }));
      return;
    }

    updateDraft((currentDraft) => ({
      ...currentDraft,
      pages: currentDraft.pages.map((page) =>
        page.slug === selectedPageSlug
          ? {
              ...page,
              sections: page.sections.map(updateSection),
            }
          : page,
      ),
    }));
  };

  const addRepeatableItem = (sectionId: string) => {
    const updateSection = (
      section: SchoolTemplateProjectSectionContent,
    ): SchoolTemplateProjectSectionContent =>
      section.id === sectionId
        ? {
            ...section,
            repeatable: {
              items: [...(section.repeatable?.items ?? []), {}],
            },
          }
        : section;

    if (selectedScope === "shared") {
      updateDraft((currentDraft) => ({
        ...currentDraft,
        sharedSections: currentDraft.sharedSections.map(updateSection),
      }));
      return;
    }

    updateDraft((currentDraft) => ({
      ...currentDraft,
      pages: currentDraft.pages.map((page) =>
        page.slug === selectedPageSlug
          ? {
              ...page,
              sections: page.sections.map(updateSection),
            }
          : page,
      ),
    }));
  };

  const updateTheme = (
    key: keyof SchoolTemplateProjectContent["theme"],
    value: string,
  ) => {
    updateDraft((currentDraft) => ({
      ...currentDraft,
      theme: {
        ...currentDraft.theme,
        [key]: value,
      },
    }));
  };

  const saveDraft = useCallback(
    async ({
      createRevision = true,
      note,
      showToast = true,
      autosave = false,
    }: SaveDraftOptions = {}) => {
      if (isSavingRef.current) {
        return false;
      }

      const versionAtSaveStart = dirtyVersionRef.current;
      const contentToSave = draftRef.current;

      isSavingRef.current = true;
      if (autosave) {
        setAutosaveStatus("saving");
      }
      setIsSaving(true);

      let result: Awaited<ReturnType<typeof saveSchoolWebsiteProjectDraft>>;
      try {
        result = await saveSchoolWebsiteProjectDraft(projectId, contentToSave, {
          createRevision,
          note,
          applicationId,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to save project draft.";
        if (autosave) {
          setAutosaveStatus("error");
        }
        if (showToast) {
          toast.error(message);
        }
        return false;
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }

      if (!result.success) {
        if (autosave) {
          setAutosaveStatus("error");
        }
        if (showToast) {
          toast.error(result.message);
        }
        return false;
      }

      if (dirtyVersionRef.current === versionAtSaveStart) {
        isDirtyRef.current = false;
        setIsDirty(false);
      }
      if (result.updatedAt) {
        setLastSavedAt(result.updatedAt);
      }
      if (autosave) {
        setAutosaveStatus("saved");
      }
      if (showToast) {
        toast.success(result.message);
      }
      return true;
    },
    [applicationId, projectId],
  );

  const validateModelCandidate = useCallback(
    async (
      candidate: ModelValidationCandidate,
      { showSuccess = false }: { showSuccess?: boolean } = {},
    ) => {
      const validationUrl = resolveModelValidationUrl({
        value: candidate.value,
        field: candidate.field,
        sourceSnapshot,
      });

      if (!validationUrl) {
        toast.error(`${candidate.label} does not have a model file selected.`);
        return false;
      }

      let result: ModelValidationProbeResult;
      try {
        result = await probeModelValidationUrl(validationUrl);
      } catch {
        toast.error(
          `${candidate.label} could not be reached from preview. Check the upload, then try again.`,
        );
        return false;
      }

      if (!result.ok) {
        toast.error(
          getModelValidationErrorMessage({
            label: candidate.label,
            status: result.status,
            contentType: result.contentType,
          }),
        );
        return false;
      }

      if (result.contentType?.toLowerCase().includes("text/html")) {
        toast.error(
          getModelValidationErrorMessage({
            label: candidate.label,
            status: result.status,
            contentType: result.contentType,
          }),
        );
        return false;
      }

      if (showSuccess) {
        toast.success(`${candidate.label} is ready for preview.`);
      }

      return true;
    },
    [sourceSnapshot],
  );

  const validatePreviewModelFields = useCallback(
    async ({ showSuccess = false }: { showSuccess?: boolean } = {}) => {
      const candidates = getPreviewModelValidationCandidates({
        content: draftRef.current,
        sourceSnapshot,
        pageSlug: selectedPage?.slug ?? selectedPageSlug,
      });

      if (!candidates.length) {
        return true;
      }

      setValidatingModelKey(MODEL_VALIDATION_PREVIEW_KEY);

      try {
        for (const candidate of candidates) {
          const isValid = await validateModelCandidate(candidate);
          if (!isValid) {
            return false;
          }
        }

        if (showSuccess) {
          toast.success(
            candidates.length === 1
              ? "3D model is ready for preview."
              : "3D models are ready for preview.",
          );
        }

        return true;
      } finally {
        setValidatingModelKey(null);
      }
    },
    [
      selectedPage?.slug,
      selectedPageSlug,
      sourceSnapshot,
      validateModelCandidate,
    ],
  );

  const validateActiveModelField = useCallback(
    async (
      field: SchoolTemplateProjectFieldSnapshot,
      value: EditableFieldValue,
      validationKey: string,
      label: string,
    ) => {
      if (!isFilledFieldValue(value)) {
        return;
      }

      setValidatingModelKey(validationKey);

      try {
        await validateModelCandidate(
          {
            field,
            value,
            label,
          },
          { showSuccess: true },
        );
      } finally {
        setValidatingModelKey(null);
      }
    },
    [validateModelCandidate],
  );

  const saveDraftAndValidatePreviewModels = async () => {
    const saved = await saveDraft({
      createRevision: true,
      note: "Manual draft save.",
      showToast: true,
    });

    if (saved) {
      await validatePreviewModelFields();
    }
  };

  useEffect(() => {
    const autosaveInterval = window.setInterval(() => {
      if (!isDirtyRef.current || isSavingRef.current) {
        return;
      }

      void saveDraft({
        createRevision: false,
        note: "Autosaved draft.",
        showToast: false,
        autosave: true,
      });
    }, 25_000);

    return () => window.clearInterval(autosaveInterval);
  }, [saveDraft]);

  const refreshPreview = async () => {
    if (isDirty) {
      const saved = await saveDraft({
        createRevision: false,
        note: "Saved before preview refresh.",
        showToast: false,
      });
      if (!saved) return;
    }

    const modelsReady = await validatePreviewModelFields();
    if (!modelsReady) {
      return;
    }

    setPreviewKey((current) => current + 1);
    setIsPreviewOpen(true);
  };

  const exportZip = async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      if (isDirtyRef.current) {
        const saved = await saveDraft({
          createRevision: true,
          note: "Saved before export.",
          showToast: false,
        });

        if (!saved) {
          return;
        }
      }

      const result = await exportSchoolWebsiteProject(projectId, applicationId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      if (result.exportZipUrl) {
        setCurrentExportZipUrl(result.exportZipUrl);
      }
      if (result.lastExportedAt) {
        setCurrentLastExportedAt(result.lastExportedAt);
      }
      if (result.status) {
        setCurrentProjectStatus(result.status);
      }

      toast.success(result.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-11rem)] overflow-hidden rounded-2xl border border-[#222] bg-[#080808]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222] bg-[#101010] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-blue-500/20 bg-blue-500/10 text-blue-400"
          >
            {currentProjectStatus}
          </Badge>
          {isDirty ? (
            <Badge
              variant="outline"
              className="border-amber-500/20 bg-amber-500/10 text-amber-400"
            >
              Unsaved
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-green-500/20 bg-green-500/10 text-green-400"
            >
              Saved
            </Badge>
          )}
          <span className="text-xs text-[#666]">
            Last saved {formatDate(lastSavedAt)}
          </span>
          {autosaveStatus !== "idle" ? (
            <span className="text-xs text-[#666]">
              {autosaveStatus === "saving"
                ? "Autosaving"
                : autosaveStatus === "saved"
                  ? "Autosaved"
                  : "Autosave failed"}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => void saveDraftAndValidatePreviewModels()}
            disabled={isSaving || isExporting}
            className="bg-cyan-500 text-black hover:bg-cyan-400"
          >
            {isSaving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshPreview()}
            disabled={isSaving || isExporting || isPreviewValidatingModel}
            className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
          >
            {isPreviewValidatingModel ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Eye className="mr-1.5 h-4 w-4" />
            )}
            {isPreviewValidatingModel ? "Checking" : "Preview"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void exportZip()}
            disabled={isSaving || isExporting}
            className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
          >
            {isExporting ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Package className="mr-1.5 h-4 w-4" />
            )}
            Export Zip
          </Button>
          {currentExportZipUrl ? (
            <Button
              asChild
              type="button"
              variant="outline"
              className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <a href={currentExportZipUrl} target="_blank" rel="noreferrer">
                <Download className="mr-1.5 h-4 w-4" />
                Download Zip
              </a>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled
              className="border-[#2a2a2a] text-[#555]"
            >
              <Download className="mr-1.5 h-4 w-4" />
              Download Zip
            </Button>
          )}
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-15rem)] grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-[#222] bg-[#0d0d0d] p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#666]">
            <FileText className="h-3.5 w-3.5" />
            Pages
          </div>

          <div className="space-y-1">
            {draft.pages.map((page) => (
              <button
                key={page.slug}
                type="button"
                onClick={() => selectPage(page)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  selectedScope === "page" && selectedPage?.slug === page.slug
                    ? "bg-cyan-500/10 text-cyan-300"
                    : "text-[#888] hover:bg-[#171717] hover:text-white",
                )}
              >
                <span className="truncate">{page.title}</span>
                <span className="text-[11px] text-[#555]">
                  {page.sections.length}
                </span>
              </button>
            ))}

            {draft.sharedSections.length ? (
              <button
                type="button"
                onClick={selectSharedSections}
                className={cn(
                  "mt-3 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  selectedScope === "shared"
                    ? "bg-cyan-500/10 text-cyan-300"
                    : "text-[#888] hover:bg-[#171717] hover:text-white",
                )}
              >
                <span className="truncate">Sitewide</span>
                <span className="text-[11px] text-[#555]">
                  {draft.sharedSections.length}
                </span>
              </button>
            ) : null}
          </div>

          <div className="mt-6 rounded-xl border border-[#222] bg-[#111] p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#666]">
              <Palette className="h-3.5 w-3.5" />
              Theme
            </div>
            <div className="space-y-3">
              <FieldControl
                field={{
                  key: "primaryColor",
                  label: "Primary",
                  type: "color",
                  selector: ":root",
                  target: "cssVariable",
                }}
                value={draft.theme.primaryColor}
                onChange={(value) =>
                  updateTheme("primaryColor", getStringValue(value))
                }
              />
              <FieldControl
                field={{
                  key: "secondaryColor",
                  label: "Secondary",
                  type: "color",
                  selector: ":root",
                  target: "cssVariable",
                }}
                value={draft.theme.secondaryColor}
                onChange={(value) =>
                  updateTheme("secondaryColor", getStringValue(value))
                }
              />
              <FieldControl
                field={{
                  key: "fontFamily",
                  label: "Font",
                  type: "text",
                  selector: "body",
                  target: "inlineStyle",
                }}
                value={draft.theme.fontFamily}
                onChange={(value) =>
                  updateTheme("fontFamily", getStringValue(value))
                }
              />
            </div>
          </div>
        </aside>

        <main className="min-h-[560px] overflow-y-auto bg-[#050505] p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                {selectedScope === "shared" ? "Sitewide" : selectedPage?.title}
              </p>
              <p className="text-xs text-[#666]">
                {selectedScope === "shared"
                  ? "Shared sections"
                  : selectedPage?.fileName}
              </p>
            </div>
            {currentLastExportedAt ? (
              <span className="text-xs text-[#666]">
                Exported {formatDate(currentLastExportedAt)}
              </span>
            ) : null}
          </div>

          <div className="mb-5 rounded-xl border border-[#222] bg-[#0d0d0d] p-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#666]">
              Sections
            </p>
            <div className="flex flex-wrap gap-2">
              {sectionBindings.map((section) => (
                <button
                  key={section.content.id}
                  type="button"
                  onClick={() => setSelectedSectionId(section.content.id)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    activeSection?.content.id === section.content.id
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-[#888] hover:bg-[#171717] hover:text-white",
                  )}
                >
                  {section.content.label}
                </button>
              ))}
            </div>
          </div>

          {activeSection ? (
            <div className="rounded-xl border border-[#222] bg-[#0d0d0d] p-4">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-white">
                  {activeSection.content.label}
                </h2>
                {activeSection.snapshot?.description ? (
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-[#777]">
                    {activeSection.snapshot.description}
                  </p>
                ) : null}
              </div>

              {activeFieldGroups.length ? (
                <div className="space-y-5">
                  {activeFieldGroups.map((group) => (
                    <div
                      key={group.name}
                      className="rounded-xl border border-[#1f1f1f] bg-[#090909] p-4"
                    >
                      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#666]">
                        {group.name}
                      </p>
                      <div className="grid gap-4 xl:grid-cols-2">
                        {group.fields.map((field) => {
                          const modelValidationKey = `${activeSection.content.id}:${field.key}:model-preview`;

                          return (
                            <FieldControl
                              key={`${activeSection.content.id}:${field.key}`}
                              field={field}
                              value={
                                activeSection.content.fields[field.key] ?? null
                              }
                              onChange={(value) =>
                                updateSectionField(
                                  activeSection.content.id,
                                  field.key,
                                  value,
                                )
                              }
                              onValidateModel={
                                field.type === "model3d"
                                  ? (nextValue) =>
                                      validateActiveModelField(
                                        field,
                                        nextValue,
                                        modelValidationKey,
                                        `${activeSection.content.label} ${field.label}`,
                                      )
                                  : undefined
                              }
                              isValidatingModel={
                                validatingModelKey === modelValidationKey
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-[#222] bg-[#111] p-4 text-sm text-[#777]">
                  No editable fields for this section yet.
                </div>
              )}

              {activeSection.content.repeatable &&
              activeSection.snapshot?.repeatable ? (
                <div className="mt-5 rounded-xl border border-[#222] bg-[#111] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <ImageIcon className="h-4 w-4 text-cyan-400" />
                      {activeSection.snapshot.repeatable.labelPlural}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        addRepeatableItem(activeSection.content.id)
                      }
                      className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                    >
                      Add {activeSection.snapshot.repeatable.labelSingular}
                    </Button>
                  </div>
                  {activeSection.content.repeatable.items.length ? (
                    <div className="mt-4 space-y-4">
                      {activeSection.content.repeatable.items.map(
                        (item, itemIndex) => (
                          <div
                            key={`${activeSection.content.id}:item:${itemIndex}`}
                            className="rounded-xl border border-[#1f1f1f] bg-[#090909] p-4"
                          >
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#666]">
                              {activeSection.snapshot?.repeatable
                                ?.labelSingular ?? "Item"}{" "}
                              {itemIndex + 1}
                            </p>
                            <div className="grid gap-4 xl:grid-cols-2">
                              {getRepeatableItemFields(activeSection).map(
                                (field) => {
                                  const modelValidationKey = `${activeSection.content.id}:${itemIndex}:${field.key}:model-preview`;

                                  return (
                                    <FieldControl
                                      key={`${activeSection.content.id}:${itemIndex}:${field.key}`}
                                      field={field}
                                      value={item[field.key] ?? null}
                                      onChange={(value) =>
                                        updateRepeatableItemField(
                                          activeSection.content.id,
                                          itemIndex,
                                          field.key,
                                          value,
                                        )
                                      }
                                      onValidateModel={
                                        field.type === "model3d"
                                          ? (nextValue) =>
                                              validateActiveModelField(
                                                field,
                                                nextValue,
                                                modelValidationKey,
                                                `${activeSection.content.label} item ${itemIndex + 1} ${field.label}`,
                                              )
                                          : undefined
                                      }
                                      isValidatingModel={
                                        validatingModelKey ===
                                        modelValidationKey
                                      }
                                    />
                                  );
                                },
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-[#777]">
                      Add an item to edit individual{" "}
                      {activeSection.snapshot.repeatable.labelPlural.toLowerCase()}
                      .
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-[#222] bg-[#111] p-4 text-sm text-[#777]">
              Select a section to edit.
            </div>
          )}
        </main>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent
          showCloseButton
          className="h-[92vh] w-[96vw] max-w-[96vw] gap-0 overflow-hidden border-[#222] bg-[#080808] p-0 text-white sm:max-w-[96vw]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222] bg-[#101010] px-4 py-3 pr-12">
            <DialogTitle className="text-sm font-semibold text-white">
              {activePreviewMode.label} Preview
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-[#222] bg-[#0d0d0d] p-1">
                {PREVIEW_MODES.map((mode) => {
                  const Icon = mode.icon;

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPreviewMode(mode.id)}
                      className={cn(
                        "flex h-8 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
                        previewMode === mode.id
                          ? "bg-cyan-500/10 text-cyan-300"
                          : "text-[#777] hover:bg-[#171717] hover:text-white",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="h-[calc(92vh-58px)] overflow-auto bg-[#151515] p-3">
            <div
              className="mx-auto h-full overflow-hidden rounded-lg bg-white transition-[width] duration-200"
              style={{
                width:
                  activePreviewMode.width === "100%"
                    ? "100%"
                    : `${activePreviewMode.width}px`,
                maxWidth: "100%",
              }}
            >
              <iframe
                key={`${previewHref}:${previewMode}:${previewKey}`}
                src={previewHref}
                title={`${activePreviewMode.label} school website preview`}
                className="h-full w-full"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
