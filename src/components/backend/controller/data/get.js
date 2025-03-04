import UsersModel from "@/components/backend/api/users/model";
import { connectToDatabase } from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import { isValidJson } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb"; // Import ObjectId to handle MongoDB IDs
import { dbConnect } from "../../utilities/dbConnect";

export async function getDataHandler({ req, username, projectname, apiname }) {
  // Extract query params
  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") || "0"));
  const rows = Math.max(0, parseInt(searchParams.get("rows") || "0"));

  // Extract search and logical operator
  const searchParam = searchParams.get("search") || "{}";
  const searchMode =
    searchParams.get("searchMode")?.toUpperCase() === "OR" ? "$or" : "$and"; // Default is AND

  // Parse JSON parameters safely
  const parsedSearch = isValidJson(searchParam);
  const parsedSort = isValidJson(searchParams.get("sort") || "{}");
  const parsedProject = isValidJson(searchParams.get("project") || "{}");

  // Validate project (field selection) query
  if (!parsedProject.valid) {
    return NextResponse.json(
      { message: "Invalid project query format" },
      { status: 400 }
    );
  }

  // Fetch user data
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
  const collection = connection.collection(apiname);

  // Construct search query
  let query = {};

  if (parsedSearch.valid && Object.keys(parsedSearch.content).length) {
    // Structured field-based search (AND/OR)
    const conditions = Object.entries(parsedSearch.content).map(
      ([key, value]) => ({
        [key]: { $regex: value, $options: "i" }, // Case-insensitive regex search
      })
    );

    query = { [searchMode]: conditions };
  } else {
    // Global search across all fields
    const globalSearchText = searchParams.get("search")?.trim();

    if (globalSearchText) {
      const isNumber = !isNaN(globalSearchText); // Check if input is a number
      const schemaFields = await collection.findOne(); // Get one document to infer field names

      if (schemaFields) {
        const textSearchQuery = {
          $or: Object.keys(schemaFields)
            .map((key) => {
              const fieldValue = schemaFields[key];
              if (typeof fieldValue === "string") {
                return { [key]: { $regex: globalSearchText, $options: "i" } }; // String search
              } else if (typeof fieldValue === "number" && isNumber) {
                return { [key]: parseFloat(globalSearchText) }; // Exact number search
              }
              return null;
            })
            .filter(Boolean), // Remove null values
        };
        query = textSearchQuery;
      }
    }
  }

  // Construct sorting object
  const sortOptions =
    Object.keys(parsedSort.content)?.length > 0
      ? {
          [parsedSort.content.key]:
            parsedSort.content.value === "desc" ? -1 : 1,
        }
      : {};

  // Construct projection object
  const projectionFields = Object.keys(parsedProject.content)?.length
    ? parsedProject.content
    : {};

  // Run queries in parallel for better performance
  const [data, filteredCount, totalCount] = await Promise.all([
    collection
      .find(query)
      .project(projectionFields)
      .sort(sortOptions)
      .skip(rows > 0 ? page * rows : 0)
      .limit(rows > 0 ? rows : 0) // If rows = 0, return all matching documents
      .toArray(),
    collection.countDocuments(query),
    collection.estimatedDocumentCount(),
  ]);

  // await connection.close();

  return NextResponse.json({ data, filteredCount, totalCount });
}

export async function getDataDynamicHandler({
  req,
  username,
  projectname,
  apiname,
  id,
}) {
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
}
