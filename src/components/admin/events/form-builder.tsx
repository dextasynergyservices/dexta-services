"use client";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventFormData } from "@/lib/validators";

const fieldTypes = [
  { value: "TEXT", label: "Text" },
  { value: "EMAIL", label: "Email" },
  { value: "SELECT", label: "Dropdown" },
  { value: "TEXTAREA", label: "Text Area" },
  { value: "URL", label: "URL" },
  { value: "CHECKBOX", label: "Checkbox" },
] as const;

interface FormBuilderProps {
  form: UseFormReturn<EventFormData>;
}

function toFieldName(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_");
}

export function FormBuilder({ form }: FormBuilderProps) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "formFields",
  });

  const addField = () => {
    append({
      name: "",
      label: "",
      type: "TEXT",
      placeholder: "",
      required: false,
      options: "",
      position: fields.length,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">
            Registration Form Fields
          </h3>
          <p className="text-xs text-[#666]">
            Name and Email are always included. Add custom fields below.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addField}
          className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add field
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="rounded-lg border border-dashed border-[#333] px-4 py-8 text-center text-sm text-[#555]">
          No custom fields yet. Click &quot;Add field&quot; to start building
          the form.
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const fieldType = form.watch(`formFields.${index}.type`);

          return (
            <div
              key={field.id}
              className="rounded-lg border border-[#222] bg-[#0d0d0d] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-[#666]">
                  Field {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    className="h-7 w-7 p-0 text-[#666] hover:text-white disabled:opacity-30"
                    aria-label="Move field up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                    className="h-7 w-7 p-0 text-[#666] hover:text-white disabled:opacity-30"
                    aria-label="Move field down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-7 w-7 p-0 text-[#666] hover:text-red-400"
                    aria-label="Remove field"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Label */}
                <div>
                  <Label className="mb-1 text-xs text-[#888]">Label</Label>
                  <Input
                    placeholder="e.g. Tech Stack"
                    className="border-[#2a2a2a] bg-[#111] text-white placeholder-[#444]"
                    {...form.register(`formFields.${index}.label`, {
                      onChange: (e) => {
                        const name = toFieldName(e.target.value);
                        form.setValue(`formFields.${index}.name`, name);
                        form.setValue(`formFields.${index}.position`, index);
                      },
                    })}
                  />
                </div>

                {/* Type */}
                <div>
                  <Label className="mb-1 text-xs text-[#888]">Type</Label>
                  <Select
                    value={fieldType}
                    onValueChange={(val) =>
                      form.setValue(
                        `formFields.${index}.type`,
                        val as EventFormData["formFields"][number]["type"],
                      )
                    }
                  >
                    <SelectTrigger
                      className="border-[#2a2a2a] bg-[#111] text-white"
                      aria-label="Field type"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#2a2a2a] bg-[#111]">
                      {fieldTypes.map((t) => (
                        <SelectItem
                          key={t.value}
                          value={t.value}
                          className="text-white focus:bg-[#1a1a1a] focus:text-white"
                        >
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Placeholder */}
                <div>
                  <Label className="mb-1 text-xs text-[#888]">
                    Placeholder
                  </Label>
                  <Input
                    placeholder="Optional placeholder text"
                    className="border-[#2a2a2a] bg-[#111] text-white placeholder-[#444]"
                    {...form.register(`formFields.${index}.placeholder`)}
                  />
                </div>

                {/* Required toggle */}
                <div className="flex items-end gap-3 pb-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`required-${index}`}
                      checked={form.watch(`formFields.${index}.required`)}
                      onCheckedChange={(checked) =>
                        form.setValue(`formFields.${index}.required`, checked)
                      }
                    />
                    <Label
                      htmlFor={`required-${index}`}
                      className="text-xs text-[#888]"
                    >
                      Required
                    </Label>
                  </div>
                </div>

                {/* Options (only for SELECT type) */}
                {fieldType === "SELECT" && (
                  <div className="sm:col-span-2">
                    <Label className="mb-1 text-xs text-[#888]">
                      Options (comma-separated)
                    </Label>
                    <Input
                      placeholder="e.g. Frontend, Backend, Full Stack"
                      className="border-[#2a2a2a] bg-[#111] text-white placeholder-[#444]"
                      {...form.register(`formFields.${index}.options`)}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
