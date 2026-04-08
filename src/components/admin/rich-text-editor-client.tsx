"use client";

import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/models/dom";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/autolink";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/help";
import "tinymce/plugins/help/js/i18n/keynav/en";
import "tinymce/plugins/lists";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";
import "tinymce/themes/silver";
import { Editor } from "@tinymce/tinymce-react";

export type RichTextEditorClientProps = {
  disabled?: boolean;
  minHeight?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

const FONT_FAMILY_FORMATS = [
  "Montserrat=Montserrat,sans-serif",
  "Clash Display=var(--font-clash-display),system-ui,sans-serif",
  "Arial=Arial,Helvetica,sans-serif",
  "Georgia=Georgia,serif",
  "Times New Roman='Times New Roman',Times,serif",
  "Courier New='Courier New',Courier,monospace",
].join(";");

const FONT_SIZE_FORMATS = [
  "10px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "40px",
  "48px",
  "56px",
  "64px",
].join(" ");

export function RichTextEditorClient({
  disabled = false,
  minHeight = 220,
  onChange,
  placeholder,
  value,
}: RichTextEditorClientProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#0d0d0d]">
      <Editor
        disabled={disabled}
        licenseKey="gpl"
        init={{
          autoresize_bottom_margin: 16,
          autoresize_max_height: 520,
          autoresize_min_height: minHeight,
          body_class: "dexta-tinymce-body",
          branding: false,
          browser_spellcheck: true,
          content_css: false,
          content_style: `
            body {
              background: #0d0d0d;
              color: #f5f5f5;
              font-family: Montserrat, system-ui, sans-serif;
              font-size: 16px;
              margin: 0;
              padding: 16px;
            }
            p {
              margin: 0 0 0.85rem;
            }
            p:last-child {
              margin-bottom: 0;
            }
          `,
          font_family_formats: FONT_FAMILY_FORMATS,
          font_size_formats: FONT_SIZE_FORMATS,
          menubar: false,
          min_height: minHeight,
          plugins:
            "autolink charmap code help lists quickbars visualchars wordcount",
          placeholder,
          promotion: false,
          quickbars_insert_toolbar: false,
          quickbars_selection_toolbar:
            "fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | removeformat",
          resize: true,
          skin: false,
          statusbar: true,
          toolbar:
            "undo redo | fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright | bullist numlist | removeformat | visualchars code",
          toolbar_mode: "wrap",
        }}
        onEditorChange={onChange}
        value={value}
      />
    </div>
  );
}
