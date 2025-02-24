import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import SessionsModel from "./components/backend/api/session/model";
// import { dbConnect } from "./components/backend/utilities/dbConnect";

export async function middleware(req) {
  const token = req.cookies.get("accessToken");

  const protectedRoutes = [
    "/dashboard",
    "/admin",
    "/profile",
    "/settings",
    "/api/auth/logout",
  ];

  // If route is protected, check authentication
  if (protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return redirectToLogin(req);
    }

    // try {
    //   await dbConnect();

    //   // Verify JWT token
    //   const decoded = jwt.verify(token, process.env.JWT_KEY);
    //   if (!decoded?.userId && !decoded?.sub) {
    //     await SessionsModel.deleteOne({ jwt: token });
    //     return redirectToLogin(req);
    //   }

    //   // Find active user sessions
    //   const sessions = await SessionsModel.find({
    //     userId: decoded.userId || decoded.sub,
    //   });

    //   if (!sessions.length) {
    //     return redirectToLogin(req);
    //   }

    //   // Check if any sessions have expired
    //   for (const session of sessions) {
    //     try {
    //       const sessionDecoded = jwt.verify(session.jwt, process.env.JWT_KEY);

    //       if (sessionDecoded.exp < Math.floor(Date.now() / 1000)) {
    //         await SessionsModel.deleteOne({ jwt: session.jwt });

    //         if (session.jwt === token) {
    //           return redirectToLogin(req);
    //         }
    //       }
    //     } catch (err) {
    //       await SessionsModel.deleteOne({ jwt: session.jwt });
    //     }
    //   }
    // } catch (err) {
    //   console.error("JWT verification error:", err.message);
    //   return redirectToLogin(req);
    // }
  }

  return NextResponse.next();
}

// Helper function to redirect and clear cookies
function redirectToLogin(req) {
  const response = NextResponse.redirect(new URL("/login", req.url));
  response.cookies.set("accessToken", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
  });
  return response;
}

// Apply middleware to multiple routes
export const config = {
  matcher: ["/api/:path*"],
  runtime: "nodejs",
  plugins: {
    tailwindcss: {},
  },
};
