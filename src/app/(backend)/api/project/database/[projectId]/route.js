import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { logShared } from "@/components/backend/utilities/middlewares/logShared";
import { connectToDatabase } from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { projectId } = await params;

    const { ownerUserId, ownerEmail, ownerName, ownerProjectName } =
      await getProjectOwner({ userId, projectId });

    const user = await UsersModel.findOne({ _id: ownerUserId }).lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const project = await ProjectsModel.findOne({ _id: projectId });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      fetchData: project.fetchData,
      projectString: project.dbString,
      masterString: user.mongoDbKey,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { projectId } = await params;

    const {
      ownerUserId,
      ownerEmail,
      ownerName,
      ownerProjectName,
      ownerUsername,
    } = await getProjectOwner({ userId, projectId });

    const { fetchData, dbString } = body;

    try {
      await connectToDatabase(decrypt(dbString));
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: error.message || "Internal Server Error" },
        { status: 400 }
      );
    }

    const project = await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        $set: {
          fetchData: fetchData || "self",
          dbString: dbString || null,
          updatedAt: Date.now(),
          updatedBy: userId,
        },
      },
      { new: true, lean: true }
    );

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    await logShared({
      userId: ownerUserId,
      type: "project",
      createdBy: userId,
      projectId,
      log: `Project '${project.name}' database string connected`,
      link: `/projects/${projectId}/database`,
      linkShared: `/projects/shared/${projectId}/database`,
    });

    await logShared({
      userId: ownerUserId,
      type: "project",
      createdBy: userId,
      log: `Data will be fetch and saved to project database in project '${ownerProjectName}'`,
      link: `/projects`,
      linkShared: `/projects/shared`,
    });

    return NextResponse.json({
      message: "Database string connected successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { projectId } = await params;

    const {
      ownerUserId,
      ownerEmail,
      ownerName,
      ownerProjectName,
      ownerUsername,
    } = await getProjectOwner({ userId, projectId });

    const { fetchData } = body;

    const project = await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        $set: {
          fetchData: fetchData || "self",
          updatedAt: Date.now(),
          updatedBy: userId,
        },
      },
      { new: true, lean: true }
    );

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    await logShared({
      userId: ownerUserId,
      type: "project",
      createdBy: userId,
      projectId,
      log: `Data will be fetch and saved to ${fetchData === "self" ? "our database" : fetchData === "master" ? "master database" : "project database"} in project '${ownerProjectName}'`,
      link: `/projects/${projectId}/database`,
      linkShared: `/projects/shared/${projectId}/database`,
    });

    return NextResponse.json({
      message: "Database status updated successfully",
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

    const { ownerUserId, ownerEmail, ownerName, ownerProjectName } =
      await getProjectOwner({ userId, projectId });

    const user = await UsersModel.findOne({ _id: ownerUserId }).lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const project = await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        $set: {
          fetchData: user.fetchData,
          dbString: null,
          updatedAt: Date.now(),
          updatedBy: userId,
        },
      },
      { new: true, lean: true }
    );

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    await logShared({
      userId: ownerUserId,
      type: "project",
      createdBy: userId,
      projectId,
      log: `Project '${project.name}' database string disconnected`,
      link: `/projects/${projectId}/database`,
      linkShared: `/projects/shared/${projectId}/database`,
    });

    return NextResponse.json({
      message: "Database string disconnected successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
