import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function injectBaseHref(html: string) {
  if (/<base\s/i.test(html)) {
    return html;
  }

  const baseMarkup = '<base href="/dexta-academy-3/">';
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match) => `${match}\n    ${baseMarkup}`);
  }

  return `${baseMarkup}\n${html}`;
}

export async function GET() {
  const sourcePath = path.join(
    process.cwd(),
    "src",
    "app",
    "(public)",
    "dexta-academy-3",
    "index.html",
  );
  const html = injectBaseHref(await readFile(sourcePath, "utf8"));

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
