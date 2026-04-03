import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
const dbName = process.env.RESUME_EMBEDDED_DB || "resume_site_embedded";

let client: MongoClient | null = null;
let connectPromise: Promise<MongoClient> | null = null;

export async function getMongoDb() {
  if (!uri) {
    throw new Error("MONGO_URI is not configured.");
  }

  if (client) {
    return client.db(dbName);
  }

  if (!connectPromise) {
    connectPromise = MongoClient.connect(uri, {
      maxPoolSize: 10
    });
  }

  client = await connectPromise;
  return client.db(dbName);
}
