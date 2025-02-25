import SessionsModel from "@/components/backend/api/session/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";
import LocationsModel from "@/components/backend/api/location/model";

export async function GET(request) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const session = await SessionsModel.find({ userId }).populate("location").lean();

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
