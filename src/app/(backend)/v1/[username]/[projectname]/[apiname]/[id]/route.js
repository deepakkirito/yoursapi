import UsersModel from "@/components/backend/api/users/model";
import { checkRequest } from "@/components/backend/utilities/middlewares/checkRequest";
import { connectToDatabase } from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import { isValidJson } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb"; // Import ObjectId to handle MongoDB IDs

export async function GET(req, { params }) {
  try {
    const { username, projectname, apiname, id } = params;

    // ✅ Check request validity
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "getRequest",
    });

    if (check) {
      return check; // Return error if checkRequest fails
    }

    // ✅ Extract query params
    const { searchParams } = new URL(req.url);
    const parsedProject = isValidJson(searchParams.get("project") || "{}");

    // ✅ Validate project (field selection) query
    if (!parsedProject.valid) {
      return NextResponse.json(
        { message: "Invalid project query format" },
        { status: 400 }
      );
    }

    // ✅ Validate MongoDB ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid document ID" },
        { status: 400 }
      );
    }

    // ✅ Construct projection object
    const projectionFields = Object.keys(parsedProject.content)?.length
      ? parsedProject.content
      : {};

    // ✅ Fetch user data
    const user = await UsersModel.findOne({ username }).lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Determine database connection
    const dbString =
      user.fetchData === "self"
        ? process.env.MONGODB_KEY_MAIN
        : decrypt(user.mongoDbKey);

    const dbName =
      user.fetchData === "self" ? `${username}_${projectname}` : projectname;

    const connection = await connectToDatabase(dbString, dbName);
    const collection = connection.db.collection(apiname);

    // ✅ Fetch the document
    const document = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: projectionFields }
    );

    await connection.close();

    // ✅ Check if document exists
    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { username, projectname, apiname, id } = params;
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "putRequest",
    });
    if (check) return check;

    const body = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { message: "Request body cannot be empty" },
        { status: 400 }
      );
    }

    const user = await UsersModel.findOne({ username }).lean();
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const dbString =
      user.fetchData === "self"
        ? process.env.MONGODB_KEY_MAIN
        : decrypt(user.mongoDbKey);
    const dbName =
      user.fetchData === "self" ? `${username}_${projectname}` : projectname;
    const connection = await connectToDatabase(dbString, dbName);
    const collection = connection.db.collection(apiname);

    const result = await collection.replaceOne({ _id: new ObjectId(id) }, body);
    await connection.close();

    return NextResponse.json({
      message: "Document updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { username, projectname, apiname, id } = params;
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "patchRequest",
    });
    if (check) return check;

    const body = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { message: "Request body cannot be empty" },
        { status: 400 }
      );
    }

    const user = await UsersModel.findOne({ username }).lean();
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const dbString =
      user.fetchData === "self"
        ? process.env.MONGODB_KEY_MAIN
        : decrypt(user.mongoDbKey);
    const dbName =
      user.fetchData === "self" ? `${username}_${projectname}` : projectname;
    const connection = await connectToDatabase(dbString, dbName);
    const collection = connection.db.collection(apiname);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );
    await connection.close();

    return NextResponse.json({
      message: "Document patched successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { username, projectname, apiname, id } = params;
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "deleteRequest",
    });
    if (check) return check;

    const connection = await connectToDatabase(
      process.env.MONGODB_KEY_MAIN,
      projectname
    );
    const collection = connection.db.collection(apiname);

    await collection.deleteOne({ _id: new ObjectId(id) });
    await connection.close();

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
