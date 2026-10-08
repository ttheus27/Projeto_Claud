const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

let cachedClient;
const FUNCTION_BUILD_VERSION = 'orcamentos-crud-cors-v2';

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

function buildIdFilter(id) {
    if (ObjectId.isValid(id)) {
        return { _id: new ObjectId(id) };
    }
    return { id };
}

function sanitizeOrcamentoPayload(payload) {
    const { _id, ...orcamento } = payload || {};
    return orcamento;
}

function serializeOrcamento(orcamento) {
    if (!orcamento) return null;
    return {
        ...orcamento,
        _id: orcamento._id?.toString()
    };
}

function jsonResponse(body, status = 200) {
    return {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,x-functions-key',
            'X-Orcamentos-Functions-Version': FUNCTION_BUILD_VERSION
        },
        body: JSON.stringify({
            ...body,
            functionVersion: FUNCTION_BUILD_VERSION
        })
    };
}

function emptyResponse(status = 200) {
    return {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,x-functions-key',
            'X-Orcamentos-Functions-Version': FUNCTION_BUILD_VERSION
        },
        body: JSON.stringify({ functionVersion: FUNCTION_BUILD_VERSION })
    };
}

module.exports = {
    buildIdFilter,
    emptyResponse,
    getCollection,
    jsonResponse,
    sanitizeOrcamentoPayload,
    serializeOrcamento
};
