import LoggersModel from "@/components/backend/api/logger";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";
import UsersModel from "@/components/backend/api/users/model";

export async function GET(request) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { searchParams } = new URL(request.url);

    const rows = parseInt(searchParams.get("rows")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // Get date 7 days ago

    const notification = await LoggersModel.find(
      {
        userId,
      },
      {
        log: 1,
        createdAt: {
          $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" },
        },

        createdBy: 1,
        read: 1,
        link: 1,
      }
    )
      .sort({ createdAt: -1 })
      .skip((page - 1) * rows)
      .limit(rows)
      .populate("createdBy", "name email profile")
      .lean();

    const totalSend = await LoggersModel.countDocuments({
      userId: userId,
      createdBy: { $ne: userId },
    }).limit(rows);

    return NextResponse.json({
      data: notification,
      total: totalSend,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
