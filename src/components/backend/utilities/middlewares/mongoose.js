const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_KEY_MAIN;

// const globalConnections = {}; // Cache connections per database

// Helper function to safely close the database connection
export const safelyCloseConnection = async (connection, dbName) => {
  try {
    await connection.close();
    console.log(`Database connection closed: ${dbName}`);
  } catch (err) {
    console.error(`Failed to close database connection: ${err.message}`);
    throw new Error("Failed to close database connection");
  }
};

export const dropDb = async ({
  uri = MONGO_URI,
  projectName,
  userName,
  saveInternal,
  saveExternal,
}) => {
  try {
    if (saveInternal) {
      const dbName = `${userName}_${projectName}`;
      const connection = await connectToDatabase(MONGO_URI, dbName);
      await connection.db.dropDatabase();
      await connection.close();
      console.log(`Dropped internal database: ${dbName}`);
    }

    if (saveExternal && uri) {
      const dbName = projectName;
      const connection = await connectToDatabase(uri, dbName);
      await connection.db.dropDatabase();
      await connection.close();
      console.log(`Dropped external database: ${dbName}`);
    }
  } catch (error) {
    console.error("Error dropping database:", error);
  }
};

export const migrateProjects = async ({
  dbString,
  dbStringOther,
  options,
  userName,
  projects,
  apis,
  migrate,
  schema = {},
  strict = false,
}) => {
  try {
    // Iterate through each project
    for (const project of projects) {
      const sourceDbName = `${dbString}${
        options === "external" ? userName + "_" : ""
      }${project.toLowerCase()}`;
      const targetDbName = `${dbStringOther}${
        options === "external" ? "" : userName + "_"
      }${project.toLowerCase()}`;

      console.log(`Migrating project: ${project}`);
      console.log(`Source DB: ${sourceDbName}, Target DB: ${targetDbName}`);

      // Create connections for source and target databases
      const sourceDbConnection = mongoose.createConnection(sourceDbName);
      const targetDbConnection = mongoose.createConnection(targetDbName);

      // Drop the target database if `migrate` is set to "replace"
      if (migrate === "replace") {
        await new Promise((resolve, reject) => {
          targetDbConnection.on("connected", async () => {
            try {
              await targetDbConnection.db.dropDatabase();
              console.log(`Dropped target database: ${targetDbName}`);
              resolve();
            } catch (err) {
              console.error(
                `Failed to drop target database "${targetDbName}":`,
                err
              );
              reject(err);
            }
          });
        });
      }

      // Migrate all models in the API
      for (const apiModel of apis[project]) {
        const modelName = apiModel.toLowerCase();
        const sampleSchema = new mongoose.Schema(schema, {
          strict: strict,
          collection: modelName,
        });

        try {
          // Define source and target models
          const sourceModel = sourceDbConnection.model(modelName, sampleSchema);
          const targetModel = targetDbConnection.model(modelName, sampleSchema);

          // Fetch data from the source and insert into the target
          const documents = await sourceModel.find(
            {},
            { __v: 0, _id: migrate === "replace" ? 1 : 0 }
          );

          if (documents.length > 0) {
            await targetModel.insertMany(documents);
            console.log(
              `Migrated ${documents.length} documents for model: ${apiModel}`
            );
          } else {
            console.log(`No documents found for model: ${apiModel}`);
          }
        } catch (err) {
          console.error(`Error migrating model "${apiModel}":`, err);
        }
      }

      // Close database connections
      try {
        await sourceDbConnection.close();
        console.log(`Closed source DB connection: ${sourceDbName}`);
      } catch (err) {
        console.error(`Failed to close source DB connection:`, err);
      }

      try {
        await targetDbConnection.close();
        console.log(`Closed target DB connection: ${targetDbName}`);
      } catch (err) {
        console.error(`Failed to close target DB connection:`, err);
      }

      console.log(`Migration completed for project: ${project}`);
    }

    console.log("All projects migrated successfully!");
  } catch (err) {
    console.error("Error during project migration:", err);
  }
};

const globalConnections = global.globalConnections || {};

export async function connectToDatabase(uri, dbName) {
  if (!uri || !dbName) throw new Error("Database URI and name are required");

  const cacheKey = `${uri}_${dbName}`;

  if (globalConnections[cacheKey]) {
    return globalConnections[cacheKey]; // ✅ Return cached connection
  }

  console.log(`🔌 Connecting to MongoDB: ${dbName}`);

  const connection = mongoose.createConnection(uri, {
    dbName, // ✅ Correct way to set database (avoid appending manually)
    maxPoolSize: 50, // 🔹 Keeps up to 50 connections open
    minPoolSize: 5, // 🔹 Maintains at least 5 open connections
    socketTimeoutMS: 0, // 🔹 Never close idle sockets
    serverSelectionTimeoutMS: 5000, // 🔹 Fail fast if MongoDB is unreachable
    heartbeatFrequencyMS: 10000, // 🔹 Keep connection active
  });

  connection.on("error", (err) => {
    console.error(`❌ Error connecting to database "${dbName}":`, err.message);
  });

  try {
    await connection.asPromise(); // ✅ Ensures the connection is established before returning
    console.log(`✅ Connected to database: ${dbName}`);
  } catch (error) {
    console.error(`❌ Connection failed for "${dbName}":`, error.message);
    throw error;
  }

  globalConnections[cacheKey] = connection;
  global.globalConnections = globalConnections; // ✅ Store in global scope for reuse

  return connection;
}

