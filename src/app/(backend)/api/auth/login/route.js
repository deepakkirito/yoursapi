"use server";
import { loginValidator } from "@/components/backend/api/auth/validator";
import LocationModel from "@/components/backend/api/location/model";
import SessionsModel from "@/components/backend/api/session/model";
import UsersModel from "@/components/backend/api/users/model";
import { dbConnect } from "@/components/backend/utilities/dbConnect";
import generateToken from "@/components/backend/utilities/helpers/generateToken";
import { comparePassword } from "@/components/backend/utilities/helpers/password";
import { getSessionDetails } from "@/components/backend/utilities/helpers/session";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { sendMail } from "@/components/backend/utilities/nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    const errorResponse = await validateRequest(
      { ...request, body },
      loginValidator
    );
    if (errorResponse) {
      return errorResponse;
    }

    const sessionDetails = await getSessionDetails(request);

    const { email, password, rememberMe } = body;

    const user = await UsersModel.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    if (!user.isVerified) {
      const verifyToken = generateToken(user, process.env.VERIFY_EXPIRES);

      await sendMail({
        to: user.email,
        subject: "Verify your email",
        template: "verification",
        context: { username: user.name, token: verifyToken },
      });

      return NextResponse.json(
        { message: "Please verify your email before login!!!" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const authToken = generateToken(
      user,
      rememberMe ? process.env.AUTH_EXPIRES_REMEMBER : process.env.AUTH_EXPIRES
    );

    const location = await LocationModel.findOne({ userId: user._id });
    if (location) {
      const session = new SessionsModel({
        jwt: authToken,
        userId: user._id,
        location: location._id,
        createdAt: new Date(),
        lastActive: new Date(),
      });
      await session.save();
    } else {
      const location = new LocationModel({
        userId: user._id,
        ip: sessionDetails.ip,
        browser: sessionDetails.browser,
        os: sessionDetails.os,
        device: sessionDetails.device,
        country: sessionDetails.country,
        region: sessionDetails.region,
        city: sessionDetails.city,
        lat: sessionDetails.lat,
        lon: sessionDetails.lon,
      });
      await location.save();

      const session = new SessionsModel({
        jwt: authToken,
        userId: user._id,
        location: location._id,
        createdAt: new Date(),
        lastActive: new Date(),
      });
      await session.save();

      await sendMail({
        to: user.email,
        subject: "New Login Notification",
        template: "login",
        context: {
          username: user.name,
          loginDate: new Date(),
          location: `${sessionDetails.city}, ${sessionDetails.country}`,
          device: sessionDetails.device,
          browser: sessionDetails.browser,
          ip: sessionDetails.ip,
          os: sessionDetails.os,
          securityLink: `${process.env.COMPANY_URL}login`,
        },
      });
    }

    const response = NextResponse.json(
      { message: "Login Successfully" },
      { status: 200 }
    );

    response.cookies.set("accessToken", authToken, {
      httpOnly: true, // Prevent client-side access
      secure: process.env.NODE_ENV === "production", // Secure in production
      maxAge: rememberMe
        ? process.env.AUTH_EXPIRES_REMEMBER
        : process.env.AUTH_EXPIRES,
      path: "/",
      sameSite: "lax", // Strictly follow the same-site cookie policy
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 401, statusText: "Unauthorized" }
    );
  }
}
