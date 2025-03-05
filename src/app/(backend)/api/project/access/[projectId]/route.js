import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { sendMail } from "@/components/backend/utilities/nodemailer";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { logShared } from "@/components/backend/utilities/middlewares/logShared";

export async function GET(request, { params }) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { projectId } = await params;

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
        s.shared.find((s) => s.project.toString() === projectId)?.permission ||
        "read",
      self: userId.toString() === s._id.toString(),
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

export async function PATCH(request, { params }) {
  try {
    const { userId, token, email, name, role, body } =
      await verifyToken(request);

    const { projectId } = await params;

    const { ownerUserId, ownerEmail } = await getProjectOwner({
      projectId,
      userId,
    });

    const { email: shareEmail, permission } = body;

    const updatedUser = await UsersModel.findOneAndUpdate(
      {
        email: shareEmail,
        "shared.project": projectId,
      },
      { $set: { "shared.$.permission": permission } },
      { new: true, lean: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    const project = await ProjectsModel.findByIdAndUpdate(
      { _id: projectId },
      { updatedAt: Date.now(), updatedBy: userId },
      { new: true, lean: true }
    );

    logShared({
      userId: ownerUserId,
      type: "project",
      createdBy: userId,
      projectId,
      log: `Project ${project.name} permission for ${shareEmail} updated to ${permission}`,
      link: `${process.env.COMPANY_URL}projects`,
      linkShared: `${process.env.COMPANY_URL}projects/shared`,
    });

    return NextResponse.json({
      message: "Project permission updated successfully",
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

    const { permission, email: shareEmail } = body;

    const { projectId } = await params;

    const projectIdObj = new mongoose.Types.ObjectId(projectId);

    const user = await UsersModel.findOne({ email: shareEmail });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    if (
      user?.shared?.some((shared) => shared.project.toString() === projectId)
    ) {
      return NextResponse.json(
        { message: "Project already shared with this user" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    const { ownerEmail, ownerName, ownerUserId } = await getProjectOwner({
      userId,
      projectId,
    });

    const currentUser = await UsersModel.findOne({ _id: userId });

    if (
      !currentUser.sharedUsers.find(
        (id) => id.toString() === user._id.toString()
      )
    ) {
      await UsersModel.findOneAndUpdate(
        {
          _id: userId,
        },
        {
          $push: {
            sharedUsers: user._id,
          },
        },
        { new: true }
      );
    }

    const sharedUser = await UsersModel.findOneAndUpdate(
      {
        email: shareEmail,
      },
      {
        $push: {
          shared: {
            permission,
            project: projectIdObj,
            owner: ownerUserId,
            sharedBy: userId,
          },
        },
      },
      { new: true, lean: true }
    );

    if (!sharedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    const updateProject = await ProjectsModel.findByIdAndUpdate(
      { _id: projectIdObj },
      {
        $push: { shared: sharedUser._id },
        updatedAt: Date.now(),
        updatedBy: userId,
      },
      { new: true, lean: true }
    );

    if (!updateProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    logShared({
      userId: ownerUserId,
      type: "project",
      createdBy: userId,
      projectId,
      log: `Project ${updateProject.name} shared with ${shareEmail} with permission ${permission}`,
      link: `${process.env.COMPANY_URL}projects`,
      linkShared: `${process.env.COMPANY_URL}projects/shared`,
    });

    sendMail({
      to: shareEmail,
      subject: "New Project Shared",
      template: "shared",
      context: {
        recipientName: sharedUser.name,
        projectName: updateProject.name,
        sharedBy: `${name} ${email}`,
        projectLink: `${process.env.COMPANY_URL}projects/shared/${updateProject._id}`,
      },
    });

    return NextResponse.json({
      message: "Project shared successfully",
    });
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

    const { email: shareEmail } = body;

    const { projectId } = await params;

    const projectIdObj = new mongoose.Types.ObjectId(projectId);

    const user = await UsersModel.findOne({ email: shareEmail });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    const { ownerEmail, ownerName, ownerUserId } = await getProjectOwner({
      userId,
      projectId,
    });

    const deletePermission = await UsersModel.findOneAndUpdate(
      {
        email: shareEmail,
      },
      { $pull: { shared: { project: projectIdObj, owner: ownerUserId } } },
      { new: true }
    );

    if (!deletePermission) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    const updateProject = await ProjectsModel.findByIdAndUpdate(
      { _id: projectId },
      {
        $pull: { shared: deletePermission._id },
        updatedAt: Date.now(),
        updatedBy: userId,
      },
      { new: true, lean: true }
    );

    if (!updateProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }
    logShared({
      userId: ownerUserId,
      type: "project",
      createdBy: userId,
      projectId,
      log: `Project ${updateProject.name} revoked from ${shareEmail}`,
      link: `${process.env.COMPANY_URL}projects`,
      linkShared: `${process.env.COMPANY_URL}projects/shared`,
    });

    return NextResponse.json({
      message: "Project revoked successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
