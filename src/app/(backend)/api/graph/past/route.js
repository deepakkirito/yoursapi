import ProjectsModel from "@/components/backend/api/project/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ApisModel from "@/components/backend/api/api/model";
import AuthsModel from "@/components/backend/api/authApi/model";

export async function GET(request) {
  try {
    // Verify user token and extract userId
    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type")?.split(",") || [];
    const projectIds = searchParams.get("project")?.split(",") || [];
    const apiIds = searchParams.get("api")?.split(",") || [];
    const date = searchParams.get("date") || "";

    const validTypes = type
      .filter((type) => Boolean(type))
      .map((type) => type + "Request");

    // Validate and convert ObjectIds
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
    const validProjectIds = projectIds
      .filter(isValidObjectId)
      .map((id) => new mongoose.Types.ObjectId(id));
    const validApiIds = apiIds
      .filter(isValidObjectId)
      .map((id) => new mongoose.Types.ObjectId(id));
    const validDate = convertToIST(new Date(date));

    return NextResponse.json({
      validApiIds,
      validProjectIds,
      validTypes,
      validDate,
    });
  } catch (error) {
    console.error("Error in getProjectOwner:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
