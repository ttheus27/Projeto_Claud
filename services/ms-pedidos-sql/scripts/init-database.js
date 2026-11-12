import fs from "node:fs/promises";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { sql, databaseConfig } from "../src/infrastructure/database.js";

dotenv.config({ path: fileURLToPath(new URL("../.env.admin.local", import.meta.url)) });
if (!process.env.SQL_ADMIN_USER || !process.env.SQL_ADMIN_PASSWORD) throw new Error("Configure as credenciais de migração em .env.admin.local.");
const config = databaseConfig({ SQL_USER: process.env.SQL_ADMIN_USER, SQL_PASSWORD: process.env.SQL_ADMIN_PASSWORD });
const pool = await new sql.ConnectionPool(config).connect();
try {
  await pool.request().batch(await fs.readFile(new URL("../sql/001-create-pedidos.sql", import.meta.url), "utf8"));
  await pool.request().input("user", sql.NVarChar(128), process.env.SQL_USER)
    .input("password", sql.NVarChar(128), process.env.SQL_PASSWORD).query(`
      IF DATABASE_PRINCIPAL_ID(@user) IS NULL
      BEGIN
        DECLARE @create NVARCHAR(MAX) = N'CREATE USER ' + QUOTENAME(@user) + N' WITH PASSWORD = ' + QUOTENAME(@password, '''');
        EXEC sp_executesql @create;
      END;
      DECLARE @grant NVARCHAR(MAX) = N'GRANT SELECT, INSERT, UPDATE, DELETE ON OBJECT::dbo.TB_PEDIDOS TO ' + QUOTENAME(@user);
      EXEC sp_executesql @grant;`);
  console.log("Tabela dbo.TB_PEDIDOS criada/verificada; usuário da aplicação com permissões de CRUD.");
} finally { await pool.close(); }
