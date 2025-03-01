import UsersModel from "@/components/backend/api/users/model";
import { checkRequest } from "@/components/backend/utilities/middlewares/checkRequest";
import { connectToDatabase } from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import { isValidJson } from "@/utilities/helpers/functions";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";

export async function GET(req, { params }) {
  try {
    const { username, projectname, apiname } = await params;

    // Check if the request is valid
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "getRequest",
    });

    if (check) {
      return check;
    }

    // Extract query params
    const { searchParams } = new URL(req.url);
    const page = Math.max(0, parseInt(searchParams.get("page") || "0"));
    const rows = Math.max(0, parseInt(searchParams.get("rows") || "0"));

    // Parse JSON parameters safely
    const parsedSearch = isValidJson(searchParams.get("search") || "{}");
    const parsedSort = isValidJson(searchParams.get("sort") || "{}");
    const parsedProject = isValidJson(searchParams.get("project") || "{}");

    // Validate search query
    if (!parsedSearch.valid) {
      return NextResponse.json(
        { message: "Invalid search query format" },
        { status: 400 }
      );
    }

    // Validate sort query
    if (!parsedSort.valid) {
      return NextResponse.json(
        { message: "Invalid sort query format" },
        { status: 400 }
      );
    }

    // Validate project (field selection) query
    if (!parsedProject.valid) {
      return NextResponse.json(
        { message: "Invalid project query format" },
        { status: 400 }
      );
    }

    // Construct search query dynamically
    let query = {};
    if (Object.keys(parsedSearch.content)?.length) {
      query = Object.entries(parsedSearch.content).reduce(
        (acc, [key, value]) => {
          acc[key] = { $regex: value, $options: "i" }; // Case-insensitive regex search
          return acc;
        },
        {}
      );
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
    const collection = connection.db.collection(apiname);

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

    await connection.close();

    return NextResponse.json({ data, filteredCount, totalCount });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const { username, projectname, apiname } = params;

    // Validate request
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "postRequest",
    });
    if (check) return check;

    const contentType = req.headers.get("content-type") || "";

    let data = [];

    // Handle JSON requests (single or multiple document inserts)
    if (contentType.includes("application/json")) {
      const body = await req.json();

      // Ensure data is either an object (single doc) or an array (multiple docs)
      if (!body || (Array.isArray(body) && body.length === 0)) {
        return NextResponse.json(
          { message: "Request body cannot be empty" },
          { status: 400 }
        );
      }

      data = Array.isArray(body) ? body : [body]; // Normalize to an array
    }
    // Handle FormData (multipart/form-data) for files & fields
    else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      let fileData = [];

      for (const entry of formData.entries()) {
        const [key, value] = entry;

        if (value instanceof Blob) {
          // Handle file upload
          const buffer = Buffer.from(await value.arrayBuffer());
          const tempDir = path.join(os.tmpdir(), "uploads");
          await writeFile(path.join(tempDir, value.name), buffer);
          fileData.push({
            filename: value.name,
            size: value.size,
            mimetype: value.type,
            path: path.join(tempDir, value.name),
          });
        } else {
          // Handle form fields
          data.push({ [key]: value });
        }
      }

      // Merge file data with form data
      if (fileData.length > 0) {
        data.push({ files: fileData });
      }
    } else {
      return NextResponse.json(
        { message: "Unsupported content type" },
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

    // Insert data into MongoDB
    const result = await collection.insertMany(data);
    await connection.close();

    return NextResponse.json({
      message: "Documents inserted successfully",
      insertedCount: result.insertedCount,
      insertedIds: Object.values(result.insertedIds),
    });
  } catch (error) {
    console.error("Insert Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { username, projectname, apiname } = params;

    // Validate request
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "putRequest",
    });
    if (check) return check;

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
          message:
            "Invalid request. Provide 'all=true' or a valid 'ids' array.",
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
  } catch (error) {
    console.error("Replace Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { username, projectname, apiname } = params;

    // Validate request
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "patchRequest",
    });
    if (check) return check;

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

    // If "all=true" update all documents
    if (all) {
      query = {}; // No filter, update all
    }
    // If an array of IDs is provided, update specific documents
    else if (parsedIds.valid && parsedIds.content.length > 0) {
      const objectIds = parsedIds.content.map((id) => new ObjectId(id));
      query = { _id: { $in: objectIds } };
    }
    // If neither "all" nor valid "ids", return an error
    else {
      await connection.close();
      return NextResponse.json(
        {
          message:
            "Invalid request. Provide 'all=true' or a valid 'ids' array.",
        },
        { status: 400 }
      );
    }

    // Perform update
    const result = await collection.updateMany(query, { $set: body });
    await connection.close();

    return NextResponse.json({
      message:
        result.modifiedCount > 0
          ? "Documents updated successfully"
          : "No documents found to update",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { username, projectname, apiname } = params;

    // Validate request
    const check = await checkRequest({
      username,
      projectname,
      apiname,
      reqType: "deleteRequest",
    });
    if (check?.status !== 200) return check;

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
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
