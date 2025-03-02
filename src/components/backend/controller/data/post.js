import UsersModel from "@/components/backend/api/users/model";
import { connectToDatabase } from "@/components/backend/utilities/middlewares/mongoose";
import { decrypt } from "@/utilities/helpers/encryption";
import { NextResponse } from "next/server";

export async function postDataHandler({ req, username, projectname, apiname }) {
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
}

export async function postDataDynamicHandler({
  req,
  username,
  projectname,
  apiname,
  id,
}) {}
