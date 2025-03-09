"use server";
import SessionsModel from "@/components/backend/api/session/model";
import { dbConnect } from "@/components/backend/utilities/dbConnect";
import getRequestDetails from "@/components/backend/utilities/middlewares/getRequestDetails";
import { convertToIST } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();

    const getDetails = await getRequestDetails(request);
    
    const token = getDetails.token.value;

    await SessionsModel.deleteOne({ jwt: token });

    const response = NextResponse.json({ message: "Logout successful" });
    response.cookies.set("accessToken", "", {
      path: "/",
      httpOnly: true,
      expires: convertToIST(new Date(0)),
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
