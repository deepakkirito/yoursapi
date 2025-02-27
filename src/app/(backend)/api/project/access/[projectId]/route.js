import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const projectId = params.projectId;

    const project = await ProjectsModel.findOne(
      { _id: projectId },
      { apiIds: 1, name: 1 }
    )
      .populate("shared")
      .lean();
    

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    const sharedData = project.shared.map((s) => ({
      name: s.name,
      email: s.email,
      profile: s.profile,
      permission:
        s.shared.find((s) => s.project === projectId)?.permission || "read",
      self: userId === s._id,
    }));

    const user = await UsersModel.findOne({ _id: userId })
      .populate("sharedUsers", "email name profile")
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    return NextResponse.json({
      name: project.name,
      shared: sharedData,
      sharedUsers: user.sharedUsers,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
