import DockersModel from "@/components/backend/api/docker/model";
import ProjectsModel from "@/components/backend/api/project/model";
import SubscriptionModel from "@/components/backend/api/subscription/model";
import stopAndStartContainer from "@/components/backend/utilities/helpers/stopAndStartContainer";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { logShared } from "@/components/backend/utilities/middlewares/logShared";
import { axiosPost } from "@/utilities/api";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { projectId } = await params;

    const { subscriptionId, environment } = body;

    const { ownerUserId, ownerUsername } = await getProjectOwner({
      userId,
      projectId,
    });

    const subscription = await SubscriptionModel.findOne({
      _id: subscriptionId,
    }).lean();

    if (!subscription) {
      return NextResponse.json(
        {
          message: "Subscription not found",
        },
        { status: 400 }
      );
    }

    const project = await ProjectsModel.findOne({ _id: projectId })
      .populate("domains")
      .lean();

    if (!project) {
      return NextResponse.json(
        {
          message: "Project not found",
        },
        { status: 400 }
      );
    }

    await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        $set: {
          [`data.${environment}.activeSubscription`]: {
            data: subscriptionId,
            updatedAt: new Date(),
          },
        },
      },
      { new: true, lean: true }
    );

    await stopAndStartContainer({
      ownerUsername,
      environment,
      projectId,
    });

    logShared({
      userId: ownerUserId,
      log: `Subscription updated in project '${project.name}' for environment '${environment}' - ${subscription.cpus.data} CPUs - ${subscription.ram.data * 1024} GB RAM`,
      type: "project",
      projectId,
      authId: null,
      apiId: null,
      createdBy: userId,
      link: `/projects/${projectId}/server`,
      linkShared: `/projects/${projectId}/server`,
    });

    return NextResponse.json({ message: "Plan updated successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
