import ProjectsModel from "@/components/backend/api/project/model";
import { NextResponse } from "next/server";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import AuthsModel from "@/components/backend/api/authApi/model";
import ApisModel from "@/components/backend/api/api/model";

export async function GET(request) {
  try {
    const { userId } = await verifyToken(request);

    const projects = await ProjectsModel.find({ userId }, { name: 1, _id: 1 })
      .populate("apiIds", "name")
      .populate("authId", "name")
      .lean();

    const modifiedProjects = projects.map((project) => {
      return {
        name: project.name,
        _id: project._id,
        apis: [...project.apiIds, ...(project.authId ? [project.authId] : [])],
      };
    });

    return NextResponse.json(modifiedProjects);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
