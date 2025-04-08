import UsersModel from "@/components/backend/api/users/model";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendMail } from "@/components/backend/utilities/nodemailer";
import { dbConnect } from "@/components/backend/utilities/dbConnect";

export async function GET(request, { params }) {
  try {
    const { token } = await params;

    let decoded = {};

    try {
      decoded = jwt.verify(token, process.env.JWT_KEY);
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json(
          { message: "Verify link expired. Please login to get a new link" },
          { status: 401, statusText: "Unauthorized" }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { message: "Verify link expired. Please login to get a new link" },
        { status: 401, statusText: "Unauthorized" }
      );
    }    

    await dbConnect();

    const user = await UsersModel.findOne({ _id: decoded.userId });
    console.log(user);
    
    if (!user) {
      return NextResponse.json(
        { message: "Verify token expired" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    if (decoded.type !== "signup" && decoded.type !== "login") {
      return NextResponse.json(
        { message: "Verify token expired" },
        { status: 400 }
      );
    }

    await UsersModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { isVerified: true } },
      { new: true, lean: true }
    );

    sendMail({
      to: user.email,
      subject: `Welcome to ${process.env.COMPANY_NAME}`,
      template: "signup",
      context: { username: user.name },
    });

    return NextResponse.json(
      { message: "Verification successful" },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
