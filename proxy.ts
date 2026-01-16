import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Your "middleware" logic goes here
  void request;
  return NextResponse.next();
}

export const config = {
  matcher: "/about/:path*",
};
