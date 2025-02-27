const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_KEY_MAIN;

export const connectDBSelf = async (req, res, next) => {
  const mongoDbKey = process.env.MONGODB_KEY_MAIN;
  const userName = req.userName;
  const schema = req.userSchema || {};
  const strict = !!req.userSchema; // Simplified strict logic
  const { projectName, apiName, data } = req.body;
  const saveInternal = req.saveInternal;

  if (saveInternal) {
    // Construct the database name dynamically
    const dbName = `${userName}_${projectName}`;
    const dbUri = `${mongoDbKey}${dbName}`;
    const newDbConnection = mongoose.createConnection(dbUri);

    // Handle connection events
    newDbConnection.on("connected", async () => {
      try {
        console.log(`Connected to database: ${dbName}`);

        // Define schema with strict mode and explicit collection name
        const sampleSchema = new mongoose.Schema(schema, {
          strict,
          collection: apiName, // Explicit collection name
        });

        // Create the model
        const model = newDbConnection.model(apiName, sampleSchema);

        // If data is provided, insert it into the collection
        if (data) {
          await model.insertMany(data);
          console.log(`Data inserted into collection: ${apiName}`);
        } else {
          console.log(`No data provided for collection: ${apiName}`);
        }

        // Close the connection
        await newDbConnection.close();
        console.log(`Database connection closed: ${dbName}`);
        next();
      } catch (err) {
        console.error("Error during database operation:", err.message);
        await safelyCloseConnection(newDbConnection, dbName, res);
        res
          .status(500)
          .send({ message: "Database operation error", error: err.message });
      }
    });

    // Handle connection error
    newDbConnection.on("error", (err) => {
      console.error("Database connection error:", err.message);
      res
        .status(500)
        .send({ message: "Database connection error", error: err.message });
    });
  } else {
    next();
  }
};

// Helper function to safely close the database connection
export const safelyCloseConnection = async (connection, dbName) => {
  try {
    await connection.close();
    console.log(`Database connection closed: ${dbName}`);
  } catch (err) {
    console.error(`Failed to close database connection: ${err.message}`);
    // res.status(500).send({
    //   message: "Failed to close database connection",
    //   error: err.message,
    // });
  }
};

export const connectDBUser = async (req, res, next) => {
  const mongoDbKey = req.mongoDbKey;
  const saveExternal = req.saveExternal;
  const userName = req.userName;
  const schema = req.userSchema || null;
  const strict = !!req.userSchema; // Simplified strict logic
  const { projectName, apiName, data } = req.body;

  if (mongoDbKey && saveExternal) {
    // Create a new database connection
    const newDbConnection = mongoose.createConnection(
      `${mongoDbKey}${projectName}`
    );

    newDbConnection.on("connected", async () => {
      try {
        // Define the schema with explicit collection name
        const sampleSchema = new mongoose.Schema(schema || {}, {
          strict,
          collection: apiName, // Explicitly set the collection name
        });

        // Create the model
        const model = newDbConnection.model(apiName, sampleSchema);

        if (data) {
          // Insert the data
          await model.insertMany(data);
          console.log(`Data inserted into collection: ${apiName}`);
        } else {
          console.log(`No data provided for collection: ${apiName}`);
        }

        // Close the database connection
        await newDbConnection.close();
        console.log(`Database connection closed: ${projectName}`);
        next();
      } catch (err) {
        console.error("Error during database operation:", err.message);
        res
          .status(500)
          .send({ message: "Database operation error", error: err.message });
      }
    });

    newDbConnection.on("error", (err) => {
      console.error("Database connection error:", err.message);
      res
        .status(500)
        .send({ message: "Database connection error", error: err.message });
    });
  } else {
    next();
  }
};

