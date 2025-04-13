import LoggersModel from "@/components/backend/api/logger";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";
import UsersModel from "@/components/backend/api/users/model";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { periodToMs } from "@/components/assets/constants/instance";

function escapeRegex(string) {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export async function GET(request, { params }) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);

    const rows = parseInt(searchParams.get("rows")) || 10;
    const page = parseInt(searchParams.get("page")) || 0;
    const search = searchParams.get("search") || "";
    const order = searchParams.get("order") || "asc";
    const orderBy = searchParams.get("orderBy") || "";
    const logType = searchParams.get("logType") || "";
    const environment = searchParams.get("environment") || "production";
    const period = searchParams.get("period");

    const logTypeArray = logType.split(",").filter((item) => item !== "");
    const escapedSearch = escapeRegex(search);

    const { ownerUserId } = await getProjectOwner({ projectId, userId });

    const filterConditions = {
      userId: ownerUserId,
      projectId,
      $or: [
        { log: { $regex: escapedSearch, $options: "i" } },
        { "createdBy.name": { $regex: escapedSearch, $options: "i" } },
        { "createdBy.email": { $regex: escapedSearch, $options: "i" } },
      ],
    };

    if (logTypeArray.length > 0) {
      filterConditions.type = { $in: logTypeArray };
    }

    // Apply period filter
    if (period && periodToMs[period]) {
      const cutoffDate = new Date(Date.now() - periodToMs[period]);
      filterConditions.createdAt = { $gte: cutoffDate };
    }

    const notification = await LoggersModel.find(filterConditions, {
      log: 1,
      createdAt: {
        $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" },
      },
      createdBy: 1,
      read: 1,
      link: 1,
    })
      .sort({ [orderBy || "createdAt"]: order === "asc" ? 1 : -1 })
      .skip(page * rows)
      .limit(rows)
      .populate("createdBy", "name email profile")
      .lean();

    const totalSend = await LoggersModel.countDocuments(filterConditions);

    return NextResponse.json({
      data: notification,
      totalCount: totalSend,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
