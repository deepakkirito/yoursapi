import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";
import ApisModel from "@/components/backend/api/api/model";
import { redirectToLogin } from "@/components/backend/utilities/middlewares/customResponse";

export async function GET(request) {
  try {
    const { userId, token, email, name, role } = await verifyToken(request);

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page")) || 0;
    const rows = parseInt(searchParams.get("rows")) || 10;
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "createdAt";
    const sort = searchParams.get("sort") || "desc";

    const user = await UsersModel.findOne({ _id: userId }).lean();

    if (!user) {
      return redirectToLogin(request);
    }

    const projectIds = user.project;

    const query = {
      _id: { $in: projectIds },
      name: { $regex: search, $options: "i" },
    };

    const totalCount = await UsersModel.countDocuments(query);

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

    const data = projects.map((project) => ({
      ...project,
      apiIds: project.apiIds.map((api) => api.name),
      updatedBy: project.updatedBy && {
        name: project.updatedBy.name,
        email: project.updatedBy.email,
        profile: project.updatedBy.profile,
      },
      shared: project.shared.map(({ name, email, profile }) => ({
        name,
        email,
        profile,
      })),
    }));

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