export const getDB = async (req, res, next) => {
  const { dbString } = req.body;

  if (!dbString) {
    next();
    return;
  }

  try {
    const connection = mongoose.createConnection(dbString);

    connection.on("connected", async () => {
      try {
        const databases = connection.db.admin();
        const dbList = await databases.listDatabases();

        if (!dbList.databases || dbList.databases.length === 0) {
          return res.status(404).send({ message: "No databases found" });
        }

        const dbPromises = dbList.databases.map(async (db) => {
          if (!db.name) return null; // Skip unnamed databases

          try {
            // Create a connection to the specific database
            const dbConnection = mongoose.createConnection(
              `${dbString}${db.name}`
            );

            // Wait for the connection to establish
            await dbConnection.asPromise();

            // List collections in the database
            const collections = await dbConnection.db
              .listCollections()
              .toArray();

            // Close the connection
            dbConnection.close();

            return {
              name: db.name,
              sizeOnDisk: db.sizeOnDisk,
              empty: db.empty,
              collections: collections.map((collection) => collection.name), // Extract collection names
            };
          } catch (err) {
            console.error(
              `Error listing collections for database ${db.name}:`,
              err
            );
            return null; // Skip databases that couldn't be processed
          }
        });

        // Resolve all promises and filter out null results
        const databasesInfo = (await Promise.all(dbPromises)).filter(
          (db) => db !== null
        );

        req.databases = databasesInfo;
        connection.close();
        next();
      } catch (err) {
        console.error("Error retrieving databases:", err);
        connection.close();
        res.status(500).send({ message: "Failed to retrieve databases" });
      }
    });

    connection.on("error", (err) => {
      console.error("Connection error:", err);
      res.status(500).send({ message: "Invalid database connection string" });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send({ message: "Something went wrong" });
  }
};

export const dropDBUser = async (req, res, next) => {
  const mongoDbKey = req.mongoDbKey;
  const saveExternal = req.saveExternal;
  const projectName = req.projectName;
  const userName = req.userName;

  if (mongoDbKey && saveExternal) {
    const connection = mongoose.createConnection(`${mongoDbKey}${projectName}`);
    connection.on("connected", async () => {
      try {
        await connection.db.dropDatabase();
        await connection
          .close()
          .then(() => {
            next();
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Database did not close" });
          });
      } catch (err) {
        console.log(err);
        res.status(500).send({
          message:
            "Database did not drop, you may not have given the user of atlas admin or databse admin or owner privileges",
        });
      }
    });
    connection.on("error", (err) => {
      console.log(err);
      res.status(500).send({ message: "Invalid database connection string" });
    });
  } else {
    next();
  }
};

export const dropDBSelf = async (req, res, next) => {
  const mongoDbKey = process.env.MONGODB_KEY_MAIN;
  const projectName = req.projectName;
  const userName = req.userName;
  const saveInternal = req.saveInternal;
  const dbName = userName + "_" + projectName;

  if (saveInternal) {
    const connection = mongoose.createConnection(`${mongoDbKey}${dbName}`);
    connection.on("connected", async () => {
      try {
        await connection.db.dropDatabase();
        await connection
          .close()
          .then(() => {
            next();
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Database did not close" });
          });
      } catch (err) {
        console.log(err);
        res.status(500).send({
          message:
            "Database did not drop, you may not have given the user of atlas admin or databse admin or owner privileges",
        });
      }
    });
    connection.on("error", (err) => {
      console.log(err);
      res.status(500).send({ message: "Invalid database connection string" });
    });
  } else {
    next();
  }
};

export const migrateProjects = async ({
  dbString,
  dbStringOther,
  options,
  userName,
  projects,
  api,
  migrate,
  schema,
  strict,
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
      for (const apiModel of api[project]) {
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

export const connectToDatabase = async (uri = MONGO_URI, dbName = "") => {
  const connection = mongoose.createConnection(`${uri}${dbName}`);
  connection.on("error", (err) => {
    console.error(`Error connecting to database "${dbName}": ${err.message}`);
  });

  await connection.asPromise(); // Wait for the connection to establish
  console.log(`Connected to database: ${dbName}`);
  return connection;
};

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
  const strict = !!schema;

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
