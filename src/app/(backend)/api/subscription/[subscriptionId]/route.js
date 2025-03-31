import SubscriptionModel from "@/components/backend/api/subscription/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { convertToIST } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { subscriptionId } = await params;

    const subscription = await SubscriptionModel.findOne({
      _id: subscriptionId,
    }).lean();

    if (!subscription) {
      return redirectToLogin(request);
    }

    return NextResponse.json(subscription);
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

    const { subscriptionId } = await params;

    const subscription = await SubscriptionModel.findOne({
      _id: subscriptionId,
    }).lean();

    if (!subscription) {
      return NextResponse.json(
        { message: "Subscription not found" },
        { status: 400 }
      );
    }

    const {
      name: newName,
      requests,
      ramLimit,
      cpuLimit,
      status,
      price,
      projectLimit,
      apiLimit,
    } = body;

    if (newName && newName !== subscription.name) {
      const subscriptions = await SubscriptionModel.find({
        name: newName,
      }).lean();

      if (subscriptions?.length) {
        return NextResponse.json(
          { message: "Subscription name already exists" },
          { status: 400 }
        );
      }
    }

    await SubscriptionModel.findOneAndUpdate(
      { _id: subscriptionId },
      {
        $set: {
          name: newName || subscription.name,
          requests: requests || subscription.requests,
          ramLimit: ramLimit || subscription.ramLimit,
          cpuLimit: cpuLimit || subscription.cpuLimit,
          status:
            status === "true"
              ? true
              : status === "false"
                ? false
                : subscription.status,
          price: price || subscription.price,
          updatedAt: convertToIST(new Date()),
          projectLimit: projectLimit || subscription.projectLimit,
          apiLimit: apiLimit || subscription.apiLimit,
        },
      },
      { new: true, lean: true }
    );

    return NextResponse.json(
      { message: "Subscription updated successfully" },
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

export async function DELETE(request, { params }) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { subscriptionId } = await params;

    const subscription = await SubscriptionModel.findOne({
      _id: subscriptionId,
    }).lean();

    if (!subscription) {
      return NextResponse.json(
        { message: "Subscription not found" },
        { status: 400 }
      );
    }

    await SubscriptionModel.findOneAndDelete({ _id: subscriptionId });

    return NextResponse.json(
      { message: "Subscription deleted successfully" },
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
