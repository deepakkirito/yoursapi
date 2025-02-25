import mongoose from "mongoose";

const MONGO_STRING = process.env.MONGODB_KEY_MAIN;

if (!MONGO_STRING) {
  throw new Error("Please define the MONGODB_KEY_MAIN environment variable");
}

// Global cache to prevent multiple connections
let cached = global.mongoose || { conn: null, promise: null };

export async function connectToDatabase({ KEY = MONGO_STRING, dbName }) {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(KEY, { dbName, useNewUrlParser: true, useUnifiedTopology: true })
      .then((conn) => {
        console.log("MongoDB connected successfully");
        return conn;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function safelyCloseConnection({ conn }) {
  if (conn?.connection?.readyState === 1) {
    await conn.connection.close();
    console.log("MongoDB connection closed");
  }
}

export async function getCollection({ dbConn, collectionName }) {
  return dbConn.connection.db.collection(collectionName);
}

export async function getCollections({ dbConn }) {
  return dbConn.connection.db.listCollections().toArray();
}

export async function getCollectionNames({ dbConn }) {
  const collections = await dbConn.connection.db.listCollections().toArray();
  return collections.map((collection) => collection.name);
}

export async function getCollectionSize({ dbConn, collectionName }) {
  return dbConn.connection.db
    .collection(collectionName)
    .estimatedDocumentCount();
}

export async function getCollectionIndexes({ dbConn, collectionName }) {
  return dbConn.connection.db.collection(collectionName).indexes();
}

export async function getCollectionData({
  dbConn,
  collectionName,
  findQuery = {},
  projectQuery = { _id: 0, __v: 0 },
}) {
  return dbConn.connection.db
    .collection(collectionName)
    .find(findQuery)
    .project(projectQuery)
    .toArray();
}

export async function updateCollectionData({
  dbConn,
  collectionName,
  data,
  options = "replace",
}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error("Invalid data provided for updateCollectionData");
  }

  const collection = dbConn.connection.db.collection(collectionName);

  if (options === "replace") {
    await collection.deleteMany({});
  }

  await collection.insertMany(data);
  console.log(`Updated collection: ${collectionName}`);
  return true;
}

export async function copyDocument({
  oldDbName,
  newDbName,
  uri = MONGO_STRING,
  dropOldDb = true,
}) {
  try {
    const oldConn = await connectToDatabase({ KEY: uri, dbName: oldDbName });
    const newConn = await connectToDatabase({ KEY: uri, dbName: newDbName });

    console.log(
      `Connected to databases: Old - ${oldDbName}, New - ${newDbName}`
    );

    const collections = await oldConn.connection.db.listCollections().toArray();

    if (collections.length === 0) {
      console.log("No collections found in the old database");
      return;
    }

    for (const { name: collectionName } of collections) {
      try {
        console.log(`Copying collection: ${collectionName}`);
        const data = await oldConn.connection.db
          .collection(collectionName)
          .find({})
          .toArray();

        if (data.length > 0) {
          await newConn.connection.db
            .collection(collectionName)
            .insertMany(data);
          console.log(`Collection ${collectionName} copied successfully`);
        } else {
          console.log(`Collection ${collectionName} is empty`);
        }
      } catch (error) {
        console.error(`Error copying collection: ${collectionName}`, error);
      }
    }

    if (dropOldDb) {
      console.log("Dropping old database");
      await oldConn.connection.db.dropDatabase();
      console.log("Old database dropped successfully");
    }

    await safelyCloseConnection({ conn: oldConn });
    await safelyCloseConnection({ conn: newConn });

    console.log("Databases copied successfully");
  } catch (error) {
    console.error("Error in copyDocument:", error);
    throw error;
  }
}

export async function renameCollection({
  dbName,
  oldCollectionName,
  newCollectionName,
  uri,
  dropOldCollection = true,
}) {
  let dbConn;

  try {
    // Connect to database
    dbConn = await connectToDatabase({ KEY: uri, dbName });

    const db = dbConn.connection.db;

    // Check if the old collection exists
    const oldCollectionExists = await db
      .listCollections({ name: oldCollectionName })
      .toArray();

    if (oldCollectionExists.length === 0) {
      console.warn(`❌ Collection "${oldCollectionName}" does not exist.`);
      return false;
    }

    // Check if the new collection already exists
    const newCollectionExists = await db
      .listCollections({ name: newCollectionName })
      .toArray();

    if (newCollectionExists.length > 0) {
      console.warn(`⚠️ Collection "${newCollectionName}" already exists.`);
      return false;
    }

    // Fetch all data from the old collection
    const data = await db.collection(oldCollectionName).find().toArray();

    if (data.length > 0) {
      // Insert data into the new collection
      await db.collection(newCollectionName).insertMany(data);
      console.log(`✅ Copied data to "${newCollectionName}".`);
    } else {
      console.log(`ℹ️ Old collection "${oldCollectionName}" is empty.`);
    }

    // Drop old collection if specified
    if (dropOldCollection) {
      await db.collection(oldCollectionName).drop();
      console.log(`🗑️ Dropped old collection: "${oldCollectionName}".`);
    }

    console.log(
      `🎉 Successfully renamed collection to "${newCollectionName}".`
    );
    return true;
  } catch (error) {
    console.error(`❌ Error renaming collection:`, error);
    return false;
  } finally {
    // Ensure connection is closed
    if (dbConn) {
      await safelyCloseConnection({ conn: dbConn });
      console.log(`🔌 Closed database connection.`);
    }
  }
}

export async function migrateProjects({
  dbString,
  dbStringOther,
  options,
  userName,
  projects,
  api,
  migrate,
  schema,
  strict,
}) {
  try {
    for (const project of projects) {
      const sourceDbName = `${dbString}${
        options === "external" ? userName + "_" : ""
      }${project.toLowerCase()}`;
      const targetDbName = `${dbStringOther}${
        options === "external" ? "" : userName + "_"
      }${project.toLowerCase()}`;

      console.log(`🔄 Migrating project: ${project}`);
      console.log(`🔹 Source DB: ${sourceDbName}, Target DB: ${targetDbName}`);

      // Connect to source and target databases
      const sourceDbConn = await connectToDatabase({
        KEY: dbString,
        dbName: sourceDbName,
      });
      const targetDbConn = await connectToDatabase({
        KEY: dbStringOther,
        dbName: targetDbName,
      });

      const sourceDb = sourceDbConn.connection.db;
      const targetDb = targetDbConn.connection.db;

      // Drop target DB if `migrate` is "replace"
      if (migrate === "replace") {
        try {
          await targetDb.dropDatabase();
          console.log(`🗑 Dropped target database: ${targetDbName}`);
        } catch (err) {
          console.error(`❌ Failed to drop target DB "${targetDbName}":`, err);
        }
      }

      // Migrate all models in API
      for (const apiModel of api[project]) {
        const modelName = apiModel.toLowerCase();
        const sampleSchema = new mongoose.Schema(schema, {
          strict,
          collection: modelName,
        });

        try {
          const sourceModel = sourceDbConn.model(modelName, sampleSchema);
          const targetModel = targetDbConn.model(modelName, sampleSchema);

          const documents = await sourceModel.find(
            {},
            { __v: 0, _id: migrate === "replace" ? 1 : 0 }
          );

          if (documents.length > 0) {
            await targetModel.insertMany(documents);
            console.log(
              `✅ Migrated ${documents.length} documents for model: ${apiModel}`
            );
          } else {
            console.log(`⚠️ No documents found for model: ${apiModel}`);
          }
        } catch (err) {
          console.error(`❌ Error migrating model "${apiModel}":`, err);
        }
      }

      // Close connections
      await safelyCloseConnection({ conn: sourceDbConn });
      await safelyCloseConnection({ conn: targetDbConn });

      console.log(`✅ Migration completed for project: ${project}`);
    }

    console.log("🎉 All projects migrated successfully!");
  } catch (err) {
    console.error("❌ Error during project migration:", err);
  }
}

export async function getDB(req, res) {
  try {
    const { dbString } = await req.json();
    if (!dbString) return res.status(400).json({ message: "Missing dbString" });

    console.log("🔌 Connecting to DB:", dbString);
    const dbConn = await connectToDatabase({ KEY: dbString, dbName: "admin" });
    const adminDb = dbConn.connection.db.admin();

    const dbList = await adminDb.listDatabases();
    if (!dbList?.databases?.length) {
      return res.status(404).json({ message: "No databases found" });
    }

    const databaseInfo = await Promise.all(
      dbList.databases.map(async (db) => {
        if (!db.name) return null;

        try {
          const dbConn = await connectToDatabase({
            KEY: dbString,
            dbName: db.name,
          });
          const collections = await dbConn.connection.db
            .listCollections()
            .toArray();
          await safelyCloseConnection({ conn: dbConn });

          return {
            name: db.name,
            sizeOnDisk: db.sizeOnDisk,
            empty: db.empty,
            collections: collections.map((c) => c.name),
          };
        } catch (err) {
          console.error(`❌ Error fetching collections for ${db.name}:`, err);
          return null;
        }
      })
    );

    // Filter out any failed database fetches
    const databasesInfo = databaseInfo.filter((db) => db !== null);

    await safelyCloseConnection({ conn: dbConn });

    return res.json({ databases: databasesInfo });
  } catch (err) {
    console.error("❌ Unexpected error in getDB:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
