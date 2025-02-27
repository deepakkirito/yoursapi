import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import ApisModel from "@/components/backend/api/api/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";

export async function GET(request, { params }) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const projectId = params.projectId;

    const { ownerUserId, ownerUsername, ownerEmail, ownerName } =
      await getProjectOwner(userId, projectId);

    const project = await ProjectsModel.findOne(
      { _id: projectId, userId },
      { apiIds: 1, name: 1 }
    )
      .populate("apiIds")
      .lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    const user = await UsersModel.findOne({ _id: userId }).populate(
      "shared.project"
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const data = {
      name: project.name,
      apiIds: project.apiIds.map(({ name, _id }) => ({
        label: name,
        value: _id,
      })),
      username: ownerUsername,
      permission:
        ownerUserId.toString() === userId.toString()
          ? null
          : user.shared.find((s) => s.project.equals(project._id))
              ?.permission || "read",
    };

    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
