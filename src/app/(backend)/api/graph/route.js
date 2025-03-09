import StatisticsModel from "@/components/backend/api/statistics/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getDate } from "@/utilities/helpers/functions";
import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import ApisModel from "@/components/backend/api/api/model";

export async function GET(request) {
  try {
    const { userId } = await verifyToken(request);
    const { searchParams } = new URL(request.url);

    const period = parseInt(searchParams.get("period")) || 7;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Extract filters
    const type = searchParams.get("type")
      ? searchParams.get("type").split(",")
      : [];
    const projectIds = searchParams.get("project")
      ? searchParams.get("project").split(",")
      : [];
    const apiIds = searchParams.get("api")
      ? searchParams.get("api").split(",")
      : [];

    // Convert valid MongoDB ObjectId strings
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    const validProjectIds = projectIds
      .filter(isValidObjectId)
      .map((id) => new mongoose.Types.ObjectId(id));
    const validApiIds = apiIds
      .filter(isValidObjectId)
      .map((id) => new mongoose.Types.ObjectId(id));

    // Get today's date at midnight
    const test = new Date();
    const today = new Date(test);
    today.setDate(today.getDate() + 1);
    today.setHours(0, 0, 0, 0);

    let startDate, endDate;

    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      if (fromDate > toDate) {
        return NextResponse.json(
          { message: "From date cannot be greater than To date" },
          { status: 400 }
        );
      }
      if (fromDate > today || toDate > today) {
        return NextResponse.json(
          { message: "Dates cannot be in the future" },
          { status: 400 }
        );
      }

      startDate = fromDate;
      endDate = toDate;
    } else if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);

      if (fromDate > today) {
        return NextResponse.json(
          { message: "From date cannot be in the future" },
          { status: 400 }
        );
      }

      startDate = fromDate;
      endDate = today;
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      startDate.setHours(0, 0, 0, 0);
      endDate = today;
    }

    // Ensure that startDate and endDate are ISO formatted
    const isoStartDate = new Date(startDate).toISOString();
    const isoEndDate = new Date(endDate).toISOString();

    // Base match query
    let matchQuery = {
      userId,
      createdAt: { $gte: new Date(isoStartDate), $lte: new Date(isoEndDate) },
    };

    // Aggregation pipeline
    const pipeline = [
      { $match: matchQuery },

      { $unwind: { path: "$projectsUsed", preserveNullAndEmptyArrays: false } },

      ...(validProjectIds.length > 0
        ? [{ $match: { "projectsUsed.name": { $in: validProjectIds } } }]
        : []),

      {
        $unwind: {
          path: "$projectsUsed.apiUsed",
          preserveNullAndEmptyArrays: false,
        },
      },

      ...(validApiIds.length > 0
        ? [{ $match: { "projectsUsed.apiUsed.name": { $in: validApiIds } } }]
        : []),

      {
        $project: {
          createdAt: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          apiName: "$projectsUsed.apiUsed.name",
          requestCounts: {
            head: "$projectsUsed.apiUsed.headUsed",
            get: "$projectsUsed.apiUsed.getUsed",
            post: "$projectsUsed.apiUsed.postUsed",
            put: "$projectsUsed.apiUsed.putUsed",
            patch: "$projectsUsed.apiUsed.patchUsed",
            delete: "$projectsUsed.apiUsed.deleteUsed",
          },
        },
      },

      {
        $group: {
          _id: { createdAt: "$createdAt", apiName: "$apiName" },
          totalUsed: {
            $sum: {
              $add: [
                ...(type.length === 0 || type.includes("head")
                  ? [{ $ifNull: ["$requestCounts.head", 0] }]
                  : []),
                ...(type.length === 0 || type.includes("get")
                  ? [{ $ifNull: ["$requestCounts.get", 0] }]
                  : []),
                ...(type.length === 0 || type.includes("post")
                  ? [{ $ifNull: ["$requestCounts.post", 0] }]
                  : []),
                ...(type.length === 0 || type.includes("put")
                  ? [{ $ifNull: ["$requestCounts.put", 0] }]
                  : []),
                ...(type.length === 0 || type.includes("patch")
                  ? [{ $ifNull: ["$requestCounts.patch", 0] }]
                  : []),
                ...(type.length === 0 || type.includes("delete")
                  ? [{ $ifNull: ["$requestCounts.delete", 0] }]
                  : []),
              ],
            },
          },
        },
      },

      {
        $group: {
          _id: "$_id.createdAt",
          totalUsed: { $sum: "$totalUsed" },
        },
      },

      { $sort: { _id: 1 } },

      {
        $project: {
          _id: 0,
          createdAt: "$_id",
          totalUsed: 1,
        },
      },
    ];

    let data = await StatisticsModel.aggregate(pipeline);

    let fullData = await StatisticsModel.find(matchQuery, {
      createdAt: 1,
      totalUsed: 1,
      projectsUsed: 1,
      _id: 0,
    })
      .populate("projectsUsed.name", "name")
      .populate("projectsUsed.apiUsed.name", "name")
      .lean();

    const updatedData = fullData.map((item) => {
      return {
        createdAt: new Date(item.createdAt)
          .toISOString()
          .replace("T", " ")
          .split(".")[0]
          .replace(",", " "),
        projectTotalUsed: item.totalUsed,
        projectsUsed: item.projectsUsed
          .filter((project) =>
            projectIds.includes(project.name?._id.toString())
          ) // Filter projects
          .map((project) => ({
            name: project.name.name,
            apiUsed: project.apiUsed
              .filter((api) => apiIds.includes(api.name?._id.toString())) // Filter APIs
              .map((api) => ({
                name: api.name.name,
                headUsed: api.headUsed || 0,
                getUsed: api.getUsed || 0,
                postUsed: api.postUsed || 0,
                putUsed: api.putUsed || 0,
                patchUsed: api.patchUsed || 0,
                deleteUsed: api.deleteUsed || 0,
                apiTotalUsed:
                  api.headUsed +
                  api.getUsed +
                  api.postUsed +
                  api.putUsed +
                  api.patchUsed +
                  api.deleteUsed,
              })),
          })),
      };
    });

    // Fill missing dates correctly
    if (data.length > 0) {
      const firstDate = new Date(data[0].createdAt);
      const lastDate = new Date(data[data.length - 1].createdAt);
      let completeData = [];
      let currentDate = new Date(firstDate);

      while (currentDate <= lastDate) {
        const formattedDate = currentDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
        const existingEntry = data.find(
          (item) => item.createdAt === formattedDate
        );

        completeData.push(
          existingEntry || { createdAt: formattedDate, totalUsed: 0 }
        );

        currentDate.setDate(currentDate.getDate() + 1);
      }

      data = completeData;
    }

    return NextResponse.json(
      { data: data, fullData: updatedData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
