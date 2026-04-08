"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { RichTextEditorClientProps } from "./rich-text-editor-client";

const RichTextEditorComponent = dynamic(
  () =>
    import("./rich-text-editor-client").then(
      (module) =>
        module.RichTextEditorClient as ComponentType<RichTextEditorClientProps>,
    ),
  {
    loading: () => (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-6 text-sm text-[#666]">
        Loading editor…
      </div>
    ),
    ssr: false,
  },
);

export function RichTextEditor(props: RichTextEditorClientProps) {
  return <RichTextEditorComponent {...props} />;
}
