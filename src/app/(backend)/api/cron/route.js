import ApisModel from "@/components/backend/api/api/model";
import AuthsModel from "@/components/backend/api/authApi/model";
import ProjectsModel from "@/components/backend/api/project/model";
import StatisticsModel from "@/components/backend/api/statistics/model";
import UsersModel from "@/components/backend/api/users/model";
import { dbConnect } from "@/components/backend/utilities/dbConnect";
import { convertToIST } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

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
        apiUsed: apis.map((api) => ({
          name: api._id,
          headUsed: api.headRequest?.used || 0,
          getUsed: api.getRequest?.used || 0,
          postUsed: api.postRequest?.used || 0,
          putUsed: api.putRequest?.used || 0,
          patchUsed: api.patchRequest?.used || 0,
          deleteUsed: api.deleteRequest?.used || 0,
          logs: api.logs || [],
        })),
        authUsed: auths
          ? {
              name: auths._id,
              headUsed: auths.headRequest?.used || 0,
              getUsed: auths.getRequest?.used || 0,
              postUsed: auths.postRequest?.used || 0,
              putUsed: auths.putRequest?.used || 0,
              patchUsed: auths.patchRequest?.used || 0,
              deleteUsed: auths.deleteRequest?.used || 0,
              logs: auths.logs || [],
            }
          : undefined,
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
    { $set: { usedReq: 0, lastReset: convertToIST(new Date()) } }
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
        logs: []
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
        logs: []
      },
    }
  );
  return NextResponse.json({ ok: true });
}
