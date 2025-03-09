import ProjectsModel from "@/components/backend/api/project/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ApisModel from "@/components/backend/api/api/model";
import AuthsModel from "@/components/backend/api/authApi/model";

// export async function GET(request) {
//   try {
//     // Verify user token and extract userId
//     const { userId } = await verifyToken(request);

//     // Extract query parameters
//     const { searchParams } = new URL(request.url);
//     const type = searchParams.get("type")?.split(",") || [];
//     const projectIds = searchParams.get("project")?.split(",") || [];
//     const apiIds = searchParams.get("api")?.split(",") || [];
//     const split = searchParams.get("split") || "project";

//     const validTypes = type
//       .filter((type) => Boolean(type))
//       .map((type) => type + "Request");

//     // Validate and convert ObjectIds
//     const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
//     const validProjectIds = projectIds
//       .filter(isValidObjectId)
//       .map((id) => new mongoose.Types.ObjectId(id));
//     const validApiIds = apiIds
//       .filter(isValidObjectId)
//       .map((id) => new mongoose.Types.ObjectId(id));

//     console.log({ validTypes, validProjectIds, validApiIds });

//     const pipeline = [
//       // Stage 1: Match documents by userId
//       { $match: { userId } },

//       // Stage 2: Filter by projectIds if provided
//       ...(validProjectIds.length > 0
//         ? [{ $match: { _id: { $in: validProjectIds } } }]
//         : []),

//       // Stage 3: Lookup to join APIs and Auths
//       {
//         $lookup: {
//           from: "apis",
//           localField: "apiIds",
//           foreignField: "_id",
//           as: "apis",
//         },
//       },
//       {
//         $lookup: {
//           from: "auths",
//           localField: "authId",
//           foreignField: "_id",
//           as: "auths",
//         },
//       },

//       // Stage 4: Unwind APIs and Auths
//       {
//         $unwind: { path: "$apis", preserveNullAndEmptyArrays: true },
//       },
//       {
//         $unwind: { path: "$auths", preserveNullAndEmptyArrays: true },
//       },

//       // Stage 5: Filter by apiIds if provided (AFTER UNWIND)
//       ...(validApiIds.length > 0
//         ? [
//             {
//               $match: {
//                 $or: [
//                   { "apis._id": { $in: validApiIds } },
//                   { "auths._id": { $in: validApiIds } },
//                 ],
//               },
//             },
//           ]
//         : []),

//       // Stage 6: Combine logs from APIs and Auths
//       {
//         $project: {
//           name: 1,
//           logs: {
//             $concatArrays: [
//               { $ifNull: ["$apis.logs", []] },
//               { $ifNull: ["$auths.logs", []] },
//             ],
//           },
//         },
//       },

//       // Stage 7: Unwind logs array
//       {
//         $unwind: "$logs",
//       },

//       // Stage 8: Filter logs by type AFTER unwinding**
//       ...(validTypes.length > 0
//         ? [
//             {
//               $match: {
//                 "logs.type": { $in: validTypes }, // Now `logs.type` exists
//               },
//             },
//           ]
//         : []),

//       // Stage 9: Extract hour and minute from logs
//       {
//         $project: {
//           hour: {
//             $hour: { date: "$logs.createdAt", timezone: "Asia/Kolkata" },
//           },
//           minute: {
//             $minute: { date: "$logs.createdAt", timezone: "Asia/Kolkata" },
//           },
//           type: "$logs.type",
//         },
//       },

//       // Stage 10: Format hour and minute into 12-hour format
//       {
//         $project: {
//           hour: {
//             $concat: [
//               {
//                 $toString: {
//                   $cond: [{ $eq: ["$hour", 0] }, 12, { $mod: ["$hour", 12] }],
//                 },
//               },
//               ":",
//               {
//                 $toString: {
//                   $cond: [
//                     { $lt: ["$minute", 10] },
//                     { $concat: ["0", { $toString: "$minute" }] },
//                     { $toString: "$minute" },
//                   ],
//                 },
//               },
//               " ",
//               { $cond: [{ $gte: ["$hour", 12] }, "PM", "AM"] },
//             ],
//           },
//           type: 1,
//         },
//       },

//       // Stage 11: Group by hour and count total usage
//       {
//         $group: {
//           _id: "$hour",
//           totalUsed: { $sum: 1 },
//         },
//       },

//       // Stage 12: Sort by hour
//       {
//         $sort: { _id: 1 },
//       },

