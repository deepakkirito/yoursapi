import ApisModel from "@/components/backend/api/api/model";
import { validateApiName } from "@/components/backend/api/api/validator";
import AuthsModel from "@/components/backend/api/authApi/model";
import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { validateData } from "@/components/backend/utilities/middlewares/dataValidator";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import { logShared } from "@/components/backend/utilities/middlewares/logShared";
import { mailShared } from "@/components/backend/utilities/middlewares/mailShared";
import {
  connectToDatabase,
  getModelData,
  renameCollection,
  updateModel,
} from "@/components/backend/utilities/middlewares/mongoose";
import { getDataToString } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { userId, username } = await verifyToken(request);

    const { apiNameorId } = await params;

    const { searchParams } = new URL(request.url);
    const environmentType = searchParams.get("type");

    const dataApi = await ApisModel.findOne({
      _id: apiNameorId,
    });

    if (!dataApi) {
      return NextResponse.json(
        {
          message: "API not found",
        },
        { status: 400 }
      );
    }

    const { projectId, name } = dataApi;

    const { ownerUserId, ownerProjectName, projectData } =
      await getProjectOwner({ projectId, userId });

    const dbString = projectData[environmentType].dbString.data;

    const parsedString = dbString ? decrypt(dbString) : null;

    const dbName = ownerProjectName;

    const connection = await connectToDatabase(parsedString, dbName);

    const data = await getModelData({
      dbConnection: connection,
      collectionName: name,
    });

    const apiData = await ApisModel.findOne(
      {
        _id: apiNameorId,
      },
      {
        _id: 0,
        name: 1,
        data: 1,
        createdBy: 1,
        updatedBy: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    )
      .populate("createdBy", "name profile email")
      .populate("updatedBy", "name profile email")
      .lean();

    if (!apiData) {
      return NextResponse.json(
        {
          message: "API not found",
        },
        { status: 400 }
      );
    }

    const project = await ProjectsModel.findOne({
      _id: projectId,
    })
      .populate("authId")
      .lean();

    const user = await UsersModel.findOne({
      _id: userId,
    }).populate("shared.project");

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data,
      apiData: {
        _id: apiData._id,
        name: apiData.name,
        updatedAt: apiData.updatedAt,
        createdAt: apiData.createdAt,
        updatedBy: apiData.updatedBy,
        createdBy: apiData.createdBy,
        authType: project?.authId?.authType || "none",
        ...apiData.data[environmentType],
      },
      permission:
        userId.toString() === ownerUserId.toString()
          ? null
          : user.shared.find((s) => s.project.equals(projectId))?.permission,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { userId, token, email, name, role, body } =
      await verifyToken(request);

    const { apiNameorId: projectId } = await params;

    const { apiName, data, environmentType } = body;

    const validation = await validateRequest(
      { ...request, body },
      validateApiName
    );

    if (validation) {
      return validation;
    }

    const parsedData = validateData(data || "[]");

    const { ownerUserId, ownerProjectName, projectData } =
      await getProjectOwner({ projectId, userId });

    const dbString = projectData[environmentType]?.dbString?.data || null;

    const checkApi = await ApisModel.findOne({
      projectId,
      name: apiName,
      userId: ownerUserId,
    });

    const checkAuthApi = await AuthsModel.findOne({
      projectId,
      name: apiName,
      userId: ownerUserId,
    });

    if (checkAuthApi || checkApi) {
      return NextResponse.json(
        { message: "Api already exists" },
        { status: 400 }
      );
    }

    if (data?.length) {
      try {
        const parsedString = dbString ? decrypt(dbString) : null;

        const dbName = ownerProjectName;

        const connection = await connectToDatabase(parsedString, dbName);

        await updateModel({
          dbConnection: connection,
          collectionName: apiName,
          data: parsedData,
        });

        await connection.close();
      } catch (error) {
        console.log(error);
        return NextResponse.json(
          { message: error.message || "Internal Server Error" },
          { status: 500 }
        );
      }
    }

    const newApi = await ApisModel.create({
      name: apiName,
      projectId,
      userId: ownerUserId,
      createdBy: userId,
      updatedBy: userId,
    });

    await ProjectsModel.findByIdAndUpdate(
      { _id: projectId },
      {
        $push: {
          apiIds: newApi._id,
        },
        updatedBy: userId,
      },
      { new: true, lean: true }
    );

    logShared({
      userId: ownerUserId,
      projectId: projectId,
      log: `Data API '${newApi.name}' created in project '${ownerProjectName}'`,
      type: "data",
      apiId: newApi._id,
      createdBy: userId,
      link: `/projects/${projectId}/dataapi?api=${newApi.name}&id=${newApi._id}`,
      linkShared: `/projects/shared/${projectId}/dataapi?api=${newApi.name}&id=${newApi._id}`,
    });

    mailShared({
      userEmail: email,
      subject: "New Data API Created",
      template: "apiCreate",
      apiName: newApi.name,
      projectId: projectId,
      apiLink: `${process.env.COMPANY_URL}projects/${projectId}/dataapi`,
      apiLinkShared: `${process.env.COMPANY_URL}projects/shared/${projectId}/dataapi`,
    });

    return NextResponse.json({ message: "API created successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { userId, token, email, name, role, body } =
      await verifyToken(request);

    const { apiNameorId } = await params;

    const { newApiName, data, schema, key, value, type, environmentType } =
      body;

    const apiData = await ApisModel.findOne({
      _id: apiNameorId,
    });

    if (!apiData) {
      return NextResponse.json({ message: "API not found" }, { status: 400 });
    }

    const { ownerUserId, ownerProjectName, projectData } =
      await getProjectOwner({
        projectId: apiData.projectId,
        userId,
      });

    const dbString = projectData[environmentType].dbString.data;

    if (schema) {
      const updatedApi = await ApisModel.findOneAndUpdate(
        { _id: apiNameorId },
        {
          $set: {
            [`data.${environmentType}.schema`]: {
              data: schema,
              updatedAt: Date.now(),
            },
            updatedAt: Date.now(),
            updatedBy: userId,
          },
        },
        { new: true, lean: true }
      );

      logShared({
        userId: ownerUserId,
        projectId: apiData.projectId,
        log: `Data API '${apiData.name}' schema updated to ~${getDataToString(
          schema
        )}~ from ~${getDataToString(apiData.schema ? apiData.schema : {})}~ in project '${ownerProjectName}' in environment '${environmentType}'`,
        type: "data",
        apiId: apiData._id,
        createdBy: userId,
        link: `/projects/${apiData.projectId}/dataapi?api=${apiData.name}&id=${apiData._id}`,
        linkShared: `/projects/shared/${apiData.projectId}/dataapi?api=${apiData.name}&id=${apiData._id}`,
      });

      return NextResponse.json({
        message: "Schema updated successfully",
      });
    }

    if (key) {
      const updatedApi = await ApisModel.findOneAndUpdate(
        { _id: apiNameorId },
        {
          $set: {
            [`data.${environmentType}.${key}`]: {
              ...apiData.toObject()[`data.${environmentType}.${key}`],
              [type]: Boolean(value),
            },
            updatedAt: Date.now(),
            updatedBy: userId,
          },
        },
        { new: true, lean: true }
      );

      logShared({
        userId: ownerUserId,
        projectId: apiData.projectId,
        log: `Data API '${apiData.name}' ${key} ${type === "active" ? "status" : "secured"} ${value ? "enabled" : "disabled"} in project '${ownerProjectName}' in environment '${environmentType}'`,
        type: "data",
        apiId: apiData._id,
        createdBy: userId,
        link: `/projects/${apiData.projectId}/dataapi?api=${apiData.name}&id=${apiData._id}`,
        linkShared: `/projects/shared/${apiData.projectId}/dataapi?api=${apiData.name}&id=${apiData._id}`,
      });

      return NextResponse.json({
        message: "Status updated successfully",
      });
    }

    if (newApiName) {
      if (apiData.name === newApiName) {
        return NextResponse.json(
          { message: "New API name cannot be same as old API name" },
          { status: 400 }
        );
      }

      const checkApi = await ApisModel.findOne({
        projectId: apiData.projectId,
        name: newApiName,
        userId: ownerUserId,
      });

      const checkAuthApi = await AuthsModel.findOne({
        projectId: apiData.projectId,
        name: newApiName,
        userId: ownerUserId,
      });

      if (checkAuthApi || checkApi) {
        return NextResponse.json(
          { message: "Api already exists" },
          { status: 400 }
        );
      }

      const parsedString = dbString ? decrypt(dbString) : null;

      if (parsedString) {
        const dbName = ownerProjectName;

        await renameCollection({
          uri: parsedString,
          dbName,
          oldCollectionName: apiData.name,
          newCollectionName: newApiName,
        });
      }

      await ApisModel.findOneAndUpdate(
        { _id: apiNameorId },
        {
          $set: {
            name: newApiName,
            updatedAt: Date.now(),
            updatedBy: userId,
          },
        },
        { new: true, lean: true }
      );

      logShared({
        userId: ownerUserId,
        projectId: apiData.projectId,
        log: `Data API '${apiData.name}' name updated to '${newApiName}' in project '${ownerProjectName}'`,
        type: "data",
        apiId: apiData._id,
        createdBy: userId,
        link: `/projects/${apiData.projectId}/dataapi?api=${apiData.name}&id=${apiData._id}`,
        linkShared: `/projects/shared/${apiData.projectId}/dataapi?api=${apiData.name}&id=${apiData._id}`,
      });

      return NextResponse.json({
        message: "Api name updated successfully",
      });
    }

    if (data) {
      const parsedData = validateData(data || "[]");

      const parsedString = dbString ? decrypt(dbString) : null;

      const dbName = ownerProjectName;

      const connection = await connectToDatabase(parsedString, dbName);

      await updateModel({
        dbConnection: connection,
        collectionName: apiData.name,
        data: parsedData,
        schema: apiData.schema,
      });

      await connection.close();

      logShared({
        userId: ownerUserId,
        projectId: apiData.projectId,
        log: `Data API '${apiData.name}' data updated in project '${ownerProjectName}'`,
        type: "data",
        apiId: apiData._id,
        createdBy: userId,
        link: `/projects/${apiData.projectId}/dataapi?api=${apiData.name}&id=${apiData._id}`,
        linkShared: `/projects/shared/${apiData.projectId}/dataapi?api=${apiData.name}&id=${apiData._id}`,
      });

      return NextResponse.json({
        message: "Data updated successfully",
      });
    }

    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId, token, email, name, role, body, username } =
      await verifyToken(request);

    const { apiNameorId } = await params;

    const { searchParams } = new URL(request.url);
    const environmentType = searchParams.get("type");

    const apiData = await ApisModel.findOne({
      _id: apiNameorId,
    });

    if (!apiData) {
      return NextResponse.json(
        {
          message: "API not found",
        },
        { status: 400 }
      );
    }

    const { ownerUserId, ownerProjectName, projectData } =
      await getProjectOwner({ projectId: apiData.projectId, userId });

    const dbString = projectData[environmentType].dbString.data;

    const parsedString = dbString ? decrypt(dbString) : null;

    if (parsedString) {
      const dbName = ownerProjectName;

      const connection = await connectToDatabase(parsedString, dbName);

      await connection.db.collection(apiData.name).drop();

      await connection.close();
    }

    await ApisModel.deleteOne({ _id: apiNameorId });

    await ProjectsModel.findByIdAndUpdate(
      { _id: apiData.projectId },
      {
        $pull: {
          apiIds: apiNameorId,
        },
        updatedBy: userId,
      },
      { new: true, lean: true }
    );

    logShared({
      userId: ownerUserId,
      projectId: apiData.projectId,
      log: `Data API '${apiData.name}' deleted in project '${ownerProjectName}'`,
      type: "data",
      apiId: apiData._id,
      createdBy: userId,
      link: `/projects/${apiData.projectId}/dataapi`,
      linkShared: `/projects/shared/${apiData.projectId}/dataapi`,
    });

    return NextResponse.json({ message: "API deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
