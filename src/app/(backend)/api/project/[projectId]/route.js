import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import ApisModel from "@/components/backend/api/api/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import {
  copyDatabase,
  dropDb,
} from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import AuthsModel from "@/components/backend/api/authApi/model";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { validateProjectName } from "@/components/backend/api/project/validator";
import { logShared } from "@/components/backend/utilities/middlewares/logShared";

export async function GET(request, { params }) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { projectId } = await params;

    const { ownerUserId, ownerUsername, ownerEmail, ownerName } =
      await getProjectOwner({ userId, projectId });

    const project = await ProjectsModel.findOne(
      { _id: projectId },
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

export async function PUT(request, { params }) {
  try {
    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { projectId } = await params;

    const { ownerUserId, ownerUsername, ownerEmail, ownerName } =
      await getProjectOwner({ userId, projectId });

    const updatedUser = await UsersModel.findByIdAndUpdate(
      { _id: ownerUserId },
      { $pull: { trash: projectId }, $push: { project: projectId } },
      { new: true, lean: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    const project = await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        updatedAt: Date.now(),
        updatedBy: userId,
      },
      { new: true, lean: true }
    );

    logShared({
      userId: ownerUserId,
      type: "project",
      createdBy: userId,
      projectId,
      log: `Project ${project.name} restored`,
    });

    return NextResponse.json({
      message: "Project restored successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { projectId } = await params;

    const { searchParams } = new URL(request.url);

    const soft = searchParams.get("soft");

    const project = await ProjectsModel.findOne({ _id: projectId });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    if (soft === "true") {
      var { ownerUserId, ownerUsername, ownerEmail, ownerName } =
        await getProjectOwner({ userId, projectId });

      const updatedUser = await UsersModel.findByIdAndUpdate(
        { _id: ownerUserId },
        { $pull: { project: projectId }, $push: { trash: projectId } },
        { new: true, lean: true }
      );

      if (!updatedUser) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 400, statusText: "Bad Request" }
        );
      }

      const project = await ProjectsModel.findOneAndUpdate(
        { _id: projectId },
        {
          updatedAt: Date.now(),
          updatedBy: userId,
        },
        { new: true, lean: true }
      );

      return NextResponse.json({
        message: "Project deactivated successfully",
      });
    }

    if (soft === "false") {
      const user = await UsersModel.findOne({ _id: userId }).lean();

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 401, statusText: "Unauthorized" }
        );
      }

      try {
        await dropDb({
          uri: user.mongoDbKey ? decrypt(user.mongoDbKey) : null,
          projectName: project.name,
          userName: user.username,
          saveInternal: user.saveInternal,
          saveExternal: user.saveExternal,
        });
      } catch (error) {
        console.error("Error dropping database:", error);
        return NextResponse.json(
          { message: "Database drop failed" },
          { status: 500, statusText: "Internal Server Error" }
        );
      }

      const { apiIds, name: projectName, shared, authId } = project;

      await ApisModel.deleteMany({ _id: { $in: apiIds } });

      await ProjectsModel.deleteOne({ _id: projectId });

      if (shared?.length) {
        await Promise.all(
          shared.map(async (sharedUserId) => {
            await UsersModel.findByIdAndUpdate(
              sharedUserId,
              { $pull: { shared: { project: projectId, owner: userId } } },
              { new: true }
            );
          })
        );
      }

      await AuthsModel.deleteOne({ _id: authId });

      await UsersModel.findOneAndUpdate(
        { _id: userId },
        {
          $pull: { trash: projectId },
        },
        { new: true, lean: true }
      );

      return NextResponse.json({
        message: "Project deleted successfully",
      });
    }

    logShared({
      userId: ownerUserId,
      type: "project",
      createdBy: userId,
      projectId,
      log: `Project ${project.name} deleted`,
    });

    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { projectId } = await params;

    const { projectName } = body;

    const {
      ownerUserId,
      ownerUsername,
      ownerEmail,
      ownerName,
      saveExternal,
      saveInternal,
      mongoDbKey,
      ownerProjectName,
    } = await getProjectOwner({ userId, projectId });

    if (ownerProjectName === projectName) {
      return NextResponse.json(
        { message: "Project name can not be same as before" },
        { status: 400 }
      );
    }

    const validator = await validateRequest(
      { ...request, body },
      validateProjectName
    );

    if (validator) {
      return validator;
    }

    if (saveInternal) {
      await copyDatabase({
        oldDbName: `${ownerUsername}_${ownerProjectName}`,
        newDbName: `${ownerUsername}_${projectName}`,
      });
    }

    if (saveExternal && mongoDbKey) {
      await copyDatabase({
        oldDbName: ownerProjectName,
        newDbName: projectName,
        mongoDbKey,
      });
    }

    await ProjectsModel.findOneAndUpdate(
      {
        _id: projectId,
      },
      {
        name: projectName,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      { new: true }
    );

    logShared({
      userId: userId,
      type: "project",
      createdBy: userId,
      projectId,
      log: `Project ${project.name} name updated to ${projectName}`,
    });

    return NextResponse.json({ message: "Project name updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
