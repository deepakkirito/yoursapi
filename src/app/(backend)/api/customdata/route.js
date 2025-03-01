import CustomDataModel from "@/components/backend/customData/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId, username } = await verifyToken(request);

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");
    const size = searchParams.get("size");

    if (id && size) {
      const customData = await CustomDataModel.findOne({
        _id: id,
      });
      if (!customData) {
        return NextResponse.json(
          {
            message: "Custom data not found",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(customData.data.slice(0, size));
    }

    const customDataList = await CustomDataModel.find({}, { name: 1 });

    if (!customDataList) {
      return NextResponse.json(
        {
          message: "Custom data not found",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(customDataList);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
