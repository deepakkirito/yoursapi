import { NextResponse } from "next/server";

// Helper function to redirect and clear cookies
export function redirectToLogin(req) {
  const response = NextResponse.json(
    { message: "Please login again" },
    {
      status: 401,
    }
  );
  response.cookies.set("accessToken", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
  });
  return response;
}
