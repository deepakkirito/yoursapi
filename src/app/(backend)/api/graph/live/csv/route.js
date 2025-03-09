import { NextResponse } from "next/server";
import { format } from "fast-csv";
import mongoose from "mongoose";
import ProjectsModel from "@/components/backend/api/project/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import ApisModel from "@/components/backend/api/api/model";
import AuthsModel from "@/components/backend/api/authApi/model";

export async function GET(request) {
  try {
    // Verify user token and extract userId
    const { userId } = await verifyToken(request);

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const projectIds = searchParams.get("project")?.split(",") || [];
    const apiIds = searchParams.get("api")?.split(",") || [];

    // Validate and convert ObjectIds
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
    const validProjectIds = projectIds
      .filter(isValidObjectId)
      .map((id) => new mongoose.Types.ObjectId(id));
    const validApiIds = apiIds
      .filter(isValidObjectId)
      .map((id) => new mongoose.Types.ObjectId(id));

    const pipeline = [
      { $match: { userId } },
      ...(validProjectIds.length > 0
        ? [{ $match: { _id: { $in: validProjectIds } } }]
        : []),

      {
        $lookup: {
          from: "apis",
          localField: "apiIds",
          foreignField: "_id",
          as: "apis",
        },
      },
      { $unwind: { path: "$apis", preserveNullAndEmptyArrays: true } },

      ...(validApiIds.length > 0
        ? [{ $match: { "apis._id": { $in: validApiIds } } }]
        : []),

      {
        $project: {
          projectName: "$name",
          apiName: "$apis.name",
          logs: { $ifNull: ["$apis.logs", []] },
        },
      },

      { $unwind: "$logs" },

      {
        $project: {
          createdAt: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$logs.createdAt",
              timezone: "Asia/Kolkata",
            },
          },
          projectName: 1,
          apiName: 1,
          type: "$logs.type",
        },
      },

      {
        $group: {
          _id: {
            createdAt: "$createdAt",
            projectName: "$projectName",
            apiName: "$apiName",
          },
          totalApiReqUsed: { $sum: 1 },
          HEAD: { $sum: { $cond: [{ $eq: ["$type", "headRequest"] }, 1, 0] } },
          GET: { $sum: { $cond: [{ $eq: ["$type", "getRequest"] }, 1, 0] } },
          PUT: { $sum: { $cond: [{ $eq: ["$type", "putRequest"] }, 1, 0] } },
          PATCH: {
            $sum: { $cond: [{ $eq: ["$type", "patchRequest"] }, 1, 0] },
          },
          POST: { $sum: { $cond: [{ $eq: ["$type", "postRequest"] }, 1, 0] } },
          DELETE: {
            $sum: { $cond: [{ $eq: ["$type", "deleteRequest"] }, 1, 0] },
          },
        },
      },

      {
        $group: {
          _id: {
            createdAt: "$_id.createdAt",
            projectName: "$_id.projectName",
          },
          totalProjectApiUsed: { $sum: "$totalApiReqUsed" },
          apiData: {
            $push: {
              apiName: "$_id.apiName",
              totalApiReqUsed: "$totalApiReqUsed",
              HEAD: "$HEAD",
              GET: "$GET",
              PUT: "$PUT",
              PATCH: "$PATCH",
              POST: "$POST",
              DELETE: "$DELETE",
            },
          },
        },
      },

      { $sort: { "_id.createdAt": 1 } },

      {
        $project: {
          _id: 0,
          createdAt: "$_id.createdAt",
          projectName: "$_id.projectName",
          totalProjectApiUsed: 1,
          apiData: 1,
        },
      },
    ];

    const results = await ProjectsModel.aggregate(pipeline);

    // **Calculate All Usage**
    const allUsage = results.reduce(
      (sum, proj) => sum + proj.totalProjectApiUsed,
      0
    );

    // **Flatten Data for CSV**
    let csvData = [];
    results.forEach((project) => {
      project.apiData.forEach((api) => {
        csvData.push({
          createdAt: project.createdAt,
          projectName: project.projectName,
          totalProjectApiUsed: project.totalProjectApiUsed,
          apiName: api.apiName,
          totalApiReqUsed: api.totalApiReqUsed,
          HEAD: api.HEAD,
          GET: api.GET,
          PUT: api.PUT,
          PATCH: api.PATCH,
          POST: api.POST,
          DELETE: api.DELETE,
          allUsage: allUsage, // Include total usage
        });
      });
    });

    // Convert to CSV format
    let csvString = "";
    const csvStream = format({ headers: true });

    csvStream
      .on("data", (row) => {
        csvString += row;
      })
      .on("end", () => {});

    csvData.forEach((row) => csvStream.write(row));
    csvStream.end();

    return new Response(csvString, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=detailed_logs.csv",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/download-detailed-csv:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
