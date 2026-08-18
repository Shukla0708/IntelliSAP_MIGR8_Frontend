import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = new Set(["/sign-in", "/register"]);
const SESSION_COOKIES = ["migr8_session", "migr8_access", "migr8_token"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = SESSION_COOKIES.some((name) => request.cookies.get(name)?.value);
  const isPublic = PUBLIC_PATHS.has(pathname);

  if (!token && !isPublic) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (token && isPublic) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
