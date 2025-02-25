import { NextResponse } from "next/server";

// Helper function to redirect and clear cookies
export function redirectToLogin(req) {
  const response = NextResponse.redirect(new URL("/login", req.url));
  response.cookies.set("accessToken", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
  });
  return response;
}