export const copyDatabase = async ({
  oldDbName,
  newDbName,
  uri = MONGO_URI,
  dropOldDb = true,
}) => {
  let oldDbConnection, newDbConnection;

  try {
    // Connect to old and new databases
    oldDbConnection = await connectToDatabase(uri, oldDbName);
    newDbConnection = await connectToDatabase(uri, newDbName);

    console.log(
      `Connected to databases: Old - ${oldDbName}, New - ${newDbName}`
    );

    // Get collections from the old database
    const collections = await oldDbConnection.db.listCollections().toArray();

    if (collections.length === 0) {
      console.warn(`No collections found in the old database: ${oldDbName}`);
      return;
    }

    for (const { name: collectionName } of collections) {
      try {
        console.log(`Processing collection: ${collectionName}`);

        // Fetch all documents from the old collection
        const data = await oldDbConnection.db
          .collection(collectionName)
          .find()
          .toArray();

        if (data.length > 0) {
          // Insert documents into the corresponding collection in the new database
          await newDbConnection.db.collection(collectionName).insertMany(data);
          console.log(`Copied collection: ${collectionName}`);
        } else {
          console.log(`Collection "${collectionName}" is empty, skipping.`);
        }
      } catch (collectionError) {
        console.error(
          `Error copying collection "${collectionName}": ${collectionError.message}`
        );
      }
    }

    // Optionally drop the old database after copying
    if (dropOldDb) {
      await oldDbConnection.db.dropDatabase();
      console.log(`Dropped old database: ${oldDbName}`);
    }

    console.log(
      `Database successfully copied from "${oldDbName}" to "${newDbName}".`
    );
  } catch (error) {
    console.error(`Error during database copy: ${error.message}`);
  } finally {
    // Ensure connections are closed
    try {
      if (oldDbConnection) {
        await oldDbConnection.close();
        console.log(`Closed connection to old database: ${oldDbName}`);
      }
      if (newDbConnection) {
        await newDbConnection.close();
        console.log(`Closed connection to new database: ${newDbName}`);
      }
    } catch (closeError) {
      console.error(
        `Error closing database connections: ${closeError.message}`
      );
    }
  }
};

export const renameCollection = async ({
  dbName,
  oldCollectionName,
  newCollectionName,
  uri,
  dropOldCollection = true,
}) => {
  let dbConnection;

  try {
    // Connect to the database
    dbConnection = await connectToDatabase(uri, dbName);

    // Check if the old collection exists
    const oldCollection = await dbConnection.db
      .listCollections({ name: oldCollectionName })
      .toArray();

    if (oldCollection.length === 0) {
      console.warn(
        `Collection "${oldCollectionName}" does not exist in database "${dbName}".`
      );
      return;
    }

    // Check if the new collection already exists
    const newCollection = await dbConnection.db
      .listCollections({ name: newCollectionName })
      .toArray();

    if (newCollection.length > 0) {
      console.warn(
        `Collection "${newCollectionName}" already exists in database "${dbName}".`
      );
      return;
    }

    // Fetch all data from the old collection
    const data = await dbConnection.db
      .collection(oldCollectionName)
      .find()
      .toArray();

    if (data.length > 0) {
      // Insert data into the new collection
      await dbConnection.db.collection(newCollectionName).insertMany(data);
      console.log(`Copied data to new collection: "${newCollectionName}".`);
    } else {
      console.log(
        `Old collection "${oldCollectionName}" is empty. No data copied.`
      );
    }

    // Optionally drop the old collection
    if (dropOldCollection) {
      await dbConnection.db.collection(oldCollectionName).drop();
      console.log(`Dropped old collection: "${oldCollectionName}".`);
    }

    console.log(
      `Collection renamed successfully from "${oldCollectionName}" to "${newCollectionName}".`
    );
  } catch (error) {
    console.error(`Error during collection rename: ${error.message}`);
  } finally {
    // Ensure the database connection is closed
    if (dbConnection) {
      await dbConnection.close();
      console.log(`Closed connection to database: "${dbName}".`);
    }
  }
};

export const updateModel = async ({
  dbConnection,
  collectionName,
  option = "replace",
  schema = {},
  data,
}) => {
  const strict = Object.keys(schema)?.length > 0;

  try {
    // Define the schema with optional strict mode
    const sampleSchema = new mongoose.Schema(schema, {
      strict,
      collection: collectionName,
    });

    // Create or retrieve the model
    const model = dbConnection.model(collectionName, sampleSchema);

    // First, delete all existing data in the collection
    if (option === "replace") {
      await model.deleteMany({});
    }

    // Insert new data into the collection if provided
    if (data && Array.isArray(data) && data.length > 0) {
      await model.insertMany(data);
    }

    // Close the database connection and send a success response
    dbConnection.close();
    return true;
  } catch (err) {
    console.error("Error updating collection:", err.message);

    // Close the database connection in case of an error
    if (dbConnection.readyState === 1) {
      dbConnection.close();
    }

    // Send an error response
    return err.message;
  }
};

export const getModelData = async ({
  dbConnection,
  collectionName,
  findOptionOne = {},
  findOptionTwo = { _id: 0, __v: 0 },
}) => {
  try {
    // Ensure the connection is established
    if (!dbConnection || !dbConnection.db) {
      res.status(500).send({ message: "Database connection error" });
    }

    // Fetch data directly from the collection
    const data = await dbConnection.db
      .collection(collectionName)
      .find(findOptionOne)
      .project(findOptionTwo)
      .toArray();

    return data;
  } catch (err) {
    console.error(
      `Error fetching data from collection "${collectionName}":`,
      err
    );
    throw err;
  }
};
