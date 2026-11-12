import { MongoClient } from "mongodb";

let client = null;
let isConnected = false;

export async function getMongoClient() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) return null;

  if (client && isConnected) return client;

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    await client.connect();
    isConnected = true;
    console.log("✅ Conectado ao MongoDB Atlas com sucesso!");
    return client;
  } catch (error) {
    console.warn("⚠️ Não foi possível conectar ao MongoDB Atlas. Usando persistência local resiliente:", error.message);
    client = null;
    isConnected = false;
    return null;
  }
}
