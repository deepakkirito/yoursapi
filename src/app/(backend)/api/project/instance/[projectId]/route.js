import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { NextResponse } from "next/server";
import SubscriptionModel from "@/components/backend/api/subscription/model";
import { logShared } from "@/components/backend/utilities/middlewares/logShared";
import LoggersModel from "@/components/backend/api/logger";
import { axiosPost } from "@/utilities/api";
import DockersModel from "@/components/backend/api/docker/model";

export async function POST(request, { params }) {
  try {
    const { projectId } = await params;

    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { ownerUserId, ownerUsername } = await getProjectOwner({
      userId,
      projectId,
    });

    const searchParams = new URL(request.url).searchParams;
    const environment = searchParams.get("environment") || "production";

    const project = await ProjectsModel.findOne({
      _id: projectId,
      userId: ownerUserId,
    })
      .populate("domains")
      .lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    if (project.data[environment]?.instance?.status) {
      return NextResponse.json(
        { message: "Instance is already running" },
        { status: 400 }
      );
    }

    const subscriptionId = project.data[environment].activeSubscription.data;

    const subscription = await SubscriptionModel.findOne({
      _id: subscriptionId,
    }).lean();

    await axiosPost("/docker/create", {
      username: ownerUsername,
      projectName: project.name,
      environment,
      config: {
        baseImage: project.environment.data + ":" + project.environment.version,
        dependencies: project.dependencies.data,
        envVars: project.data[environment].environmentVariables.data,
      },
    });

    const docker = await axiosPost("/docker/start/instance", {
      username: ownerUsername,
      projectName: project.name,
      environment,
      config: {
        additionalConfig: {
          memoryLimit: subscription.ram.data * 1024 + "m",
          cpuLimit: subscription.cpus.data.toString(),
        },
      },
      customDomains:
        project?.domains.filter((item) => item.type === "custom") || [],
    });

    await DockersModel.create({
      containerId: docker.data.containerId,
      name: project.name + "-" + ownerUsername + "-" + environment,
    });

    await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        $set: {
          [`data.${environment}.instance.status`]: true,
          [`data.${environment}.instance.updatedAt`]: new Date(),
          [`data.${environment}.instance.containerId`]: docker.data.containerId,
        },
      },
      { new: true, lean: true }
    );

    await logShared({
      userId: ownerUserId,
      log: `Instance started in project '${project.name}' for environment '${environment}'`,
      type: "project",
      projectId,
      authId: null,
      apiId: null,
      createdBy: userId,
      link: `/projects/${projectId}/server`,
      linkShared: `/projects/${projectId}/server`,
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

    const searchParams = new URL(request.url).searchParams;
    const environment = searchParams.get("environment") || "production";

    const { ownerUserId, ownerUsername } = await getProjectOwner({
      userId,
      projectId,
    });

    const project = await ProjectsModel.findOne({
      _id: projectId,
      userId: ownerUserId,
    }).lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    if (!project.data[environment].instance.status) {
      return NextResponse.json(
        { message: "Instance is not running" },
        { status: 400 }
      );
    }

    await axiosPost("/docker/delete", {
      username: ownerUsername,
      projectName: project.name,
      environment,
    });

    await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        $set: {
          [`data.${environment}.instance.status`]: false,
          [`data.${environment}.instance.updatedAt`]: new Date(),
          [`data.${environment}.instance.containerId`]: null,
        },
      },
      { new: true, lean: true }
    );

    await logShared({
      userId: ownerUserId,
      log: `Instance stopped in project '${project.name}' for environment '${environment}'`,
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
