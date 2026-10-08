const { MongoClient, ServerApiVersion } = require('mongodb');

let cachedClient;

async function getCollection() {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('A variável de ambiente MONGO_URI não foi configurada.');
    }

    if (!cachedClient) {
        cachedClient = new MongoClient(mongoUri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        await cachedClient.connect();
    }

    const dbName = process.env.MONGO_DB_NAME || 'schulz';
    const collectionName = process.env.MONGO_ORCAMENTOS_COLLECTION || 'orcamentos';
    return cachedClient.db(dbName).collection(collectionName);
}

module.exports = { getCollection };
