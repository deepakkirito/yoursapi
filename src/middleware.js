import { NextResponse } from "next/server";
import { redirectToLogin } from "./components/backend/utilities/middlewares/customResponse";

export async function middleware(req) {
  const token = req.cookies.get("accessToken");

  const protectedRoutes = [
    "/dashboard",
    "/admin",
    "/profile",
    "/settings",
    "/api/auth/logout",
    "/api/project",
    "/api/session",
    "/api/user",
  ];

  // If route is protected, check authentication
  if (protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return redirectToLogin(req);
    }
  }

  return NextResponse.next();
}

// Apply middleware to multiple routes
export const config = {
  matcher: ["/api/:path*"],
  runtime: "nodejs",
};
