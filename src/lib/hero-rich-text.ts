export type HeroRichTextMode = "inline" | "block";

const HTML_TAG_PATTERN = /<[^>]+>/;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function normalizeHeroRichText(
  value: string | null | undefined,
  mode: HeroRichTextMode,
) {
  const input = value?.trim() ?? "";

  if (!input) {
    return "";
  }

  if (HTML_TAG_PATTERN.test(input)) {
    return input;
  }

  const escaped = escapeHtml(input).replace(/\r?\n/g, "<br />");

  return mode === "block" ? `<p>${escaped}</p>` : escaped;
}
