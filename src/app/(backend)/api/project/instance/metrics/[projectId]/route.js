import { periodToMs } from "@/components/assets/constants/instance";
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
    const type = searchParams.get("type") || "metrics";
    const period = searchParams.get("period");

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

    let filteredData = docker[type];
    if (period && periodToMs[period]) {
      const now = Date.now();
      const cutoff = now - periodToMs[period];

      filteredData = filteredData.filter((entry) => {
        const entryTime = new Date(entry.timestamp).getTime(); // convert ISO to ms
        return entryTime >= cutoff;
      });
    }

    return NextResponse.json({ [type]: filteredData });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
