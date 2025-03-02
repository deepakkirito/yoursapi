import UsersModel from "@/components/backend/api/users/model";
import { connectToDatabase } from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import { isValidJson } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb"; // Import ObjectId to handle MongoDB IDs

export async function putDataHandler({ req, username, projectname, apiname }) {
  // Extract query params
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";
  const idsParam = searchParams.get("ids") || "[]";

  // Parse JSON safely
  const parsedIds = isValidJson(idsParam);
  const body = await req.json();

  // Validate request body
  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json(
      { message: "Request body cannot be empty" },
      { status: 400 }
    );
  }

  // Fetch user details
  const user = await UsersModel.findOne({ username }).lean();
  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  // Determine database connection
  const dbString =
    user.fetchData === "self"
      ? process.env.MONGODB_KEY_MAIN
      : decrypt(user.mongoDbKey);
  const dbName =
    user.fetchData === "self" ? `${username}_${projectname}` : projectname;
  const connection = await connectToDatabase(dbString, dbName);
  const collection = connection.db.collection(apiname);

  let query = {};

  // If "all=true" replace all documents
  if (all) {
    query = {}; // No filter, replace all
  }
  // If an array of IDs is provided, replace specific documents
  else if (parsedIds.valid && parsedIds.content.length > 0) {
    const objectIds = parsedIds.content.map((id) => new ObjectId(id));
    query = { _id: { $in: objectIds } };
  }
  // If neither "all" nor valid "ids", return an error
  else {
    await connection.close();
    return NextResponse.json(
      {
        message: "Invalid request. Provide 'all=true' or a valid 'ids' array.",
      },
      { status: 400 }
    );
  }

  // Fetch documents to be replaced
  const documentsToReplace = await collection.find(query).toArray();

  if (documentsToReplace.length === 0) {
    await connection.close();
    return NextResponse.json(
      { message: "No documents found to replace" },
      { status: 404 }
    );
  }

  // Perform replacement
  const updateOperations = documentsToReplace.map((doc) =>
    collection.replaceOne({ _id: doc._id }, body)
  );

  const results = await Promise.all(updateOperations);
  await connection.close();

  const modifiedCount = results.reduce(
    (sum, res) => sum + res.modifiedCount,
    0
  );

  return NextResponse.json({
    message:
      modifiedCount > 0
        ? "Documents replaced successfully"
        : "No documents modified",
    modifiedCount,
  });
}

export async function putDataDynamicHandler({
  req,
  username,
  projectname,
  apiname,
  id,
}) {
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
}
