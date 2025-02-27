import { NextResponse } from "next/server";
import ProjectsModel from "../../api/project/model";
import { decrypt } from "@/utilities/helpers/encryption";
import UsersModel from "../../api/users/model";

export const getProjectOwner = async (request, userId, projectId) => {

  const project = await ProjectsModel.findOne({ _id: projectId }).populate(
    "userId"
  );

  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 400 });
  }

  const user = project.userId;

  if (!user.project.includes(projectId)) {
    return NextResponse.json(
      { message: "Project is not accessible by you" },
      { status: 400 }
    );
  }

  if (user._id !== userId && project.shared.includes(userId)) {
    return NextResponse.json(
      { message: "Project is not accessible by you" },
      { status: 400 }
    );
  }

  return {
    ownerUserId: user._id,
    ownerUsername: user.username,
    ownerEmail: user.email,
    ownerName: user.name,
    saveInternal: user.saveInternal,
    saveExternal: user.saveExternal,
    fetchData: user.fetchData,
    mongoDbKey: decrypt(user.mongoDbKey),
  };
};
