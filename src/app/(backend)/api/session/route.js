import SessionsModel from "@/components/backend/api/session/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const session = await SessionsModel.findOne({ userId });

    const updatedSession = session.map((item) => {
      if (item.jwt === token.value) {
        return {
          _id: item._id,
          location: item.location,
          lastActive: item.lastActive,
          current: true,
          createdAt: item.createdAt,
        };
      }
      return {
        _id: item._id,
        location: item.location,
        lastActive: item.lastActive,
        current: false,
        createdAt: item.createdAt,
      };
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
