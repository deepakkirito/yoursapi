import SessionsModel from "@/components/backend/api/session/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const sessionId = request.nextUrl.searchParams.get("sessionId");

    const session = await SessionsModel.findOneAndDelete({ _id: sessionId });

    if (!session) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    const updatedSession = await SessionsModel.findOne({ userId });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
