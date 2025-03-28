import { NextResponse } from "next/server";
import ProjectsModel from "../../api/project/model";
import { decrypt } from "@/utilities/helpers/encryption";
import UsersModel from "../../api/users/model";

export const getProjectOwner = async ({ userId, projectId }) => {
  try {
    const project = await ProjectsModel.findOne({ _id: projectId }).populate(
      "userId"
    );

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    const user = project.userId;

    if (
      !user ||
      !user.project ||
      (!user.project.includes(projectId) && !user.trash.includes(projectId))
    ) {
      return NextResponse.json(
        { message: "Project is not accessible by you" },
        { status: 400 }
      );
    }

    if (
      user._id.toString() !== userId.toString() &&
      !project.shared.includes(userId)
    ) {
      return NextResponse.json(
        { message: "Project is not accessible by you" },
        { status: 400 }
      );
    }

    return {
      ownerUserId: user._id.toString(),
      ownerUsername: user.username,
      ownerEmail: user.email,
      ownerName: user.name,
      fetchData: project.dbString ? project.fetchData : user.fetchData,
      mongoDbKey: user.mongoDbKey ? decrypt(user.mongoDbKey) : null,
      projectMongoDbKey: project.dbString ? decrypt(project.dbString) : null,
      ownerProjectName: project.name,
    };
  } catch (error) {
    console.error("Error in getProjectOwner:", error);
    throw error; // Ensure the error propagates to the calling function
  }
};
