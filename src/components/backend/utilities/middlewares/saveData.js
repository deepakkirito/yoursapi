const { NextResponse } = require("next/server");
const { connectToDatabase, updateModel } = require("./mongoose");

export const saveData = async ({
  data,
  saveInternal,
  saveExternal,
  mongoDbKey,
  projectName,
  apiName,
  schema,
  username,
}) => {

  // Save data to internal database
  if (saveInternal) {
    // Construct the database name dynamically
    const dbName = `${username}_${projectName}`;
    const dbUri = process.env.MONGODB_KEY_MAIN;

    const newDbConnection = await connectToDatabase(dbUri, dbName);

    const saveData = await updateModel({
      dbConnection: newDbConnection,
      collectionName: apiName,
      schema,
      data,
    });

    if (typeof saveData === "string") {
      return NextResponse.json(
        { message: saveData },
        { status: 400, statusText: "Bad Request" }
      );
    }
  }

  // Save data to external database
  if (saveExternal) {
    // Construct the database name dynamically
    const dbName = projectName;
    const dbUri = mongoDbKey;

    const newDbConnection = await connectToDatabase(dbUri, dbName);

    const saveData = await updateModel({
      dbConnection: newDbConnection,
      collectionName: apiName,
      schema,
      data,
    });

    if (typeof saveData === "string") {
      return NextResponse.json(
        { message: saveData },
        { status: 400, statusText: "Bad Request" }
      );
    }
  }
};
