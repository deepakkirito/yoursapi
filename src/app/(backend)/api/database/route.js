import LoggersModel from "@/components/backend/api/logger";
import UsersModel from "@/components/backend/api/users/model";
import { verifyToken } from "@/components/backend/utilities/helpers/verifyToken";
import { connectToDatabase } from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = await verifyToken(request);

    const user = await UsersModel.findOne(
      { _id: userId },
      { mongoDbKey: 1, saveExternal: 1, saveInternal: 1, fetchData: 1 }
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

    const { dbString, saveExternal, saveInternal, fetchData } = body;

    if (!saveExternal && !saveInternal) {
      return NextResponse.json({
        message: "Can not deactivate both databases",
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
        mongoDbKey: dbString ? dbString : null,
        saveExternal: Boolean(saveExternal),
        saveInternal: Boolean(saveInternal),
        fetchData:
          saveExternal && saveInternal
            ? fetchData === "user"
              ? "user"
              : "self"
            : saveExternal
              ? "user"
              : "self",
        updatedAt: new Date(),
        updatedBy: userId,
      },
      { new: true, lean: true }
    );

    const getMessage = () => {
      if (saveInternal) {
        return `Our database status updated to ${updatedData.saveInternal} from ${!updatedData.saveInternal}`;
      }

      if (saveExternal) {
        return `Your database status updated to ${updatedData.saveExternal} from ${!updatedData.saveExternal}`;
      }

      if (dbString) {
        return `Database dbString updated to ${decrypt(dbString)}`;
      }

      if (fetchData) {
        return `Database fetchData updated to ${updatedData.fetchData}`;
      }

      return "Invalid option triggered";
    };

    await LoggersModel.create({
      userId: userId,
      type: "user",
      createdBy: userId,
      message: getMessage(),
    });

    return NextResponse.json({ message: "Database updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Error in getProjectOwner" });
  }
}
