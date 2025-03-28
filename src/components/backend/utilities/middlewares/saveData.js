const { NextResponse } = require("next/server");
const { connectToDatabase, updateModel } = require("./mongoose");

export const saveData = async ({
  data,
  mongoDbKey,
  apiName,
  schema,
  dbName,
}) => {
  // Save data to external database
  if (mongoDbKey) {
    // Construct the database name dynamically
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