//       // Stage 13: Format the output
//       {
//         $project: {
//           _id: 0,
//           createdAt: "$_id",
//           totalUsed: 1,
//         },
//       },
//     ];

//     // Execute the aggregation pipeline
//     const results = await ProjectsModel.aggregate(pipeline);

//     return NextResponse.json(results);
//   } catch (error) {
//     console.error("Error in GET /api/logs:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request) {
  try {
    // Verify user token and extract userId
    const { userId } = await verifyToken(request);

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type")?.split(",") || [];
    const projectIds = searchParams.get("project")?.split(",") || [];
    const apiIds = searchParams.get("api")?.split(",") || [];
    const split = searchParams.get("split") || ""; // Default to empty

    const validTypes = type
      .filter((type) => Boolean(type))
      .map((type) => type + "Request");

    // Validate and convert ObjectIds
    const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
    const validProjectIds = projectIds
      .filter(isValidObjectId)
      .map((id) => new mongoose.Types.ObjectId(id));
    const validApiIds = apiIds
      .filter(isValidObjectId)
      .map((id) => new mongoose.Types.ObjectId(id));

    console.log({ validTypes, validProjectIds, validApiIds });

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
      {
        $lookup: {
          from: "auths",
          localField: "authId",
          foreignField: "_id",
          as: "auths",
        },
      },
      { $unwind: { path: "$apis", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$auths", preserveNullAndEmptyArrays: true } },

      ...(validApiIds.length > 0
        ? [
            {
              $match: {
                $or: [
                  { "apis._id": { $in: validApiIds } },
                  { "auths._id": { $in: validApiIds } },
                ],
              },
            },
          ]
        : []),

      {
        $project: {
          name: 1,
          apiName: "$apis.name",
          logs: {
            $concatArrays: [
              { $ifNull: ["$apis.logs", []] },
              { $ifNull: ["$auths.logs", []] },
            ],
          },
        },
      },

      { $unwind: "$logs" },

      ...(validTypes.length > 0
        ? [{ $match: { "logs.type": { $in: validTypes } } }]
        : []),

      {
        $project: {
          hour: {
            $hour: { date: "$logs.createdAt", timezone: "Asia/Kolkata" },
          },
          minute: {
            $minute: { date: "$logs.createdAt", timezone: "Asia/Kolkata" },
          },
          type: "$logs.type",
          projectName: "$name",
          apiName: "$apiName",
        },
      },

      {
        $project: {
          hour: {
            $concat: [
              {
                $toString: {
                  $cond: [{ $eq: ["$hour", 0] }, 12, { $mod: ["$hour", 12] }],
                },
              },
              ":",
              {
                $toString: {
                  $cond: [
                    { $lt: ["$minute", 10] },
                    { $concat: ["0", { $toString: "$minute" }] },
                    { $toString: "$minute" },
                  ],
                },
              },
              " ",
              { $cond: [{ $gte: ["$hour", 12] }, "PM", "AM"] },
            ],
          },
          type: 1,
          projectName: 1,
          apiName: 1,
        },
      },

      {
        $group: {
          _id: {
            createdAt: "$hour",
            splitBy:
              split === "project"
                ? "$projectName"
                : split === "api"
                  ? "$apiName"
                  : split === "type"
                    ? "$type"
                    : null, // If no split, keep as null
          },
          totalUsed: { $sum: 1 },
        },
      },

      ...(split
        ? [
            // If `split` is provided, structure data accordingly
            {
              $group: {
                _id: "$_id.createdAt",
                data: {
                  $push: {
                    k: "$_id.splitBy",
                    v: "$totalUsed",
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                createdAt: "$_id",
                mergedData: {
                  $mergeObjects: [
                    {
                      $arrayToObject: {
                        $filter: {
                          input: "$data",
                          as: "entry",
                          cond: { $ne: ["$$entry.k", null] }, // Ensure valid keys
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              $replaceRoot: {
                newRoot: { $mergeObjects: ["$$ROOT", "$mergedData"] },
              },
            },
            {
              $project: {
                mergedData: 0, // Remove the temporary field
              },
            },
          ]
        : [
            // If `split` is empty, return { createdAt, totalUsed }
            {
              $group: {
                _id: "$_id.createdAt",
                totalUsed: { $sum: "$totalUsed" },
              },
            },
            {
              $project: {
                _id: 0,
                createdAt: "$_id",
                totalUsed: 1,
              },
            },
          ]),

      { $sort: { createdAt: 1 } },
    ];

    // Execute the aggregation pipeline
    const results = await ProjectsModel.aggregate(pipeline);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in GET /api/logs:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
