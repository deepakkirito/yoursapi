import DockersModel from "@/components/backend/api/docker/model";
import ProjectsModel from "@/components/backend/api/project/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { projectId } = await params;

    const { userId, token, email, name, role } = await verifyToken(request);

    const searchParams = new URL(request.url).searchParams;
    const environment = searchParams.get("environment") || "production";

    const { ownerUserId } = await getProjectOwner({ userId, projectId });

    const project = await ProjectsModel.findOne({
      _id: projectId,
      userId: ownerUserId,
    }).lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    const containerId = project.data[environment].instance.containerId;

    if (!containerId) {
      return NextResponse.json(
        {
          message: "Start your instance to get performance metrics",
        },
        {
          status: 400,
        }
      );
    }

    const docker = await DockersModel.findOne({
      containerId: containerId,
    }).lean();

    return NextResponse.json(docker);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
