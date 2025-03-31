import { NextResponse } from "next/server";
import { redirectToLogin } from "./components/backend/utilities/middlewares/customResponse";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_KEY;

export async function middleware(req) {
  const token = req.cookies.get("accessToken");
  const pathname = req.nextUrl.pathname;

  // Define protected and admin routes
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/settings",
    "/api/project",
    "/api/session",
    "/api/user",
    "/api/database",
    "/api/dataapi",
    "/api/authapi",
  ];

  const adminRoutes = [
    "/admin/subscriptions",
    "/admin/users",
    "/admin/projects",
  ];

  const allowedtypes = ["admin"];

  // First, check authentication for protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return redirectToLogin(req);
    }
  }

  // If the user is accessing an admin route, check role
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return redirectToLogin(req);
    }
    try {
      const { payload } = await jwtVerify(
        token.value,
        new TextEncoder().encode(JWT_SECRET),
        {
          algorithms: [process.env.ALGORITHM],
        }
      );
      const { role } = payload;
      if (!allowedtypes.includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch (error) {
      return redirectToLogin(req);
    }
  }

  return NextResponse.next();
}

// Apply middleware to selected routes
export const config = {
  matcher: [
    "/api/:path*",
    "/v1/:path*",
    "/admin/:path*",
    "/dashboard",
    "/profile",
    "/profile/:path*",
    "/database",
    "/database/:path*",
    "/projects",
    "/projects/:path*",
  ],
};
