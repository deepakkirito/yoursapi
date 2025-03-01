import ApisModel from "@/components/backend/api/api/model";
import { validateApiName } from "@/components/backend/api/api/validator";
import AuthsModel from "@/components/backend/api/authApi/model";
import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { validateRequest } from "@/components/backend/utilities/helpers/validator";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { validateData } from "@/components/backend/utilities/middlewares/dataValidator";
import { getProjectOwner } from "@/components/backend/utilities/middlewares/getProjectOwner";
import {
  connectToDatabase,
  getModelData,
  renameCollection,
  updateModel,
} from "@/components/backend/utilities/middlewares/mongoose";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { userId, username } = await verifyToken(request);

    const { apiNameorId } = await params;

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

    const { ownerUserId, fetchData, mongoDbKey, ownerProjectName } =
      await getProjectOwner({ projectId, userId });

    const dbString =
      fetchData === "self" ? process.env.MONGODB_KEY_MAIN : mongoDbKey;

    const dbName =
      fetchData === "self"
        ? `${username}_${ownerProjectName}`
        : ownerProjectName;

    const connection = await connectToDatabase(dbString, dbName);

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
        headRequest: 1,
        postRequest: 1,
        putRequest: 1,
        deleteRequest: 1,
        getRequest: 1,
        schema: 1,
        createdBy: 1,
        updatedBy: 1,
        createdAt: 1,
        updatedAt: 1,
        patchRequest: 1,
      }
    )
      .populate("createdBy", "name profile email")
      .populate("updatedBy", "name profile email");

    if (!apiData) {
      return NextResponse.json(
        {
          message: "API not found",
        },
        { status: 400 }
      );
    }

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
      apiData,
      permission:
        userId.toString() === ownerUserId.toString()
          ? null
          : user.shared.find((s) => s.project.equals(projectId))?.permission ||
            "read",
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

    const { apiName, data } = body;

    const validation = await validateRequest(
      { ...request, body },
      validateApiName
    );

    if (validation) {
      return validation;
    }

    const parsedData = validateData(data || "[]");

    const {
      ownerUserId,
      saveInternal,
      saveExternal,
      mongoDbKey,
      ownerProjectName,
      ownerUsername,
    } = await getProjectOwner({ projectId, userId });

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
        if (saveInternal) {
          const dbString = process.env.MONGODB_KEY_MAIN;
          const dbName = `${ownerUsername}_${ownerProjectName}`;

          const connection = await connectToDatabase(dbString, dbName);

          await updateModel({
            dbConnection: connection,
            collectionName: apiName,
            data: parsedData,
          });

          await connection.close();
        }

        if (saveExternal && mongoDbKey) {
          const dbName = ownerProjectName;

          const connection = await connectToDatabase(mongoDbKey, dbName);

          await updateModel({
            dbConnection: connection,
            collectionName: apiName,
            data: parsedData,
          });

          await connection.close();
        }
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

    const {
      newApiName,
      data,
      schema,
      key,
      value,
      oldApiName,
      projectName,
      projectId,
    } = body;

    const apiData = await ApisModel.findOne({
      _id: apiNameorId,
    });

    if (!apiData) {
      return NextResponse.json({ message: "API not found" }, { status: 400 });
    }

    const {
      ownerUserId,
      ownerProjectName,
      ownerUsername,
      saveInternal,
      saveExternal,
      mongoDbKey,
    } = await getProjectOwner({
      projectId: apiData.projectId,
      userId,
    });

    if (schema) {
      const updatedApi = await ApisModel.findOneAndUpdate(
        { _id: apiNameorId },
        {
          $set: {
            schema: schema,
            updatedAt: Date.now(),
            updatedBy: userId,
          },
        },
        { new: true, lean: true }
      );

      return NextResponse.json({
        message: "Schema updated successfully",
      });
    }

    if (key) {
      const updatedApi = await ApisModel.findOneAndUpdate(
        { _id: apiNameorId },
        {
          $set: {
            [key]: { ...apiData.toObject()[key], active: Boolean(value) },
            updatedAt: Date.now(),
            updatedBy: userId,
          },
        },
        { new: true, lean: true }
      );

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

      if (saveInternal) {
        const dbString = process.env.MONGODB_KEY_MAIN;
        const dbName = `${ownerUsername}_${ownerProjectName}`;

        await renameCollection({
          uri: dbString,
          dbName,
          oldCollectionName: apiData.name,
          newCollectionName: newApiName,
        });
      }

      if (saveExternal && mongoDbKey) {
        const dbName = ownerProjectName;

        await renameCollection({
          uri: mongoDbKey,
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

      return NextResponse.json({
        message: "Api name updated successfully",
      });
    }

    if (data) {
      const parsedData = validateData(data || "[]");

      if (saveInternal) {
        const dbString = process.env.MONGODB_KEY_MAIN;
        const dbName = `${ownerUsername}_${ownerProjectName}`;

        const connection = await connectToDatabase(dbString, dbName);

        await updateModel({
          dbConnection: connection,
          collectionName: apiData.name,
          data: parsedData,
        });

        await connection.close();
      }

      if (saveExternal && mongoDbKey) {
        const dbName = ownerProjectName;

        const connection = await connectToDatabase(mongoDbKey, dbName);

        await updateModel({
          dbConnection: connection,
          collectionName: apiData.name,
          data: parsedData,
        });

        await connection.close();
      }

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

    const {
      ownerUserId,
      saveExternal,
      saveInternal,
      mongoDbKey,
      ownerProjectName,
      ownerUsername,
    } = await getProjectOwner({ projectId: apiData.projectId, userId });

    if (saveExternal) {
      const dbName = ownerProjectName;

      const connection = await connectToDatabase(mongoDbKey, dbName);

      await connection.db.collection(apiData.name).drop();

      await connection.close();
    }

    if (saveInternal) {
      const dbString = process.env.MONGODB_KEY_MAIN;
      const dbName = `${ownerUsername}_${ownerProjectName}`;

      const connection = await connectToDatabase(dbString, dbName);

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
