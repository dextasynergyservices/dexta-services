import { NextResponse, type NextRequest } from "next/server";
import { weBrandSchoolsPrisma } from "@/lib/we-brand-schools-prisma";
import {
  getReferralCookieExpiry,
  isReferralUsable,
  WE_BRAND_SCHOOLS_REFERRAL_COOKIE,
} from "@/lib/we-brand-schools-referrals";

export const dynamic = "force-dynamic";

function getWeBrandSchoolsUrl(request: NextRequest) {
  return new URL("/webrandschools", request.url);
}

function clearReferralCookie(response: NextResponse) {
  response.cookies.set({
    name: WE_BRAND_SCHOOLS_REFERRAL_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

async function recordReferralVisit({
  referralLinkId,
  slug,
}: {
  referralLinkId: string;
  slug: string;
}) {
  try {
    await weBrandSchoolsPrisma.referralEvent.create({
      data: {
        referralLinkId,
        eventType: "VISIT",
        metadata: { slug },
      },
    });
  } catch (error) {
    console.error("[recordReferralVisit]", error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const redirectResponse = NextResponse.redirect(getWeBrandSchoolsUrl(request));

  try {
    const normalizedSlug = slug.trim().toLowerCase();

    if (!/^[a-z0-9]+$/.test(normalizedSlug)) {
      clearReferralCookie(redirectResponse);
      return redirectResponse;
    }

    const referral = await weBrandSchoolsPrisma.referralLink.findUnique({
      where: { slug: normalizedSlug },
      select: {
        id: true,
        code: true,
        status: true,
        deletedAt: true,
        expiresAt: true,
      },
    });

    if (!referral || !isReferralUsable(referral)) {
      clearReferralCookie(redirectResponse);
      return redirectResponse;
    }

    redirectResponse.cookies.set({
      name: WE_BRAND_SCHOOLS_REFERRAL_COOKIE,
      value: referral.code,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: getReferralCookieExpiry(referral.expiresAt),
    });

    await recordReferralVisit({
      referralLinkId: referral.id,
      slug: normalizedSlug,
    });

    return redirectResponse;
  } catch (error) {
    console.error("[webrandschoolsReferralRoute]", error);
    return redirectResponse;
  }
}
