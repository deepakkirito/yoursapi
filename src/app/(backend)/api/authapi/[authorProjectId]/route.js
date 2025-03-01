import ApisModel from "@/components/backend/api/api/model";
import AuthsModel from "@/components/backend/api/authApi/model";
import { validateAuthApi } from "@/components/backend/api/authApi/validator";
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
} from "@/components/backend/utilities/middlewares/mongoose";
import { sendMail } from "@/components/backend/utilities/nodemailer";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { authorProjectId: projectId } = await params;

    const { userId, token, email, name, role, body } =
      await verifyToken(request);

    const {
      ownerUserId,
      ownerEmail,
      ownerName,
      ownerProjectName,
      fetchData,
      mongoDbKey,
    } = await getProjectOwner({ userId, projectId });

    const { searchParams } = new URL(request.url);

    const { data } = body;

    const authData = await AuthsModel.findOne({
      userId: ownerUserId,
      projectId,
    })
      .populate("createdBy", "name email profile")
      .populate("updatedBy", "name email profile");

    const user = await UsersModel.findOne({ _id: userId }).populate(
      "shared.project"
    );

    if (!authData) {
      return NextResponse.json(
        {
          name: "",
          permission:
            ownerUserId.toString() === userId.toString()
              ? null
              : user.shared.find((s) => s.project.equals(projectId))
                  ?.permission || "read",
        },
        { status: 200 }
      );
    }

    if (data === "true") {
      const dbString =
        fetchData === "self" ? process.env.MONGODB_KEY_MAIN : mongoDbKey;
      const dbName =
        fetchData === "self"
          ? `${ownerUsername}_${ownerProjectName}`
          : ownerProjectName;

      const connection = await connectToDatabase(dbString, dbName);

      var data = await getModelData({
        dbConnection: connection,
        collectionName: authData.name,
      });

      await connection.close();

      return NextResponse.json(data);
    }

    return NextResponse.json({
      authData,
      data: data || [],
      permission:
        ownerUserId.toString() === userId.toString()
          ? null
          : user.shared.find((s) => s.project.equals(projectId))?.permission ||
            "read",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { authorProjectId: projectId } = await params;

    const { userId, token, email, name, role, body } =
      await verifyToken(request);

    const { name: apiName } = body;

    const validator = await validateRequest({ ...request, body }, validateAuthApi);

    if (validator) {
      return validator;
    }

    const { ownerUserId, ownerEmail, ownerName, ownerProjectName } =
      await getProjectOwner({ userId, projectId });

    const authData = await AuthsModel.findOne({
      userId: ownerUserId,
      projectId,
    });

    if (authData) {
      return NextResponse.json(
        {
          message: "An Auth API is already created",
        },
        { status: 400 }
      );
    }

    const newAuth = await AuthsModel.create({
      name: apiName || "auth",
      userId: ownerUserId,
      projectId,
      createdBy: ownerUserId,
      updatedBy: ownerUserId,
    });

    await ProjectsModel.findByIdAndUpdate(
      { _id: projectId },
      {
        $push: {
          authId: newAuth._id,
        },
        updatedBy: ownerUserId,
      },
      { new: true, lean: true }
    );

    sendMail({
      to: ownerEmail,
      subject: "Auth API Created",
      template: "apiCreate",
      context: {
        username: ownerName,
        apiName: apiName,
        projectName: ownerProjectName,
        creationDate: new Date(),
        apiLink: `${process.env.COMPANY_URL}${projectId}/data`,
      },
    });

    return NextResponse.json({ message: "Auth API created successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { authorProjectId: authId } = await params;

    const { userId, token, email, name, role, body } =
      await verifyToken(request);

    const {
      name: apiName,
      data,
      authType,
      tokenAge,
      schema,
      reqType,
      reqValue,
      captcha,
    } = body;

    const authData = await AuthsModel.findOne({
      _id: authId,
    });

    if (!authData) {
      return NextResponse.json(
        {
          message: "Auth API not found",
        },
        { status: 400 }
      );
    }

    const {
      ownerUserId,
      ownerEmail,
      ownerName,
      ownerProjectName,
      saveExternal,
      saveInternal,
      mongoDbKey,
      ownerUsername,
    } = await getProjectOwner({ userId, projectId: authData.projectId });

    if (apiName) {
      const validator = await validateRequest({ ...request, body }, validateAuthApi);

      if (validator) {
        return validator;
      }

      if (authData.name === apiName) {
        return NextResponse.json(
          {
            message: "New API name cannot be same as old API name",
          },
          { status: 400 }
        );
      }

      const checkApi = await ApisModel.findOne({
        projectId: authData.projectId,
        name: apiName,
        userId: ownerUserId,
      });

      const checkAuthApi = await AuthsModel.findOne({
        projectId: authData.projectId,
        name: apiName,
        userId: ownerUserId,
      });

      if (checkAuthApi || checkApi) {
        return NextResponse.json(
          {
            message: "Api already exists",
          },
          { status: 400 }
        );
      }

      if (saveInternal) {
        const dbString = process.env.MONGODB_KEY_MAIN;
        const dbName = `${ownerUsername}_${ownerProjectName}`;

        await renameCollection({
          uri: dbString,
          dbName,
          oldCollectionName: authData.name,
          newCollectionName: apiName,
        });
      }

      if (saveExternal && mongoDbKey) {
        const dbName = ownerProjectName;

        await renameCollection({
          uri: mongoDbKey,
          dbName,
          oldCollectionName: authData.name,
          newCollectionName: apiName,
        });
      }

      await AuthsModel.findOneAndUpdate(
        { _id: authId },
        {
          $set: {
            name: apiName,
            updatedAt: Date.now(),
            updatedBy: userId,
          },
        },
        { new: true, lean: true }
      );

      if (data) {
        const parsedData = validateData(data || "[]");

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

        return NextResponse.json({
          message: "Data updated successfully",
        });
      }

      return NextResponse.json({
        message: "Api name updated successfully",
      });
    }

    if (
      authType ||
      schema ||
      tokenAge ||
      (reqType && reqValue !== undefined) ||
      captcha !== undefined
    ) {
      const newAuthapi = authData.toObject();

      const updatedFields = {
        authType: authType || newAuthapi.authType,
        schema: schema || newAuthapi.schema,
        tokenAge: tokenAge || newAuthapi.tokenAge,
        updatedBy: userId,
        captcha: captcha || newAuthapi.captcha,
      };

      if (reqType && reqValue !== undefined) {
        updatedFields[reqType] = {
          used: newAuthapi[reqType].used,
          active: Boolean(reqValue),
        };
      }

      await AuthsModel.findOneAndUpdate(
        { _id: authId },
        {
          $set: updatedFields,
        },
        { new: true, lean: true }
      );

      return NextResponse.json({
        message: "Auth API updated successfully",
      });
    }

    return NextResponse.json(
      {
        message: "Invalid request",
      },
      { status: 400 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { authorProjectId: authId } = await params;

    const { userId, token, email, name, role, body } =
      await verifyToken(request);

    const authData = await AuthsModel.findOne({
      _id: authId,
    });

    if (!authData) {
      return NextResponse.json(
        {
          message: "Auth API not found",
        },
        { status: 400 }
      );
    }

    const {
      ownerUserId,
      ownerEmail,
      ownerName,
      ownerProjectName,
      saveExternal,
      saveInternal,
      mongoDbKey,
      ownerUsername,
    } = await getProjectOwner({ userId, projectId: authData.projectId });

    if (saveExternal) {
      const dbName = ownerProjectName;

      const connection = await connectToDatabase(mongoDbKey, dbName);

      await connection.db.collection(authData.name).drop();

      await connection.close();
    }

    if (saveInternal) {
      const dbString = process.env.MONGODB_KEY_MAIN;
      const dbName = `${ownerUsername}_${ownerProjectName}`;

      const connection = await connectToDatabase(dbString, dbName);

      await connection.db.collection(authData.name).drop();

      await connection.close();
    }

    await AuthsModel.deleteOne({ _id: authId });

    await ProjectsModel.findByIdAndUpdate(
      { _id: authData.projectId },
      {
        $pull: {
          authIds: authId,
        },
        updatedBy: userId,
      },
      { new: true, lean: true }
    );

    return NextResponse.json({ message: "Auth API deleted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
