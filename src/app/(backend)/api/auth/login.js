"use server";
import { NextResponse } from "next/server";
import { getSessionsApi } from "@/components/backend/api/session";
import { getUsersApi } from "@/components/backend/api/user";
import { catchError } from "@/components/backend/utilities/helpers/functions";
import { getLocationApi } from "@/components/backend/api/location";

export async function POST(request) {
  const { email, password } = await request.json();
  console.log(request);
  

  try {
    const user = await getUsersApi({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401, statusText: "Unauthorized" }
      );
    }
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401, statusText: "Unauthorized" }
      );
    }
    const session = await getSessionsApi({ userId: user._id });
    if (session) {
      return NextResponse.json(
        { message: "Session already exists" },
        { status: 401, statusText: "Unauthorized" }
      );
    }
    const location = await getLocationApi({ userId: user._id });
    const newSession = await getSessionsApi({
      userId: user._id,
      location: location._id,
    });
    return NextResponse.json(newSession);
  } catch (error) {
    // catchError(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 401, statusText: "Unauthorized" }
    );
  }
}