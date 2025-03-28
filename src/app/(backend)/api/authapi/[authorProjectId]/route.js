import ApisModel from "@/components/backend/api/api/model";
import AuthsModel from "@/components/backend/api/authApi/model";
import { validateAuthApi } from "@/components/backend/api/authApi/validator";
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
      projectMongoDbKey,
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
        fetchData === "self"
          ? process.env.MONGODB_KEY_MAIN
          : fetchData === "master"
            ? mongoDbKey
            : fetchData === "project"
              ? projectMongoDbKey
              : null;

      const dbName =
        fetchData === "self"
          ? `${ownerUsername}_${ownerProjectName}`
          : fetchData === "master"
            ? ownerProjectName
            : fetchData === "project"
              ? ownerProjectName
              : null;

      if (!dbString) {
        return NextResponse.json(
          {
            message: "No database connection found",
          },
          { status: 400 }
        );
      }

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

    const validator = await validateRequest(
      { ...request, body },
      validateAuthApi
    );

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
      name: apiName?.toLowerCase() || "auth",
      userId: ownerUserId,
      projectId,
      createdBy: ownerUserId,
      updatedBy: ownerUserId,
    });

    await ProjectsModel.findByIdAndUpdate(
      { _id: projectId },
      {
        $set: {
          authId: newAuth._id,
        },
        updatedBy: ownerUserId,
      },
      { new: true, lean: true }
    );

    logShared({
      userId: ownerUserId,
      log: `Auth API '${newAuth.name}' created in project '${ownerProjectName}'`,
      type: "auth",
      projectId: projectId,
      authId: newAuth._id,
      createdBy: userId,
      link: `/projects/${projectId}/authapi`,
      linkShared: `/projects/shared/${projectId}/authapi`,
    });

    mailShared({
      userEmail: email,
      subject: "New Auth API Created",
      template: "apiCreate",
      apiName: apiName,
      projectId: projectId,
      apiLink: `${process.env.COMPANY_URL}projects/${projectId}/auth`,
      apiLinkShared: `${process.env.COMPANY_URL}projects/shared/${projectId}/auth`,
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
      mongoDbKey,
      ownerUsername,
      fetchData,
      projectMongoDbKey,
    } = await getProjectOwner({ userId, projectId: authData.projectId });

    if (apiName) {
      const validator = await validateRequest(
        { ...request, body },
        validateAuthApi
      );

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

      // Self
      const dbString = process.env.MONGODB_KEY_MAIN;
      const dbName = `${ownerUsername}_${ownerProjectName}`;

      await renameCollection({
        uri: dbString,
        dbName,
        oldCollectionName: authData.name,
        newCollectionName: apiName,
      });

      // Master
      if (mongoDbKey) {
        const dbName = ownerProjectName;

        await renameCollection({
          uri: mongoDbKey,
          dbName,
          oldCollectionName: authData.name,
          newCollectionName: apiName,
        });
      }

      // Project
      if (projectMongoDbKey) {
        const dbString = projectMongoDbKey;
        const dbName = ownerProjectName;

        await renameCollection({
          uri: dbString,
          dbName,
          oldCollectionName: authData.name,
          newCollectionName: apiName,
        });
      }

      await AuthsModel.findOneAndUpdate(
        { _id: authId },
        {
          $set: {
            name: apiName.toLowerCase(),
            updatedAt: Date.now(),
            updatedBy: userId,
          },
        },
        { new: true, lean: true }
      );

      logShared({
        userId: ownerUserId,
        log: `Auth API name '${authData.name}' updated to '${apiName}' in project '${ownerProjectName}'`,
        type: "auth",
        projectId: authData.projectId,
        authId: authData._id,
        createdBy: userId,
        link: `/projects/${authData.projectId}/authapi`,
        linkShared: `/projects/shared/${authData.projectId}/authapi`,
      });

      return NextResponse.json({
        message: "Api name updated successfully",
      });
    }

    if (data) {
      const parsedData = validateData(data || "[]");

      const dbString =
        fetchData === "self"
          ? process.env.MONGODB_KEY_MAIN
          : fetchData === "master"
            ? mongoDbKey
            : fetchData === "project"
              ? projectMongoDbKey
              : null;

      const dbName =
        fetchData === "self"
          ? `${ownerUsername}_${ownerProjectName}`
          : fetchData === "project"
            ? ownerProjectName
            : fetchData === "master"
              ? ownerProjectName
              : null;

      if (!dbString) {
        return NextResponse.json(
          {
            message: "No database connection found",
          },
          { status: 400 }
        );
      }

      const connection = await connectToDatabase(dbString, dbName);

      await updateModel({
        dbConnection: connection,
        collectionName: apiName,
        data: parsedData,
      });

      await connection.close();

      logShared({
        userId: ownerUserId,
        log: `Auth API '${authData.name}' data updated in project '${ownerProjectName}'`,
        type: "auth",
        projectId: authData.projectId,
        authId: authData._id,
        createdBy: userId,
        link: `/projects/${authData.projectId}/authapi`,
        linkShared: `/projects/shared/${authData.projectId}/authapi`,
      });

      return NextResponse.json({
        message: "Data updated successfully",
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

      const getMessage = () => {
        if (authType) {
          return `Auth API '${newAuthapi.name}' auth type updated to ${authType} from ${newAuthapi.authType} in project '${ownerProjectName}'`;
        }
        if (schema) {
          return `Auth API '${newAuthapi.name}' schema updated to ~${String(schema)}~ from ~${String(newAuthapi.schema)}~ in project '${ownerProjectName}'`;
        }
        if (tokenAge) {
          return `Auth API '${newAuthapi.name}' token age updated to ${tokenAge} from ${newAuthapi.tokenAge} in project '${ownerProjectName}'`;
        }
        if (reqType && reqValue !== undefined) {
          return `Auth API '${newAuthapi.name}' request type ${reqType} status updated to ${reqValue ? "enabled" : "disabled"} in project '${ownerProjectName}'`;
        }
        if (captcha !== undefined) {
          return `Auth API '${newAuthapi.name}' captcha updated to ${captcha} from ${newAuthapi.captcha} in project '${ownerProjectName}'`;
        }
      };

      logShared({
        userId: ownerUserId,
        projectId: authData.projectId,
        log: getMessage(),
        type: "auth",
        authId: authData._id,
        createdBy: userId,
        link: `/projects/${authData.projectId}/authapi`,
        linkShared: `/projects/shared/${authData.projectId}/authapi`,
      });

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
      mongoDbKey,
      ownerUsername,
      projectMongoDbKey,
    } = await getProjectOwner({ userId, projectId: authData.projectId });

    // Master
    if (mongoDbKey) {
      const dbName = ownerProjectName;

      const connection = await connectToDatabase(mongoDbKey, dbName);

      await connection.db.collection(authData.name).drop();

      await connection.close();
    }

    // Self
    const dbString = process.env.MONGODB_KEY_MAIN;
    const dbName = `${ownerUsername}_${ownerProjectName}`;

    const connection = await connectToDatabase(dbString, dbName);

    await connection.db.collection(authData.name).drop();

    await connection.close();

    // Project
    if (projectMongoDbKey) {
      const dbString = projectMongoDbKey;
      const dbName = ownerProjectName;

      const connection = await connectToDatabase(dbString, dbName);

      await connection.db.collection(authData.name).drop();

      await connection.close();
    }

    await AuthsModel.deleteOne({ _id: authId });

    await ProjectsModel.findByIdAndUpdate(
      { _id: authData.projectId },
      {
        $set: {
          authId: null,
        },
        updatedBy: userId,
      },
      { new: true, lean: true }
    );

    logShared({
      userId: ownerUserId,
      projectId: authData.projectId,
      log: `Auth API '${authData.name}' deleted`,
      type: "auth",
      authId: authData._id,
      createdBy: userId,
      link: `/projects/${authData.projectId}/authapi`,
      linkShared: `/projects/shared/${authData.projectId}/authapi`,
    });

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
