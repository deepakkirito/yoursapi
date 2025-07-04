import ProjectsModel from "@/components/backend/api/project/model";
import { validateProjectName } from "@/components/backend/api/project/validator";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";

export async function HEAD(request, { params }) {
  try {
    const { projectName } = await params;

    const { userId, token, email, name, role } = await verifyToken(request);

    const projects = await ProjectsModel.findOne({ name: projectName, userId });

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
