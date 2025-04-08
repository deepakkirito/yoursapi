import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { NextResponse } from "next/server";
import ApisModel from "@/components/backend/api/api/model";
import { redirectToLogin } from "@/components/backend/utilities/middlewares/customResponse";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { validateProjectName } from "@/components/backend/api/project/validator";
import { validateApiName } from "@/components/backend/api/api/validator";
import { validateData } from "@/components/backend/utilities/middlewares/dataValidator";
import { decrypt } from "@/utilities/helpers/encryption";
import { saveData } from "@/components/backend/utilities/middlewares/saveData";
import { sendMail } from "@/components/backend/utilities/nodemailer";
import LoggersModel from "@/components/backend/api/logger";
import { convertToIST, getDate } from "@/utilities/helpers/functions";
import SubscriptionModel from "@/components/backend/api/subscription/model";

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

    const totalCount = await ProjectsModel.countDocuments(query);

    const projects = await ProjectsModel.find(query, {
      name: 1,
      updatedAt: 1,
      createdAt: 1,
      apiIds: 1,
      _id: 1,
      updatedBy: 1,
      shared: 1,
      description: 1,
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

export async function POST(request) {
  try {
    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const validateProject = await validateRequest(
      { ...request, body },
      validateProjectName
    );

    if (validateProject) {
      return validateProject;
    }

    const project = await ProjectsModel.findOne({
      name: body.projectName,
      userId,
    });

    if (project) {
      return NextResponse.json(
        { message: "Project already exists" },
        { status: 400 }
      );
    }

    const user = await UsersModel.findOne({ _id: userId }).lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401, statusText: "Unauthorized" }
      );
    }

    const subscriptions = await SubscriptionModel.find({
      status: true,
    }).lean();

    const newProject = await ProjectsModel.create({
      name: body.projectName,
      description: body.description,
      type: body.type,
      userId,
      updatedBy: userId,
      createdBy: userId,
      data: {
        production: {
          "activeSubscription.data": subscriptions[0]._id,
        },
        development: {
          "activeSubscription.data": subscriptions[0]._id,
        },
      },
    });

    await UsersModel.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          project: newProject._id,
        },
      },
      { new: true, lean: true }
    );

    await LoggersModel.create({
      userId: userId,
      type: "project",
      createdBy: userId,
      projectId: newProject._id,
      log: `Project '${body.projectName}' created for ${body.type === "youpiapi" ? "Youpi Api" : "Web Hosting"}`,
      link: `${process.env.COMPANY_URL}projects/${newProject._id}`,
    });

    await sendMail({
      to: email,
      subject: "New Project Created",
      template: "projectCreate",
      context: {
        username: name,
        projectName: body.projectName,
        creationDate: getDate(new Date()),
        projectLink: `${process.env.COMPANY_URL}projects/${newProject._id}`,
      },
    });

    return NextResponse.json(
      { message: "Project created successfully" },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
