import UsersModel from "@/components/backend/api/users/model";
import { dbConnect } from "@/components/backend/utilities/dbConnect";
import generateToken from "@/components/backend/utilities/helpers/generateToken";
import { sendMail } from "@/components/backend/utilities/nodemailer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const { email } = body;

    await dbConnect();

    const checkEmail = await UsersModel.findOne({ email });

    if (!checkEmail) {
      return NextResponse.json(
        { message: "Email not found" },
        { status: 400 }
      );
    }

    const token = generateToken(checkEmail, process.env.VERIFY_EXPIRES, "signup");

    await sendMail({
      to: email,
      subject: "Reset your password",
      template: "reset",
      context: { username: checkEmail.name, token },
    });

    return NextResponse.json(
      {
        message: "Password reset link sent successfully",
      },
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
