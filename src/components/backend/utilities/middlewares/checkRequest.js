import { NextResponse } from "next/server";
import ApisModel from "../../api/api/model";
import UsersModel from "../../api/users/model";
import ProjectsModel from "../../api/project/model";
import AuthsModel from "../../api/authApi/model";

export const checkRequest = async ({
  username,
  projectname,
  apiname,
  reqType,
  auth = false,
}) => {
  try {
    // Fetch user and project details in parallel
    const [user, project] = await Promise.all([
      UsersModel.findOne({ username }).lean(),
      ProjectsModel.findOne({ name: projectname }).lean(),
    ]);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid user or API" },
        { status: 404 }
      );
    }

    if (!project || String(project.userId) !== String(user._id)) {
      return NextResponse.json(
        { message: "Invalid project or API" },
        { status: 404 }
      );
    }

    const api = await ApisModel.findOne({
      projectId: project._id,
      name: apiname,
      userId: user._id,
    }).lean();

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
      const projectIds = userProjects.map((p) => p._id);

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
          },
        }
      );
    }

    // ✅ Check API usage limit after reset
    if (user.totalReq <= user.usedReq) {
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
      UsersModel.updateOne({ _id: user._id }, { $inc: { usedReq: 1 } }),
    ];

    if (!auth) {
      updatePromises.push(
        ApisModel.updateOne(
          { _id: api._id },
          { $inc: { [`${reqType}.used`]: 1 } }
        )
      );
    }

    if (auth) {
      updatePromises.push(
        AuthsModel.updateOne({ _id: auth._id }, { $inc: { used: 1 } })
      );
    }

    // ✅ Ensures only valid promises are executed
    await Promise.all(updatePromises);

    return null;
  } catch (error) {
    console.error("Error in checkRequest:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
};
