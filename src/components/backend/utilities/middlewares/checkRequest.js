import { NextResponse } from "next/server";
import ApisModel from "../../api/api/model";
import UsersModel from "../../api/users/model";
import ProjectsModel from "../../api/project/model";
import AuthsModel from "../../api/authApi/model";
import StatisticsModel from "../../api/statistics/model";
import LoggersModel from "../../api/logger";
import { dbConnect } from "@/components/backend/utilities/dbConnect";

export const checkRequest = async ({
  username,
  projectname,
  apiname,
  reqType,
  auth = false,
}) => {
  try {
    await dbConnect();

    const user = await UsersModel.findOne({ username })
      .populate("project")
      .populate({
        path: "trash",
        select: "name", // Only select the 'name' field of trash
      })
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "Invalid user or API" },
        { status: 404 }
      );
    }

    // Use a more optimized search for project and trash (filter can be faster)
    const project = user.project.find((p) => p.name === projectname);
    const inactiveProject = user.trash.find((p) => p.name === projectname);

    if (inactiveProject) {
      return NextResponse.json(
        { message: "Project is inactive" },
        { status: 404 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { message: "Invalid project or API" },
        { status: 404 }
      );
    }

    const [apiData, authData] = await Promise.all([
      ApisModel.findOne({
        projectId: project._id,
        name: apiname,
        userId: user._id,
      }).lean(),
      AuthsModel.findOne({
        projectId: project._id,
        name: apiname,
        userId: user._id,
      }).lean(),
    ]);

    const api = apiData || authData;

    if (!api) {
      return NextResponse.json({ message: "Invalid API" }, { status: 404 });
    }

    // ✅ Check and Reset Usage If Needed
    const today = new Date().setHours(0, 0, 0, 0);
    const lastResetDate = new Date(user.lastReset).setHours(0, 0, 0, 0);

    if (lastResetDate < today) {
      // Find all projects owned by the user
      const userProjects = await ProjectsModel.find({
        userId: user._id,
      }).lean();

      const projectIds = [];

      const projectsUsed = await Promise.all(
        userProjects.map(async (project) => {
          projectIds.push(project._id);
          const apis = await ApisModel.find({
            projectId: project._id,
          }).lean();

          const auths = await AuthsModel.findOne({
            projectId: project._id,
          }).lean();

          return {
            name: project._id,
            apiUsed: [
              ...apis.map((api) => ({
                name: api._id,
                headUsed: api.headRequest?.used || 0,
                getUsed: api.getRequest?.used || 0,
                postUsed: api.postRequest?.used || 0,
                putUsed: api.putRequest?.used || 0,
                patchUsed: api.patchRequest?.used || 0,
                deleteUsed: api.deleteRequest?.used || 0,
                logs: api.logs || [],
              })),
              ...(auths
                ? [
                    {
                      name: auths._id,
                      headUsed: auths.headRequest?.used || 0,
                      getUsed: auths.getRequest?.used || 0,
                      postUsed: auths.postRequest?.used || 0,
                      putUsed: auths.putRequest?.used || 0,
                      patchUsed: auths.patchRequest?.used || 0,
                      deleteUsed: auths.deleteRequest?.used || 0,
                      logs: auths.logs || [],
                    },
                  ]
                : []),
            ],
          };
        })
      );

      await StatisticsModel.create({
        userId: user._id,
        totalUsed: user.usedReq,
        projectsUsed,
      });

      // Reset user request count
      await UsersModel.updateOne(
        { _id: user._id },
        { $set: { usedReq: 0, lastReset: new Date() } }
      );

      // Reset all APIs & auth APIs usage in user's projects
      await ApisModel.updateMany(
        { projectId: { $in: projectIds } },
        {
          $set: {
            "getRequest.used": 0,
            "postRequest.used": 0,
            "putRequest.used": 0,
            "deleteRequest.used": 0,
            "headRequest.used": 0,
            "patchRequest.used": 0,
            logs: [],
          },
        }
      );

      await AuthsModel.updateMany(
        { projectId: { $in: projectIds } },
        {
          $set: {
            "getRequest.used": 0,
            "postRequest.used": 0,
            "putRequest.used": 0,
            "deleteRequest.used": 0,
            "headRequest.used": 0,
            "patchRequest.used": 0,
            logs: [],
          },
        }
      );
    }

    // ✅ Check API usage limit after reset
    if (user.totalReq <= user.usedReq) {
      const log = await LoggersModel.findOne({
        userId: user._id,
        type: "user",
        createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
      });
      if (!log) {
        await LoggersModel.create({
          userId: user._id,
          type: "user",
          createdBy: user._id,
          log: `You have reached your request limit`,
        });
      }
      return NextResponse.json(
        { message: "You have reached your request limit" },
        { status: 403 }
      );
    }

    // ✅ Check if API is active
    if (!api[reqType]?.active) {
      return NextResponse.json(
        { message: "This API is currently unavailable" },
        { status: 400 }
      );
    }

    // ✅ Increment user & API usage in parallel
    const updatePromises = [
      UsersModel.findByIdAndUpdate({ _id: user._id }, { $inc: { usedReq: 1 } }),
    ];

    const log = { type: reqType, createdAt: new Date() };
    console.log({ log });

    if (apiData) {
      updatePromises.push(
        ApisModel.findByIdAndUpdate(
          { _id: api._id },
          { $inc: { [`${reqType}.used`]: 1 }, $push: { logs: log } }
        )
      );
    }

    if (authData) {
      updatePromises.push(
        AuthsModel.findByIdAndUpdate(
          { _id: auth._id },
          { $inc: { [`${reqType}.used`]: 1 }, $push: { logs: log } }
        )
      );
    }

    // ✅ Ensures only valid promises are executed
    Promise.all(updatePromises);

    return (authData && "auth") || (apiData && "data") || null;
  } catch (error) {
    console.error("Error in checkRequest:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
};
