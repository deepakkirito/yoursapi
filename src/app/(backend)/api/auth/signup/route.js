import UsersModel from "@/components/backend/api/users/model";
import { dbConnect } from "@/components/backend/utilities/dbConnect";
import { NextResponse } from "next/server";
import { hashPassword } from "@/components/backend/utilities/helpers/password";
import generateToken from "@/components/backend/utilities/helpers/generateToken";
import { sendMail } from "@/components/backend/utilities/nodemailer";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { signupValidator } from "@/components/backend/api/auth/validator";

export async function POST(request) {
  try {
    const body = await request.json();

    const validator = await validateRequest({ ...request, body }, signupValidator);

    if (validator) {
      return validator;
    }

    const { email, password, username, firstname, lastname, referralCode } =
      body;

    const name = `${firstname} ${lastname}`;

    await dbConnect();

    let referredBy = null;
    if (referralCode) {
      const referrer = await UsersModel.findOne({ referralCode });
      if (!referrer) {
        return NextResponse.json(
          {
            message: "Invalid referral code",
          },
          {
            status: 400,
          }
        );
      }
      referredBy = referrer._id;
    }

    const checkExistingUser = await UsersModel.findOne({ email });
    if (checkExistingUser) {
      return NextResponse.json(
        {
          message: "User already exists",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await UsersModel.create({
      name,
      username,
      email,
      password: hashedPassword,
      referralCode,
      referredBy,
    });

    const token = generateToken(user, process.env.VERIFY_EXPIRES, "signup");

    await sendMail({
      to: email,
      subject: "Verify your email",
      template: "verification",
      context: { username: name, token },
    });

    return NextResponse.json(
      {
        message: "Sign up successfully. Verify your email before login!!!",
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
