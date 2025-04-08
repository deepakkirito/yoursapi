import ProjectsModel from "@/components/backend/api/project/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { axiosGet } from "@/utilities/api";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { projectId } = await params;

    const { userId, token, email, name, role } = await verifyToken(request);

    const { ownerUserId, ownerEmail } = await getProjectOwner({
      userId,
      projectId,
    });

    const searchParams = new URL(request.url).searchParams;
    const environment = searchParams.get("environment") || "production";

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
      return NextResponse.json({ message: "Instance not running" });
    }

    await axiosGet(
      `/docker/logs?containerId=${containerId}&environment=${environment}&email=${ownerEmail}&projectId=${projectId}`
    );

    return NextResponse.json({
      message: "Logs retrieving successfully",
      containerId,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
