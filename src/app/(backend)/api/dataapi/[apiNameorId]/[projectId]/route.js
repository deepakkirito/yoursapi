import ApisModel from "@/components/backend/api/api/model";
import { validateApiName } from "@/components/backend/api/api/validator";
import AuthsModel from "@/components/backend/api/authApi/model";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { NextResponse } from "next/server";

export async function HEAD(request, { params }) {
  try {
    const { userId, username } = await verifyToken(request);

    const { projectId, apiNameorId } = await params;

    const validation = await validateRequest(
      { ...request, body: { apiName: apiNameorId } },
      validateApiName
    );

    if (validation) {
      return validation;
    }

    const { ownerUserId } = await getProjectOwner({ projectId, userId });

    const checkApi = await ApisModel.findOne({
      projectId,
      name: apiNameorId,
      userId: ownerUserId,
    });

    const checkAuthApi = await AuthsModel.findOne({
      projectId,
      name: apiNameorId,
      userId: ownerUserId,
    });
    console.log(checkApi, checkAuthApi);
    
    if (checkApi || checkAuthApi) {
      return NextResponse.json(
        {
          message: "API found",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "API not found" }, { status: 200 });
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

