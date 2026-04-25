import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdminSession } from "@/lib/admin-auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: globalThis.Request) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { paramsToSign } = body;

  if (!paramsToSign || typeof paramsToSign !== "object") {
    return NextResponse.json(
      { error: "paramsToSign is required" },
      { status: 400 },
    );
  }

  const resourceType = (paramsToSign as { resource_type?: string })
    .resource_type;
  if (
    resourceType &&
    !["image", "video", "raw", "auto"].includes(resourceType)
  ) {
    return NextResponse.json(
      {
        error:
          "Only image, video, and GLB model uploads are allowed from the admin widget",
      },
      { status: 400 },
    );
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return NextResponse.json({ signature });
}
