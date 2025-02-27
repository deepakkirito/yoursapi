import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") || 0;
    const rows = searchParams.get("rows") || 10;
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "createdAt";
    const sort = searchParams.get("sort") || "desc";

    const user = await UsersModel.findOne({ _id: userId }).populate(
      "shared.project"
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const projectIds = user.shared.map((s) => s.project);

    const query = {
      _id: { $in: projectIds },
      name: { $regex: search, $options: "i" },
    };

    const totalCount = await ProjectsModel.countDocuments(query);

    const projects = await ProjectsModel.find(query, {
      name: 1,
      updatedAt: 1,
      createdAt: 1,
      apiIds: 1,
      _id: 1,
      updatedBy: 1,
      shared: 1,
    })
      .sort({ [filter]: sort === "lth" ? 1 : -1 })
      .skip(page * rows)
      .limit(parseInt(rows))
      .populate("updatedBy", "name email profile")
      .populate("shared", "name email profile")
      .populate("userId", "name email profile")
      .populate("apiIds", "name")
      .lean();

    const data = await Promise.all(
      projects.map(async (project) => ({
        ...project,
        apiIds: project.apiIds.map((api) => api.name),
        updatedBy: project.updatedBy,
        shared: project.shared,
        owner: project.userId,
        permission:
          user.shared.find(
            (s) => s.project._id.toString() === project._id.toString()
          )?.permission || "read",
        status: await getProjectStatus(project._id, project.userId._id),
      }))
    );

    return NextResponse.json({
      data,
      totalCount,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const getProjectStatus = (projectId, userId) => {
  return UsersModel.findOne({ _id: userId }).then((user) => {
    if (user.trash.includes(projectId)) {
      return "inactive";
    }
    return "active";
  });
};
