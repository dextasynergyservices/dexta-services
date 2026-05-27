import { createHmac, createHash, randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MAX_GLB_UPLOAD_BYTES = 25_000_000;
const GLB_MAGIC = 0x46546c67;
const R2_REGION = "auto";
const R2_SERVICE = "s3";

function getR2Config() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim();
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim();

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucket ||
    !publicBaseUrl
  ) {
    throw new Error("Cloudflare R2 model upload settings are missing.");
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl: publicBaseUrl.replace(/\/+$/, ""),
  };
}

function hashHex(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function getSigningKey(secretAccessKey: string, dateStamp: string) {
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, R2_REGION);
  const serviceKey = hmac(regionKey, R2_SERVICE);
  return hmac(serviceKey, "aws4_request");
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodeObjectKey(key: string) {
  return key.split("/").map(encodePathSegment).join("/");
}

function sanitizeBaseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.glb$/i, "");
  const safeName = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return safeName || "model";
}

function getR2ObjectUrl(publicBaseUrl: string, key: string) {
  return `${publicBaseUrl}/${encodeObjectKey(key)}`;
}

function getAmzDateParts(date = new Date()) {
  const isoDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    amzDate: isoDate,
    dateStamp: isoDate.slice(0, 8),
  };
}

function createR2RequestHeaders({
  method,
  accessKeyId,
  secretAccessKey,
  host,
  path,
  body = "",
  contentType,
}: {
  method: "GET" | "HEAD" | "PUT";
  accessKeyId: string;
  secretAccessKey: string;
  host: string;
  path: string;
  body?: Buffer | string;
  contentType?: string;
}) {
  const { amzDate, dateStamp } = getAmzDateParts();
  const payloadHash = hashHex(body);
  const credentialScope = `${dateStamp}/${R2_REGION}/${R2_SERVICE}/aws4_request`;
  const signedHeaders = contentType
    ? "content-type;host;x-amz-content-sha256;x-amz-date"
    : "host;x-amz-content-sha256;x-amz-date";
  const canonicalHeaders =
    (contentType ? `content-type:${contentType}\n` : "") +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const canonicalRequest = [
    method,
    path,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashHex(canonicalRequest),
  ].join("\n");
  const signature = createHmac(
    "sha256",
    getSigningKey(secretAccessKey, dateStamp),
  )
    .update(stringToSign)
    .digest("hex");

  return {
    Authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
    "X-Amz-Content-Sha256": payloadHash,
    "X-Amz-Date": amzDate,
  };
}

function isValidGlb(buffer: Buffer) {
  return buffer.byteLength >= 12 && buffer.readUInt32LE(0) === GLB_MAGIC;
}

function getR2ObjectRequestParts(
  config: ReturnType<typeof getR2Config>,
  key: string,
) {
  const encodedKey = encodeObjectKey(key);
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const path = `/${encodePathSegment(config.bucket)}/${encodedKey}`;

  return { host, path };
}

function getModelProxyUrl(key: string) {
  return `/api/r2/models?key=${encodeURIComponent(key)}`;
}

async function proxyR2Model(
  request: globalThis.Request,
  method: "GET" | "HEAD",
) {
  let config: ReturnType<typeof getR2Config>;
  try {
    config = getR2Config();
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "R2 is not configured.",
      },
      { status: 500 },
    );
  }

  const key = new URL(request.url).searchParams.get("key")?.trim();
  if (
    !key ||
    key.startsWith("/") ||
    key.includes("..") ||
    !/\.glb$/i.test(key)
  ) {
    return NextResponse.json({ error: "Invalid model key." }, { status: 400 });
  }

  const { host, path } = getR2ObjectRequestParts(config, key);
  const response = await fetch(`https://${host}${path}`, {
    method,
    headers: createR2RequestHeaders({
      method,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      host,
      path,
    }),
  });

  if (!response.ok) {
    return new NextResponse(method === "HEAD" ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  const headers = new globalThis.Headers({
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": "model/gltf-binary",
  });
  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new NextResponse(method === "HEAD" ? null : response.body, {
    status: response.status,
    headers,
  });
}

export async function GET(request: globalThis.Request) {
  return proxyR2Model(request, "GET");
}

export async function HEAD(request: globalThis.Request) {
  return proxyR2Model(request, "HEAD");
}

export async function POST(request: globalThis.Request) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let config: ReturnType<typeof getR2Config>;
  try {
    config = getR2Config();
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "R2 is not configured.",
      },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof globalThis.File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (!/\.glb$/i.test(file.name)) {
    return NextResponse.json(
      { error: "Only .glb model uploads are allowed." },
      { status: 400 },
    );
  }

  if (file.size > MAX_GLB_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "GLB model uploads must be 25 MB or smaller." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isValidGlb(buffer)) {
    return NextResponse.json(
      { error: "This file is not a valid GLB model." },
      { status: 400 },
    );
  }

  const key = `school-models/${randomUUID()}-${sanitizeBaseName(file.name)}.glb`;
  const { host, path } = getR2ObjectRequestParts(config, key);
  const contentType = "model/gltf-binary";
  const uploadResponse = await fetch(`https://${host}${path}`, {
    method: "PUT",
    headers: createR2RequestHeaders({
      method: "PUT",
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      host,
      path,
      body: buffer,
      contentType,
    }),
    body: buffer,
  });

  if (!uploadResponse.ok) {
    const responseText = await uploadResponse.text().catch(() => "");
    console.error("[R2 Model Upload]", uploadResponse.status, responseText);
    return NextResponse.json(
      { error: "Failed to upload GLB model to R2." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    url: getModelProxyUrl(key),
    publicUrl: getR2ObjectUrl(config.publicBaseUrl, key),
    key,
    size: buffer.byteLength,
  });
}
