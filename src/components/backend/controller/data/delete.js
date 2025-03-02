import UsersModel from "@/components/backend/api/users/model";
import { connectToDatabase } from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import { isValidJson } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb"; // Import ObjectId to handle MongoDB IDs

export async function deleteDataHandler({
  req,
  username,
  projectname,
  apiname,
}) {
  // Extract query params
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids"); // Get `ids` parameter directly without defaulting

  let query = {}; // Default: delete all documents

  if (idsParam) {
    // Parse JSON safely
    const parsedIds = isValidJson(idsParam);
    if (!parsedIds.valid) {
      return NextResponse.json(
        { message: "Invalid IDs format" },
        { status: 400 }
      );
    }

    if (parsedIds.content.length > 0) {
      // Convert string IDs to ObjectId
      const objectIds = parsedIds.content.map((id) => new ObjectId(id));
      query = { _id: { $in: objectIds } };
    }
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

  // Delete documents (all or specific)
  const result = await collection.deleteMany(query);

  await connection.close();

  return NextResponse.json({
    message:
      result.deletedCount > 0
        ? "Documents deleted successfully"
        : "No documents found",
    deletedCount: result.deletedCount,
  });
}

export async function deleteDataDynamicHandler({
  req,
  username,
  projectname,
  apiname,
  id,
}) {
  const connection = await connectToDatabase(
    process.env.MONGODB_KEY_MAIN,
    projectname
  );
  const collection = connection.db.collection(apiname);

  await collection.deleteOne({ _id: new ObjectId(id) });
  await connection.close();

  return NextResponse.json({ message: "Document deleted successfully" });
}
