import PermissionsModel from "@/components/backend/api/permissions/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { logShared } from "@/components/backend/utilities/middlewares/logShared";
import { getDataToString } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { userId } = await verifyToken(request);

    const { projectId } = await params;

    const { ownerUserId } = await getProjectOwner({ projectId, userId });

    const data = await PermissionsModel.find({
      $or: [{ userId: ownerUserId }, { common: true }],
    });

    const user = await UsersModel.findOne({ _id: userId }).lean();

    const sharedData = user.shared.find(
      (item) =>
        item.project.toString() === projectId.toString() &&
        item.owner.toString() === ownerUserId.toString()
    );

    const permission =
      userId.toString() === ownerUserId.toString()
        ? null
        : data.find(
            (item) => item._id.toString() === sharedData?.permission.toString()
          );

    return NextResponse.json({ data, permission });
  } catch (error) {
    return NextResponse.json({ message: error.message });
  }
}

export async function POST(request, { params }) {
  try {
    const { userId, body } = await verifyToken(request);

    const { name, permission } = body;

    const { projectId } = await params;

    const { ownerUserId, ownerProjectType, ownerProjectName } =
      await getProjectOwner({
        projectId,
        userId,
      });

    if (!name || !projectId) {
      return NextResponse.json({ message: "Please fill all the fields" });
    }

    const permissionData = await PermissionsModel.findOne({
      where: {
        name: name,
        value: name.toLowerCase().trim(),
        userId: ownerUserId,
      },
    });

    if (permissionData) {
      return NextResponse.json({
        message: "Permission already exists",
      });
    }

    const newPermission = await PermissionsModel.create({
      name: name,
      value: name.toLowerCase().trim(),
      userId: ownerUserId,
      type: ownerProjectType || "youpiapi",
      ...permission,
    });

    logShared({
      userId: ownerUserId,
      projectId,
      log: `Permission ${name} created in project '${ownerProjectName}' of type '${ownerProjectType}'}`,
      type: "project",
      createdBy: userId,
      link: `/projects`,
      linkShared: `/projects/shared`,
    });

    return NextResponse.json({ message: "Permission created successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { userId, body } = await verifyToken(request);

    const { projectId } = await params;

    const { ownerUserId, ownerProjectName, ownerProjectType } =
      await getProjectOwner({
        projectId,
        userId,
      });

    const { permission, permissionId } = body;

    const newPermission = await PermissionsModel.updateOne(
      {
        _id: permissionId,
      },
      {
        $set: {
          ...permission,
          updatedAt: new Date(),
        },
      },
      { new: true, lean: true }
    );

    await logShared({
      userId: ownerUserId,
      projectId,
      log: `Permission ~${getDataToString(permission)}~ updated in project '${ownerProjectName}' of permission '${newPermission.name}' for project type '${ownerProjectType}'`,
      type: "project",
      createdBy: userId,
      link: `/projects`,
      linkShared: `/projects/shared`,
    });

    return NextResponse.json({ message: "Permission updated successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message });
  }
}
