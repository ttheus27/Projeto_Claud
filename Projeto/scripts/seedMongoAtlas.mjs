import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(projectRoot, '..');
const functionsRoot = path.resolve(workspaceRoot, '..', 'src');
const requireFromFunctions = createRequire(path.join(functionsRoot, 'package.json'));
const { MongoClient, ServerApiVersion } = requireFromFunctions('mongodb');

function parseEnvFile(filePath) {
  const env = {};
  const content = fs.readFileSync(filePath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

async function loadOrcamentosFromFunctionMock() {
  const mockPath = path.join(projectRoot, 'mock-bd.js');
  const source = fs.readFileSync(mockPath, 'utf8');
  const module = { exports: {} };
  const sandbox = {
    module,
    exports: module.exports
  };

  vm.runInNewContext(source, sandbox, { filename: mockPath });
  const mockFunction = module.exports;
  const context = {};
  await mockFunction(context, { method: 'GET' });
  return context.res?.body || [];
}

async function main() {
  const envPath = path.join(projectRoot, '.env');
  const env = parseEnvFile(envPath);
  const mongoUri = env.MONGO_URI || env.MONGODB_URI;
  const dbName = env.MONGO_DB_NAME || env.MONGODB_DB_NAME || 'schulz';
  const orcamentosCollectionName = env.MONGO_ORCAMENTOS_COLLECTION || 'orcamentos';
  const centrosCollectionName = env.MONGO_CENTROS_CUSTO_COLLECTION || 'centros_de_custo';

  if (!mongoUri) {
    throw new Error('Informe MONGO_URI ou MONGODB_URI em Projeto/.env.');
  }

  const [{ CENTROS_DE_CUSTO }, orcamentos] = await Promise.all([
    import(pathToFileURL(path.join(projectRoot, 'src/data/mockData.js')).href),
    loadOrcamentosFromFunctionMock()
  ]);

  const client = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  await client.connect();

  try {
    const db = client.db(dbName);
    const existingCollections = await db.listCollections({}, { nameOnly: true }).toArray();
    const existingNames = new Set(existingCollections.map(collection => collection.name));

    if (!existingNames.has(orcamentosCollectionName)) {
      await db.createCollection(orcamentosCollectionName);
    }

    if (!existingNames.has(centrosCollectionName)) {
      await db.createCollection(centrosCollectionName);
    }

    const orcamentosCollection = db.collection(orcamentosCollectionName);
    const centrosCollection = db.collection(centrosCollectionName);

    await orcamentosCollection.createIndex({ id: 1 }, { unique: true });
    await centrosCollection.createIndex({ codigo: 1 }, { unique: true });

    const orcamentosResult = await orcamentosCollection.bulkWrite(
      orcamentos.map(orcamento => ({
        replaceOne: {
          filter: { id: orcamento.id },
          replacement: {
            ...orcamento,
            atualizadoEm: orcamento.atualizadoEm || new Date().toISOString()
          },
          upsert: true
        }
      })),
      { ordered: false }
    );

    const centrosResult = await centrosCollection.bulkWrite(
      CENTROS_DE_CUSTO.map(centro => ({
        replaceOne: {
          filter: { codigo: centro.codigo },
          replacement: centro,
          upsert: true
        }
      })),
      { ordered: false }
    );

    const [orcamentosCount, centrosCount] = await Promise.all([
      orcamentosCollection.countDocuments(),
      centrosCollection.countDocuments()
    ]);

    console.log(JSON.stringify({
      database: dbName,
      collections: {
        [orcamentosCollectionName]: {
          seededFrom: 'Projeto/mock-bd.js',
          matched: orcamentosResult.matchedCount,
          inserted: orcamentosResult.upsertedCount,
          modified: orcamentosResult.modifiedCount,
          total: orcamentosCount
        },
        [centrosCollectionName]: {
          seededFrom: 'Projeto/src/data/mockData.js',
          matched: centrosResult.matchedCount,
          inserted: centrosResult.upsertedCount,
          modified: centrosResult.modifiedCount,
          total: centrosCount
        }
      }
    }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
