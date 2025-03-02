import ApisModel from "@/components/backend/api/api/model";
import AuthsModel from "@/components/backend/api/authApi/model";
import LoggersModel from "@/components/backend/api/logger";
import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import {
  connectToDatabase,
  migrateProjects,
} from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { option } = await params;

    const { userId, username } = await verifyToken(request);

    const user = await UsersModel.findOne({
      _id: userId,
    });

    if (!user) {
      return NextResponse.json({
        message: "User not found",
      });
    }

    let dbString = "";

    if (option === "external") {
      dbString = process.env.MONGODB_KEY_MAIN;
    } else if (option === "internal") {
      dbString = decrypt(user.mongoDbKey);
      if (!dbString) {
        return NextResponse.json({
          message: "Invalid database key",
        });
      }
    } else {
      return NextResponse.json({
        message: "Invalid option",
      });
    }

    const connection = await connectToDatabase(dbString);

    const { databases } = await connection.db.admin().listDatabases();

    const dbPromises = databases.map(async (db) => {
      try {
        const dbConnection = await connectToDatabase(dbString, db.name);
        const collections = await dbConnection.db.listCollections().toArray();
        await dbConnection.close();
        return {
          name: db.name,
          sizeOnDisk: db.sizeOnDisk,
          empty: db.empty,
          collections: collections.map((collection) => collection.name),
        };
      } catch (error) {
        return null;
      }
    });

    const databasesInfo = (await Promise.all(dbPromises)).filter(
      (db) => db !== null
    );

    connection.close();

    if (!databasesInfo || databasesInfo.length === 0) {
      return NextResponse.json([]);
    }

    const updatedDatabase =
      option === "external"
        ? databasesInfo
            .filter((db) => db.name.includes(username))
            .map((db) => ({
              name: db.name.split("_")[1],
              sizeOnDisk: db.sizeOnDisk,
              empty: db.empty,
              collections: db.collections,
            }))
        : databasesInfo;

    return NextResponse.json(updatedDatabase || []);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error retrieving data" });
  }
}

export async function POST(request, { params }) {
  const { userId, username, body } = await verifyToken(request);

  try {
    const { option } = await params;

    const { project, api, migrate } = body;

    const user = await UsersModel.findOne({
      _id: userId,
    });

    if (!user) {
      return NextResponse.json({
        message: "User not found",
      });
    }

    let dbString = "",
      dbStringOther = "";

    if (option === "external") {
      dbString = process.env.MONGODB_KEY_MAIN;
      dbStringOther = decrypt(user.mongoDbKey);
    } else if (option === "internal") {
      dbString = decrypt(user.mongoDbKey);
      dbStringOther = process.env.MONGODB_KEY_MAIN;
    } else {
      return NextResponse.json({
        message: "Invalid option",
      });
    }

    if (!dbString || !dbStringOther) {
      return NextResponse.json({
        message: "Invalid database key",
      });
    }

    await migrateProjects({
      dbString,
      dbStringOther,
      options: option,
      projects: project,
      apis: api,
      migrate,
      userName: username,
    });

    if (option === "internal") {
      for (const projectName of project) {
        let projectDoc = await ProjectsModel.findOne({
          userId,
          name: projectName,
        });

        if (!projectDoc) {
          projectDoc = await ProjectsModel.create({
            name: projectName.toLowerCase(),
            userId,
            updatedBy: userId,
            createdBy: userId,
          });

          await UsersModel.findOneAndUpdate(
            { _id: userId },
            { $push: { project: projectDoc._id } },
            { returnNewDocument: true }
          );
        }

        if (api[projectName]) {
          for (const apiName of api[projectName]) {
            const checkAuthApi = await AuthsModel.findOne({
              userId,
              name: apiName.toLowerCase(),
              projectId: projectDoc._id,
            });
            const checkApi = await ApisModel.findOne({
              userId,
              name: apiName.toLowerCase(),
              projectId: projectDoc._id,
            });
            if (!checkAuthApi && !checkApi) {
              const newApi = await ApisModel.create({
                name: apiName.toLowerCase(),
                userId,
                projectId: projectDoc._id,
                createdBy: userId,
                updatedBy: userId,
              });

              await ProjectsModel.findByIdAndUpdate(
                projectDoc._id,
                { $push: { apiIds: newApi._id } },
                { returnNewDocument: true }
              );
            }
          }
        }
      }
    }

    const getMessage = () => {
      if (option === "internal") {
        return `Data migrated from your database to our database ~${String(apiIds)}~`;
      } else if (option === "external") {
        return "Data migrated from our database to your database";
      } else {
        return "Invalid option triggered";
      }
    };

    await LoggersModel.create({
      userId: user._id,
      type: "user",
      createdBy: user._id,
      message: getMessage(),
    });

    return NextResponse.json({
      message: "Data migrated successfully",
    });
  } catch (error) {
    console.error(error);
    await LoggersModel.create({
      userId: userId,
      type: "user",
      createdBy: userId,
      message: "Error migrating data: " + error.message,
      status: "error",
    });
    return NextResponse.json(
      {
        message: "Error migrating data: " + error.message,
      },
      { status: 500 }
    );
  }
}
