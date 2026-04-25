export type SchoolTemplateFieldType =
  | "text"
  | "textarea"
  | "richText"
  | "image"
  | "model3d"
  | "link"
  | "color"
  | "number";

export type SchoolTemplateFieldTarget =
  | "textContent"
  | "innerHTML"
  | "attribute"
  | "backgroundImage"
  | "cssVariable"
  | "inlineStyle"
  | "threeConfig";

export type SchoolTemplateResponsiveScope =
  | "base"
  | "desktop"
  | "tablet"
  | "mobile";

export type SchoolTemplateField = {
  key: string;
  label: string;
  type: SchoolTemplateFieldType;
  selector: string;
  target?: SchoolTemplateFieldTarget;
  attribute?: string;
  configPath?: string;
  cssVariable?: string;
  scope?: SchoolTemplateResponsiveScope;
  unit?: string;
  defaultValue?: string | number | boolean;
  acceptedFileTypes?: string[];
  placeholder?: string;
  helpText?: string;
  uiGroup?: string;
  uiOrder?: number;
  min?: number;
  max?: number;
  step?: number;
};

export type SchoolTemplateRepeatableSection = {
  itemSelector: string;
  labelSingular: string;
  labelPlural: string;
  minItems?: number;
  maxItems?: number;
};

export type SchoolTemplateSection = {
  id: string;
  label: string;
  selector: string;
  description?: string;
  fields: SchoolTemplateField[];
  repeatable?: SchoolTemplateRepeatableSection;
};

export type SchoolTemplatePage = {
  slug: string;
  fileName: string;
  title: string;
  isHome?: boolean;
  sections: SchoolTemplateSection[];
};

export type SchoolTemplateAssetInventory = {
  directories: string[];
  stylesheets: string[];
  scripts: string[];
};

export type SchoolTemplateManifest = {
  templateSlug: string;
  templateName: string;
  sourceDir: string;
  entryFile: string;
  previewPath: string;
  assetInventory: SchoolTemplateAssetInventory;
  sharedSections: SchoolTemplateSection[];
  pages: SchoolTemplatePage[];
};

export function textField(
  key: string,
  label: string,
  selector: string,
  overrides: Partial<SchoolTemplateField> = {},
): SchoolTemplateField {
  return {
    key,
    label,
    selector,
    type: "text",
    target: "textContent",
    ...overrides,
  };
}

export function textareaField(
  key: string,
  label: string,
  selector: string,
  overrides: Partial<SchoolTemplateField> = {},
): SchoolTemplateField {
  return {
    key,
    label,
    selector,
    type: "textarea",
    target: "textContent",
    ...overrides,
  };
}

export function imageField(
  key: string,
  label: string,
  selector: string,
  overrides: Partial<SchoolTemplateField> = {},
): SchoolTemplateField {
  return {
    key,
    label,
    selector,
    type: "image",
    target: "attribute",
    attribute: "src",
    ...overrides,
  };
}

export function backgroundImageField(
  key: string,
  label: string,
  selector: string,
  overrides: Partial<SchoolTemplateField> = {},
): SchoolTemplateField {
  return {
    key,
    label,
    selector,
    type: "image",
    target: "backgroundImage",
    ...overrides,
  };
}

export function model3dField(
  key: string,
  label: string,
  selector: string,
  overrides: Partial<SchoolTemplateField> = {},
): SchoolTemplateField {
  return {
    key,
    label,
    selector,
    type: "model3d",
    target: "threeConfig",
    acceptedFileTypes: [".glb"],
    ...overrides,
  };
}

export function linkField(
  key: string,
  label: string,
  selector: string,
  overrides: Partial<SchoolTemplateField> = {},
): SchoolTemplateField {
  return {
    key,
    label,
    selector,
    type: "link",
    target: "attribute",
    attribute: "href",
    ...overrides,
  };
}

export function colorField(
  key: string,
  label: string,
  selector: string,
  overrides: Partial<SchoolTemplateField> = {},
): SchoolTemplateField {
  return {
    key,
    label,
    selector,
    type: "color",
    target: "inlineStyle",
    ...overrides,
  };
}

export function numberField(
  key: string,
  label: string,
  selector: string,
  overrides: Partial<SchoolTemplateField> = {},
): SchoolTemplateField {
  return {
    key,
    label,
    selector,
    type: "number",
    target: "inlineStyle",
    ...overrides,
  };
}
