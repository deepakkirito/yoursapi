import ProjectsModel from "@/components/backend/api/project/model";
import { validateProjectName } from "@/components/backend/api/project/validator";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { NextResponse } from "next/server";

export async function HEAD(request) {
  try {
    const projectName = request.nextUrl.searchParams.get("projectName");
    const projectId = request.nextUrl.searchParams.get("projectId");

    const { userId, token, email, name, role } = await verifyToken(request);

    const validation = validateRequest(request, validateProjectName);

    if (validation) {
      return validation;
    }

    const { ownerUserId, ownerUsername, ownerEmail, ownerName } =
      await getProjectOwner(request, userId);

    const projects = await ProjectsModel.find({
      name: projectName,
      userId: ownerUserId,
    });

    if (projects) {
      return NextResponse.json({ message: "Project found" }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Project not found" },
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
