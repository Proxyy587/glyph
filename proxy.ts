import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy is reserved for lightweight edge checks.
 * Auth for generation is enforced in API routes; public pages stay crawlable.
 * Keep matcher empty unless you add a private route that needs a soft gate.
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
