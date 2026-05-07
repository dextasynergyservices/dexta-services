import { NextResponse, type NextRequest } from "next/server";
import { processReferralExpiryNotifications } from "@/lib/we-brand-schools-referral-expiry-notifications";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${configuredSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const result = await processReferralExpiryNotifications();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
