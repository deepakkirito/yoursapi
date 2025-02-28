import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    
    const { projectId, userEmail } = await params;

    const { userId, token, email, name, role } = await verifyToken(request);

    if (email === userEmail) {
      return NextResponse.json(
        { message: "You cannot share to yourself" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    const project = await ProjectsModel.findOne({ _id: projectId })
      .populate("shared")
      .populate("userId");

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    if (userEmail === project.userId.email) {
      return NextResponse.json(
        { message: "You cannot share to the project owner" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    if (project.shared.some((item) => item.email === userEmail)) {
      return NextResponse.json(
        { message: "Project already shared with this user" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    const user = await UsersModel.findOne(
      { email: userEmail },
      { _id: 0, name: 1, email: 1, profile: 1 }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400, statusText: "Bad Request" }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
