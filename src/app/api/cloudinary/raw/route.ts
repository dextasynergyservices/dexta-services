import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";

function getAllowedCloudinaryUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") {
      return null;
    }

    if (!url.pathname.includes("/raw/upload/")) {
      return null;
    }

    if (!url.pathname.toLowerCase().endsWith(".glb")) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export async function GET(request: globalThis.Request) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sourceUrl = getAllowedCloudinaryUrl(
    new URL(request.url).searchParams.get("url"),
  );

  if (!sourceUrl) {
    return NextResponse.json({ error: "Invalid model URL" }, { status: 400 });
  }

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to load model" },
      { status: response.status },
    );
  }

  return new NextResponse(response.body, {
    headers: {
      "Cache-Control": "private, max-age=300",
      "Content-Type": "model/gltf-binary",
    },
  });
}
