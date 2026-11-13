import sql from "mssql";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });
let poolPromise;

export function databaseConfig(overrides = {}) {
  for (const name of ["SQL_SERVER", "SQL_DATABASE", "SQL_USER", "SQL_PASSWORD"]) {
    if (!process.env[name] && !overrides[name]) throw new Error(`Configure ${name} no backend de pedidos.`);
  }
  return {
    server: process.env.SQL_SERVER, database: process.env.SQL_DATABASE,
    user: overrides.SQL_USER || process.env.SQL_USER,
    password: overrides.SQL_PASSWORD || process.env.SQL_PASSWORD,
    connectionTimeout: Number(process.env.SQL_CONNECTION_TIMEOUT_MS || 60000),
    requestTimeout: 30000,
    pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
    options: { encrypt: true, trustServerCertificate: false, useUTC: true },
  };
}

export async function getPool() {
  if (!poolPromise) {
    const pool = new sql.ConnectionPool(databaseConfig());
    pool.on("error", error => console.error("Falha no pool Azure SQL:", error.code));
    poolPromise = pool.connect().catch(error => { poolPromise = undefined; throw error; });
  }
  return poolPromise;
}

export async function closePool() {
  if (poolPromise) await (await poolPromise).close();
  poolPromise = undefined;
}
export { sql };
