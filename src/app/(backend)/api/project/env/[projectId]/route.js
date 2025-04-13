import ProjectsModel from "@/components/backend/api/project/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { NextResponse } from "next/server";
import generator from "generate-password";

const generateEnvId = () =>
  generator.generate({
    length: 10,
    lowercase: true,
    numbers: true,
  });

export async function GET(request, { params }) {
  try {
    const { projectId } = await params;

    const { userId } = await verifyToken(request);

    const searchParams = new URL(request.url).searchParams;
    const environment = searchParams.get("environment") || "production";
    const envId = searchParams.get("id");

    const { ownerUserId } = await getProjectOwner({
      userId,
      projectId,
    });

    const project = await ProjectsModel.findOne({
      _id: projectId,
    }).lean();

    if (envId) {
      return NextResponse.json({
        value: project?.data[environment]?.environmentVariables?.data.find(
          (env) => env.id === envId
        )?.value,
        id: project?.data[environment]?.environmentVariables?.data.find(
          (env) => env?.id === envId
        )?.id,
      });
    } else if (!envId) {
      return NextResponse.json({
        data:
          project?.data[environment]?.environmentVariables?.data?.length > 0
            ? project?.data[environment]?.environmentVariables?.data.map(
                (env) => ({
                  key: env.key,
                  id: env.id,
                  updatedAt: env.updatedAt,
                })
              )
            : [],
        updatedAt: project?.data[environment]?.environmentVariables?.updatedAt,
      });
    }

    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || error },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { projectId } = await params;

    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { ownerUserId } = await getProjectOwner({
      userId,
      projectId,
    });

    const searchParams = new URL(request.url).searchParams;
    const environment = searchParams.get("environment") || "production";

    const { key, value } = body;

    const project = await ProjectsModel.findOne({
      _id: projectId,
      userId: ownerUserId,
    }).lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    if (!key || !value) {
      return NextResponse.json(
        { message: "Environment variable key and value are required" },
        { status: 400 }
      );
    }

    const env = project?.data[environment]?.environmentVariables?.data?.find(
      (env) => env.key === key.replace(/\s+/g, " ").trim()
    );

    if (env) {
      return NextResponse.json(
        { message: "Environment variable already exists" },
        { status: 400 }
      );
    }

    await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        [`data.${environment}.environmentVariables.data`]: [
          ...(project?.data[environment]?.environmentVariables?.data || []),
          {
            id: generateEnvId(),
            key: key.replace(/\s+/g, " ").trim(),
            value,
            updatedAt: new Date(),
          },
        ],
        [`data.${environment}.environmentVariables.updatedAt`]: new Date(),
      },
      { new: true, lean: true }
    );

    return NextResponse.json({
      message: "Environment variable added successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { projectId } = await params;

    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { ownerUserId } = await getProjectOwner({
      userId,
      projectId,
    });

    const searchParams = new URL(request.url).searchParams;
    const environment = searchParams.get("environment") || "production";
    const envId = searchParams.get("id");

    const { value, key } = body;

    const project = await ProjectsModel.findOne({
      _id: projectId,
      userId: ownerUserId,
    }).lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    if (!envId) {
      return NextResponse.json(
        { message: "Environment variable id not found" },
        { status: 400 }
      );
    }

    const environmentVariables = project.data[environment].environmentVariables;

    const env = environmentVariables.data.find((env) => env.id === envId);

    if (!env) {
      return NextResponse.json(
        { message: "Environment variable not found" },
        { status: 400 }
      );
    }

    await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        [`data.${environment}.environmentVariables.data`]:
          environmentVariables.data.map((env) => {
            if (env.id === envId) {
              return {
                ...env,
                value: value || env.value,
                key: key.replace(/\s+/g, " ").trim() || env.key,
                updatedAt: new Date(),
              };
            }
            return env;
          }),
        [`data.${environment}.environmentVariables.updatedAt`]: new Date(),
      },
      { new: true, lean: true }
    );

    return NextResponse.json({
      message: "Environment variable updated successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { projectId } = await params;

    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { ownerUserId } = await getProjectOwner({
      userId,
      projectId,
    });

    const searchParams = new URL(request.url).searchParams;
    const environment = searchParams.get("environment") || "production";
    const envId = searchParams.get("id");

    const project = await ProjectsModel.findOne({
      _id: projectId,
      userId: ownerUserId,
    }).lean();

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 400 }
      );
    }

    if (!envId) {
      return NextResponse.json(
        { message: "Environment variable id not found" },
        { status: 400 }
      );
    }

    const env = project.data[environment].environmentVariables.data.find(
      (env) => env.id === envId
    );

    if (!env) {
      return NextResponse.json(
        { message: "Environment variable not found" },
        { status: 400 }
      );
    }

    await ProjectsModel.findOneAndUpdate(
      { _id: projectId },
      {
        [`data.${environment}.environmentVariables.data`]: project.data[
          environment
        ].environmentVariables.data.filter((env) => env.id !== envId),
        [`data.${environment}.environmentVariables.updatedAt`]: new Date(),
      },
      { new: true, lean: true }
    );

    return NextResponse.json({
      message: "Environment variable deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
