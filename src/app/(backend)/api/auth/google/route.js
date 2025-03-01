import LocationModel from "@/components/backend/api/location/model";
import SessionsModel from "@/components/backend/api/session/model";
import UsersModel from "@/components/backend/api/users/model";
import { dbConnect } from "@/components/backend/utilities/dbConnect";
import generateToken from "@/components/backend/utilities/helpers/generateToken";
import {
  generatePassword,
  hashPassword,
} from "@/components/backend/utilities/helpers/password";
import { getSessionDetails } from "@/components/backend/utilities/helpers/session";
import { sendMail } from "@/components/backend/utilities/nodemailer";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const sessionDetails = await getSessionDetails(request);

    const body = await request.json();

    const { access_token } = body;

    // Fetch user info from Google
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const { email, name, picture, email_verified } = data;

    if (!email_verified) {
      return NextResponse.json(
        { message: "Email not verified" },
        { status: 401 }
      );
    }

    await dbConnect();

    let user = await UsersModel.findOne({ email });

    let isNewUser = false;
    let password = null;

    if (!user) {
      isNewUser = true;
      password = await generatePassword({
        length: 12,
        specialCharacters: false,
        numbers: true,
        uppercase: true,
        lowercase: true,
      });

      const hashedPassword = await hashPassword(password);

      user = await UsersModel.create({
        name,
        email,
        password: hashedPassword,
        username: "",
        profile: picture,
        isVerified: email_verified,
      });
    }

    const token = generateToken(user, process.env.AUTH_EXPIRES_REMEMBER);

    const existingLocation = await LocationModel.findOne({
      userId: user._id,
      ip: sessionDetails.ip,
      browser: sessionDetails.browser,
      os: sessionDetails.os,
      device: sessionDetails.device,
      country: sessionDetails.country,
      region: sessionDetails.region,
      city: sessionDetails.city,
    });

    if (existingLocation) {
      await SessionsModel.create({
        jwt: token,
        userId: user._id,
        location: existingLocation._id,
        createdAt: new Date(),
        lastActive: new Date(),
      });
    } else {
      const newLocation = await LocationModel.create({
        ip: sessionDetails.ip,
        browser: sessionDetails.browser,
        os: sessionDetails.os,
        device: sessionDetails.device,
        country: sessionDetails.country,
        region: sessionDetails.region,
        city: sessionDetails.city,
        lat: sessionDetails.lat,
        lon: sessionDetails.lon,
        userId: user._id,
      });

      await SessionsModel.create({
        jwt: token,
        userId: user._id,
        location: newLocation._id,
        createdAt: new Date(),
        lastActive: new Date(),
      });

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
          securityLink: `${process.env.COMPANY_URL}login`,
          os: sessionDetails.os,
        },
      });
    }

    if (isNewUser) {
      await sendMail({
        to: user.email,
        subject: `Welcome to ${process.env.COMPANY_NAME}`,
        template: "signupGoogle",
        context: { username: user.name, email: user.email, password },
      });
    }

    const response = NextResponse.json(
      { message: "Login Successfully", user: !!user.username },
      { status: 200 }
    );

    response.cookies.set("accessToken", token, {
      httpOnly: true, // Prevent client-side access
      secure: process.env.NODE_ENV === "production", // Secure in production
      maxAge: process.env.AUTH_EXPIRES_REMEMBER,
      path: "/",
      sameSite: "lax", // Strictly follow the same-site cookie policy
    });

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
