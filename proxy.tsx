import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const proxy = auth((request) => {
  if (!request.auth) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/boards/:path*"],
};
