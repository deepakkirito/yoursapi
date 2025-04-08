import SubscriptionModel from "@/components/backend/api/subscription/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { convertToIST } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { subscriptionId } = await params;

    const subscription = await SubscriptionModel.findOne(
      {
        _id: subscriptionId,
      },
      {
        _id: 0,
        __v: 0,
      }
    ).lean();

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

    await SubscriptionModel.findOneAndUpdate(
      { _id: subscriptionId },
      {
        $set: {
          ...body,
          updatedAt: convertToIST(new Date()),
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
