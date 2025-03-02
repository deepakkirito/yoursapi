import UsersModel from "@/components/backend/api/users/model";
import { connectToDatabase } from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import { isValidJson } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb"; // Import ObjectId to handle MongoDB IDs
import crypto from "crypto";

export async function headDataHandler({ req, username, projectname, apiname }) {
  // Extract query params
  const { searchParams } = new URL(req.url);
  const searchParam = searchParams.get("search") || "{}";

  // Parse search query safely
  const parsedSearch = isValidJson(searchParam);
  let query = {};

  if (parsedSearch.valid && Object.keys(parsedSearch.content).length) {
    query = Object.entries(parsedSearch.content).reduce((acc, [key, value]) => {
      acc[key] = isNaN(value)
        ? { $regex: value, $options: "i" }
        : parseFloat(value);
      return acc;
    }, {});
  }

  // Fetch user details
  const user = await UsersModel.findOne({ username }).lean();
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Determine database connection
  const dbString =
    user.fetchData === "self"
      ? process.env.MONGODB_KEY_MAIN
      : decrypt(user.mongoDbKey);
  const dbName =
    user.fetchData === "self" ? `${username}_${projectname}` : projectname;

  const connection = await connectToDatabase(dbString, dbName);
  const collection = connection.db.collection(apiname);

  // Run queries in parallel
  const [
    exists,
    totalDocuments,
    lastModified,
    collectionStats,
    indexes,
    sampleDocs,
  ] = await Promise.all([
    collection.countDocuments(query), // Count matching documents
    collection.estimatedDocumentCount(), // Get total document count
    collection.find().sort({ _id: -1 }).limit(1).toArray(), // Find last modified document
    collection.stats(), // Get collection storage size
    collection.indexes(), // Get index information
    collection.find().limit(5).toArray(), // Sample documents for schema detection
  ]);

  await connection.close();

  // Extract last modified timestamp
  const lastModifiedDate =
    lastModified.length > 0
      ? new Date(lastModified[0]._id.getTimestamp()).toUTCString()
      : "Unknown";

  // Compute an E-Tag for caching
  const hash = crypto
    .createHash("md5")
    .update(JSON.stringify({ totalDocuments, exists, lastModifiedDate }))
    .digest("hex");

  // Infer a simple schema from sample documents
  const inferredSchema = sampleDocs.reduce((schema, doc) => {
    Object.keys(doc).forEach((key) => {
      schema[key] = typeof doc[key];
    });
    return schema;
  }, {});

  // Prepare response headers
  const headers = new Headers();
  headers.set("X-Total-Documents", totalDocuments.toString());
  headers.set("X-Matching-Documents", exists.toString());
  headers.set("X-Data-Exists", exists > 0 ? "true" : "false");
  headers.set("X-Last-Modified", lastModifiedDate);
  headers.set("X-Collection-Size", collectionStats.size.toString());
  headers.set("X-Index-Count", indexes.length.toString());
  headers.set("E-Tag", hash);

  return new Response(null, { status: 200, headers });
}

export async function headDataDynamicHandler({
  req,
  username,
  projectname,
  apiname,
  id,
}) {
  // Validate ID format
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
  }

  // Fetch user details
  const user = await UsersModel.findOne({ username }).lean();
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Determine database connection
  const dbString =
    user.fetchData === "self"
      ? process.env.MONGODB_KEY_MAIN
      : decrypt(user.mongoDbKey);
  const dbName =
    user.fetchData === "self" ? `${username}_${projectname}` : projectname;

  const connection = await connectToDatabase(dbString, dbName);
  const collection = connection.db.collection(apiname);

  // Fetch the document
  const document = await collection.findOne({ _id: new ObjectId(id) });

  await connection.close();

  // If no document found
  if (!document) {
    return new Response(null, {
      status: 404,
      headers: new Headers({ "X-Data-Exists": "false" }),
    });
  }

  // Compute document metadata
  const documentSize = Buffer.byteLength(JSON.stringify(document), "utf8");
  const fieldCount = Object.keys(document).length;
  const lastModifiedDate = new Date(document._id.getTimestamp()).toUTCString();
  const hash = crypto
    .createHash("md5")
    .update(JSON.stringify(document))
    .digest("hex");

  // Prepare response headers
  const headers = new Headers();
  headers.set("X-Data-Exists", "true");
  headers.set("X-Last-Modified", lastModifiedDate);
  headers.set("X-Document-Size", documentSize.toString());
  headers.set("X-Field-Count", fieldCount.toString());
  headers.set("E-Tag", hash);

  return new Response(null, { status: 200, headers });
}
