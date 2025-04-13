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
import { convertToIST } from "@/utilities/helpers/functions";
import PermissionsModel from "@/components/backend/api/permissions/model";
import SubscriptionModel from "@/components/backend/api/subscription/model";
import DomainsModel from "@/components/backend/api/domain/model";

export async function GET(request, { params }) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { projectId } = await params;

    const searchParams = new URL(request.url).searchParams;

    const environment = searchParams.get("environment") || "production";

    const { ownerUserId, ownerUsername } = await getProjectOwner({
      userId,
      projectId,
    });

    const project = await ProjectsModel.findOne(
      { _id: projectId },
      { [`data.${environment}.environmentVariables`]: 0 }
    )
      .populate("apiIds")
      .populate("shared.shared.permission")
      .populate("userId", "username")
      .populate("domains")
      .lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    if (project?.data?.[environment]?.activeSubscription?.data) {
      const sub = await SubscriptionModel.findById(
        project.data[environment].activeSubscription.data
      ).lean();

      project.data[environment].activeSubscription.data = sub;
    }

    const user = await UsersModel.findOne({ _id: userId })
      .populate("shared.project")
      .populate("shared.permission");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const data = {
      ...project,
      data: project.data[environment],
      apiIds: project.apiIds.map(({ name, _id }) => ({
        label: name,
        value: _id,
      })),
      username: ownerUsername,
      permission:
        ownerUserId.toString() === userId.toString()
          ? null
          : user.shared.find((s) => s.project.equals(project._id))?.permission,
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

    const { ownerUserId } = await getProjectOwner({ userId, projectId });

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
      log: `Project '${project.name}' restored`,
      link: `/projects`,
      linkShared: `/projects/shared`,
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

    if (
      project?.data.production.instance?.status ||
      project?.data.development.instance?.status
    ) {
      return NextResponse.json(
        { message: "Cannot delete project while instance is running" },
        { status: 400 }
      );
    }

    if (soft === "true") {
      var { ownerUserId } = await getProjectOwner({ userId, projectId });

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
      log: `Project '${project.name}' deleted`,
      link: `/projects/inactive`,
      linkShared: `/projects/shared`,
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

    const { ownerProjectName, projectData } = await getProjectOwner({
      userId,
      projectId,
    });

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

    const project = await ProjectsModel.findOne({
      id: projectId,
    });

    if (
      project?.data.production.instance?.status ||
      project?.data.development.instance?.status
    ) {
      return NextResponse.json(
        { message: "Cannot rename project while instance is running" },
        { status: 400 }
      );
    }

    Promise.all(
      Object.keys(projectData).map(async (environmentType) => {
        const dbString = projectData[environmentType].dbString.data;
        const dbName = ownerProjectName;

        if (dbString) {
          await copyDatabase({
            oldDbName: dbName,
            newDbName: projectName,
            mongoDbKey: decrypt(dbString),
          });
        }
      })
    );

    await ProjectsModel.findOneAndUpdate(
      {
        _id: projectId,
      },
      {
        name: projectName,
        updatedAt: convertToIST(new Date()),
        updatedBy: userId,
      },
      { new: true }
    );

    logShared({
      userId: userId,
      type: "project",
      createdBy: userId,
      projectId,
      log: `Project '${ownerProjectName}' name updated to '${projectName}'`,
      link: `/projects`,
      linkShared: `/projects/shared`,
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
