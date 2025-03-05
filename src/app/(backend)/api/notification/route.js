import LoggersModel from "@/components/backend/api/logger";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";
import UsersModel from "@/components/backend/api/users/model";

export async function GET(request) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = parseInt(searchParams.get("skip")) || 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // Get date 7 days ago

    const notification = await LoggersModel.find(
      {
        userId,
        createdBy: { $ne: userId },
      },
      {
        log: 1,
        createdAt: 1,
        createdBy: 1,
        read: 1,
      }
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email profile")
      .lean();

    const totalUnread = await LoggersModel.countDocuments({
      userId: userId,
      createdBy: { $ne: userId },
      read: false, // Only count unread notifications
    });

    const totalSend = await LoggersModel.countDocuments({
      userId: userId,
      createdBy: { $ne: userId },
    }).limit(limit);

    const countNotifications = await LoggersModel.countDocuments({
      userId: userId,
      createdBy: { $ne: userId },
    });

    return NextResponse.json({
      data: notification,
      totalUnread,
      hasMore: countNotifications !== totalSend,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { userId, token, email, name, role, body } =
      await verifyToken(request);

    const { date } = body;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    await LoggersModel.updateMany(
      {
        userId,
        createdAt: { $lte: parsedDate },
      },
      {
        $set: { read: true }, // Mark as read
      }
    );

    return NextResponse.json({ message: "Notification read successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
