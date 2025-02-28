import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { resetValidator } from "@/components/backend/api/auth/validator";
import { hashPassword } from "@/components/backend/utilities/helpers/password";
import UsersModel from "@/components/backend/api/users/model";
import { sendMail } from "@/components/backend/utilities/nodemailer";
import { dbConnect } from "@/components/backend/utilities/dbConnect";

export async function POST(request, { params }) {
  try {
    const { token } = await params;    

    let decoded = {};

    const body = await request.json();

    try {
      decoded = jwt.verify(token, process.env.JWT_KEY);
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json(
          { message: "Reset link expired. Please generate a new one" },
          { status: 401, statusText: "Unauthorized" }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { message: "Reset link expired. Please generate a new one" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const validation = await validateRequest({...request, body}, resetValidator);

    if (validation) {
      return validation;
    }

    const { newPassword } = body;

    const password = await hashPassword(newPassword);

    await dbConnect();

    const user = await UsersModel.findOneAndUpdate(
      { _id: decoded.userId },
      { $set: { password } },
      { new: true, lean: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "Reset token expired" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    sendMail({
      to: user.email,
      subject: "Your password has been reset",
      template: "password",
      context: { username: user.name },
    });

    return NextResponse.json(
      { message: "Password reset successfully" },
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
