import UsersModel from "@/components/backend/api/users/model";
import { dbConnect } from "@/components/backend/utilities/dbConnect";
import { NextResponse } from "next/server";

export async function HEAD(request, { params }) {
  try {
    const { email } = await params;

    await dbConnect();

    const emailExists = await UsersModel.findOne({ email });

    if (emailExists) {
      return NextResponse.json({ message: "Email not found" }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Email found" },
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
