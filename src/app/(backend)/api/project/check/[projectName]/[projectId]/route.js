import ProjectsModel from "@/components/backend/api/project/model";
import { validateProjectName } from "@/components/backend/api/project/validator";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { NextResponse } from "next/server";

export async function HEAD(request, { params }) {
  try {
    const { projectName, projectId } = await params;

    const { userId, token, email, name, role } = await verifyToken(request);

    const validation = await validateRequest(
      { ...request, body: { projectName } },
      validateProjectName
    );

    if (validation) {
      return validation;
    }

    const { ownerUserId, ownerUsername, ownerEmail, ownerName } =
      await getProjectOwner({ userId, projectId });

    const projects = await ProjectsModel.findOne({
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
