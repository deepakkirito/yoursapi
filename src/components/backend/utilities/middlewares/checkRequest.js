import { NextResponse } from "next/server";
import ApisModel from "../../api/api/model";
import UsersModel from "../../api/users/model";
import ProjectsModel from "../../api/project/model";


export const checkRequest = async ({
  username,
  projectname,
  apiname,
  reqType,
}) => {
  try {
    // Fetch user, project, and API details in parallel
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

    // Check API usage limit
    if (user.totalReq <= user.usedReq) {
      return NextResponse.json(
        { message: "You have reached your request limit" },
        { status: 403 }
      );
    }

    
    
    // Check if API is active
    if (!api[reqType]?.active) {
        console.log(api[reqType]?.active);
      return NextResponse.json(
        { message: "This API is currently unavailable" },
        { status: 400 }
      );
    }

    // Increment user & API usage in parallel
    await Promise.all([
      UsersModel.updateOne({ _id: user._id }, { $inc: { usedReq: 1 } }),
      ApisModel.updateOne(
        { _id: api._id },
        { $inc: { [`${reqType}.used`]: 1 } } // Fixed incrementing API usage
      ),
    ]);

    return null;
  } catch (error) {
    console.error("Error in checkRequest:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
};
