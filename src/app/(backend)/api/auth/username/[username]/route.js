import UsersModel from "@/components/backend/api/users/model";
import { dbConnect } from "@/components/backend/utilities/dbConnect";
import { NextResponse } from "next/server";

export async function HEAD(request, { params }) {
  try {
    const { username } = await params;

    await dbConnect();

    const usernameExists = await UsersModel.findOne({ username });

    if (usernameExists) {
      return NextResponse.json(
        { message: "Username not found" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Username found" },
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
