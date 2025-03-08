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
      throw new Error("Project not found");
    }

    const user = project.userId;

    if (
      !user ||
      !user.project ||
      (!user.project.includes(projectId) && !user.trash.includes(projectId))
    ) {
      throw new Error("Project is not accessible by you");
    }

    if (
      user._id.toString() !== userId.toString() &&
      !project.shared.includes(userId)
    ) {
      throw new Error("Project is not accessible by you");
    }

    return {
      ownerUserId: user._id.toString(),
      ownerUsername: user.username,
      ownerEmail: user.email,
      ownerName: user.name,
      saveInternal: user.saveInternal,
      saveExternal: user.saveExternal,
      fetchData: user.fetchData,
      mongoDbKey: user.mongoDbKey ? decrypt(user.mongoDbKey) : null,
      ownerProjectName: project.name,
    };
  } catch (error) {
    console.error("Error in getProjectOwner:", error);
    throw error; // Ensure the error propagates to the calling function
  }
};
