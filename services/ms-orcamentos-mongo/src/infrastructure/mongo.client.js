import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });
let clientPromise;
export async function getMongoClient() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("Configure MONGO_URI no backend de orçamentos.");
  if (!clientPromise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000, connectTimeoutMS: 15000 });
    clientPromise = client.connect().catch(async error => { clientPromise = undefined; await client.close(); throw error; });
  }
  return clientPromise;
}
export async function getCollection() {
  return (await getMongoClient()).db(process.env.MONGO_DB_NAME || "schulz")
    .collection(process.env.MONGO_ORCAMENTOS_COLLECTION || "orcamentos");
}
export async function closeMongoClient() {
  if (clientPromise) await (await clientPromise).close();
  clientPromise = undefined;
}
