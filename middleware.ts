import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const TARGET_HOSTNAME = "qrpaymentcz.invoicetable.com";

export function middleware(req: NextRequest) {
  const hostHeader = req.headers.get("host") ?? "";
  const hostname = hostHeader.split(":")[0].toLowerCase();

  if (hostname !== TARGET_HOSTNAME) return NextResponse.next();

  // Only intercept root path. Query string is preserved by rewriting the pathname.
  if (req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/api/qrpaymentcz";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};

