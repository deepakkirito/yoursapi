import SessionsModel from "@/components/backend/api/session/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { redirectToLogin } from "@/components/backend/utilities/middlewares/customResponse";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { sessionId } = params;

    const session = await SessionsModel.findOne({ _id: sessionId });

    if (!session) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    await SessionsModel.findOneAndDelete({ _id: sessionId });

    if (token.value === session.jwt) {
      return redirectToLogin(request);
    }

    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
