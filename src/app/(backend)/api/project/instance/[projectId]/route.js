import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { NextResponse } from "next/server";
import SubscriptionModel from "@/components/backend/api/subscription/model";
import { logShared } from "@/components/backend/utilities/middlewares/logShared";
import LoggersModel from "@/components/backend/api/logger";
import { axiosPost } from "@/utilities/api";

export async function GET(request, { params }) {
  try {
    const { projectId } = await params;

    const { userId, token, email, name, role } = await verifyToken(request);

    const { ownerUserId } = await getProjectOwner({ userId, projectId });

    const user = await UsersModel.findOne({ _id: ownerUserId })
      .populate("planId")
      .lean();

    const project = await ProjectsModel.findOne(
      {
        _id: projectId,
      },
      {
        _id: 1,
        instance: 1,
      }
    ).lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ...project,
      cpuLimit: user.planId.cpuLimit,
      ramLimit: user.planId.ramLimit,
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
    const { projectId } = await params;

    const { userId, token, email, name, role, body } =
      await verifyToken(request);

    const { ownerUserId } = await getProjectOwner({ userId, projectId });

    const project = await ProjectsModel.findOne(
      {
        _id: projectId,
        userId: ownerUserId,
      },
      {
        _id: 1,
        instance: 1,
        name: 1,
      }
    ).lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    const {
      nodeVersion,
      dependencies,
      environmentVariables,
      ramUsage,
      cpuUsage,
    } = body;

    await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        $set: {
          instance: {
            nodeVersion:
              nodeVersion || project?.instance?.nodeVersion || "node:18-alpine",
            dependencies: dependencies || project?.instance?.dependencies || [],
            environmentVariables:
              environmentVariables ||
              project?.instance?.environmentVariables ||
              {},
            ramUsage: ramUsage || project?.instance?.ramUsage || 0,
            cpuUsage: cpuUsage || project?.instance?.cpuUsage || 0,
            status: project?.instance?.status || false,
          },
        },
      },
      { new: true, lean: true }
    );

    await logShared({
      userId: ownerUserId,
      log: `Instance updated for project '${project.name}'`,
      type: "project",
      projectId,
      authId: null,
      apiId: null,
      createdBy: ownerUserId,
      link: `/projects/${projectId}/instance`,
      linkShared: `/projects/${projectId}/instance`,
    });

    return NextResponse.json(
      { message: "Instance updated successfully" },
      {
        status: 200,
      }
    );
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
    const { projectId } = await params;

    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { ownerUserId } = await getProjectOwner({ userId, projectId });

    const user = await UsersModel.findOne({ _id: ownerUserId })
      .populate("planId")
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const project = await ProjectsModel.findOne(
      {
        _id: projectId,
        userId: ownerUserId,
      },
      {
        _id: 1,
        instance: 1,
        name: 1,
      }
    ).lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    if (project.instance.status) {
      return NextResponse.json(
        { message: "Instance is already running" },
        { status: 400 }
      );
    }

    if (
      user.planId.cpuLimit < (user?.usedCpu || 0) + project.instance.cpuUsage ||
      user.planId.ramLimit < (user?.usedRam || 0) + project.instance.ramUsage
    ) {
      return NextResponse.json(
        { message: "Insufficient resources" },
        { status: 400 }
      );
    }

    await axiosPost("/docker/create", {
      username: user.username,
      projectName: project.name,
      config: {
        baseImage: project.instance.nodeVersion,
        dependencies: project.instance.dependencies,
        envVars: project.instance.environmentVariables,
      },
    });

    console.log("Docker started");

    await axiosPost("/docker/start/instance", {
      username: user.username,
      projectName: project.name,
      config: {
        additionalConfig: {
          memoryLimit: project.instance.ramUsage.toString() + "m",
          cpuLimit: project.instance.cpuUsage.toString(),
        },
      },
    });

    await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        $set: {
          "instance.status": true,
        },
      },
      { new: true, lean: true }
    );

    await UsersModel.findOneAndUpdate(
      { _id: ownerUserId },
      {
        $set: {
          usedCpu: (user?.usedCpu || 0) + project.instance.cpuUsage,
          usedRam: (user?.usedRam || 0) + project.instance.ramUsage,
        },
      },
      { new: true, lean: true }
    );

    await logShared({
      userId: ownerUserId,
      log: `Instance started for project '${project.name}'`,
      type: "project",
      projectId,
      authId: null,
      apiId: null,
      createdBy: userId,
      link: `/projects/${projectId}/instance`,
      linkShared: `/projects/${projectId}/instance`,
    });

    return NextResponse.json(
      { message: "Instance started successfully" },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { projectId } = await params;

    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { ownerUserId } = await getProjectOwner({ userId, projectId });

    const user = await UsersModel.findOne({ _id: ownerUserId })
      .populate("planId")
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const project = await ProjectsModel.findOne(
      {
        _id: projectId,
        userId: ownerUserId,
      },
      {
        _id: 1,
        instance: 1,
        name: 1,
      }
    ).lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    if (!project.instance.status) {
      return NextResponse.json(
        { message: "Instance is not running" },
        { status: 400 }
      );
    }

    await axiosPost("/docker/stop/instance", {
      username: user.username,
      projectName: project.name,
    });

    await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        $set: {
          "instance.status": false,
        },
      },
      { new: true, lean: true }
    );

    await UsersModel.findOneAndUpdate(
      { _id: ownerUserId },
      {
        $set: {
          usedCpu: user.usedCpu - project.instance.cpuUsage,
          usedRam: user.usedRam - project.instance.ramUsage,
        },
      },
      { new: true, lean: true }
    );

    await logShared({
      userId: ownerUserId,
      log: `Instance stopped for project '${project.name}'`,
      type: "project",
      projectId,
      authId: null,
      apiId: null,
      createdBy: userId,
      link: `/projects/${projectId}/instance`,
      linkShared: `/projects/${projectId}/instance`,
    });

    return NextResponse.json(
      { message: "Instance stopped successfully" },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
