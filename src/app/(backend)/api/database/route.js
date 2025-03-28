import LoggersModel from "@/components/backend/api/logger";
import ProjectsModel from "@/components/backend/api/project/model";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { connectToDatabase } from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import { convertToIST } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = await verifyToken(request);

    const user = await UsersModel.findOne(
      { _id: userId },
      { mongoDbKey: 1, fetchData: 1 }
    );

    return NextResponse.json(user);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error in getProjectOwner" });
  }
}

export async function POST(request) {
  try {
    const { userId, body } = await verifyToken(request);

    const { dbString, fetchData } = body;

    const user = await UsersModel.findOne({ _id: userId }).lean();

    if (!user) {
      return NextResponse.json({
        message: "User not found",
      });
    }

    if (dbString) {
      try {
        const decryptedDbString = decrypt(dbString);
        await connectToDatabase(decryptedDbString);
      } catch (error) {
        console.log(error);
        return NextResponse.json(
          {
            message: error.message || "Error in connect to database",
          },
          { status: 400 }
        );
      }
    }

    const updatedData = await UsersModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        mongoDbKey: dbString || user.mongoDbKey || null,
        fetchData: fetchData || user.fetchData || "self",
        updatedAt: convertToIST(new Date()),
        updatedBy: userId,
      },
      { new: true, lean: true }
    );

    if (dbString) {
      await LoggersModel.create({
        userId: userId,
        type: "user",
        createdBy: userId,
        log: `Database connection string added`,
      });
    }

    if (fetchData) {
      await LoggersModel.create({
        userId: userId,
        type: "user",
        createdBy: userId,
        log: `Data will be fetch and saved to ${updatedData.fetchData === "self" ? "our database" : "master database"}`,
      });
    }

    return NextResponse.json({ message: "Database updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error in getProjectOwner" });
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await verifyToken(request);

    const user = await UsersModel.findOne({ _id: userId }).lean();

    if (!user) {
      return NextResponse.json({
        message: "User not found",
      });
    }

    if (user.mongoDbKey) {
      await LoggersModel.create({
        userId: userId,
        type: "user",
        createdBy: userId,
        log: `Database connection string removed`,
      });

      await LoggersModel.create({
        userId: userId,
        type: "user",
        createdBy: userId,
        log: `Data will be fetch and saved to our database`,
      });
    }

    await UsersModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        mongoDbKey: null,
        fetchData: "self",
        updatedAt: convertToIST(new Date()),
        updatedBy: userId,
      },
      { new: true, lean: true }
    );

    await ProjectsModel.updateMany(
      { userId, fetchData: "master" },
      {
        $set: {
          fetchData: "self",
        },
        updatedAt: convertToIST(new Date()),
        updatedBy: userId,
      },
      { new: true, lean: true }
    );

    return NextResponse.json({ message: "Database updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error in getProjectOwner" });
  }
}
