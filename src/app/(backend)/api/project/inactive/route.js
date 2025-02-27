import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { redirectToLogin } from "@/components/backend/utilities/middlewares/customResponse";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { searchParams } = new URL(request.url);

    const page = request.nextUrl.searchParams.get("page") || 0;
    const rows = request.nextUrl.searchParams.get("rows") || 10;
    const search = request.nextUrl.searchParams.get("search") || "";
    const filter = request.nextUrl.searchParams.get("filter") || "createdAt";
    const sort = request.nextUrl.searchParams.get("sort") || "desc";

    const user = await UsersModel.findOne({ _id: userId }).lean();

    if (!user) {
      return redirectToLogin(request);
    }

    const projectsIds = user.trash;

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
        .populate("apiIds", "name")
        .lean();

    const data = projects.map(project => ({
        ...project,
        apiIds: project.apiIds.map(apiId => apiId.name),
        updatedBy: project.updatedBy,
        shared: project.shared,
    }))

    return NextResponse.json({
      data,
      totalCount,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message });
  }
}
