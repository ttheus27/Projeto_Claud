import { requireInternalApi } from "./security/internal-auth.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPool, closePool } from "./infrastructure/database.js";
import { createPedidoRouter } from "./presentation/pedido.routes.js";
import { pedidoUseCases } from "./composition/pedido-use-cases.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Carrega especificação Swagger OpenAPI
const swaggerDocPath = path.join(__dirname, "docs/swagger.json");
const swaggerSpec = JSON.parse(fs.readFileSync(swaggerDocPath, "utf-8"));

// Rotas da API e Documentação Swagger
app.use("/api", requireInternalApi);
swaggerSpec.servers = [{ url: "/", description: "API Gateway autenticado" }];
swaggerSpec.components = { ...swaggerSpec.components, securitySchemes: { gatewaySession: { type: "apiKey", in: "cookie", name: "schulz_session" } } };
swaggerSpec.security = [{ gatewaySession: [] }];
app.get("/openapi.json", requireInternalApi, (req, res) => res.json(swaggerSpec));
app.use("/api-docs", requireInternalApi, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", createPedidoRouter(pedidoUseCases));

// Health Check
app.get("/health", async (req, res) => {
  try {
    await (await getPool()).request().query("SELECT 1 AS connected");
    res.json({ status: "UP", banco: "Azure SQL Database", tabela: "TB_PEDIDOS" });
  } catch {
    res.status(503).json({ status: "DOWN", banco: "Azure SQL Database" });
  }
});

const server = app.listen(PORT, () => {
  console.log(`🚀 [MS2 - Pedidos SQL] Rodando na porta ${PORT}`);
  console.log(`📖 Swagger UI disponível em: http://localhost:${PORT}/api-docs`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => { server.close(); await closePool(); process.exit(0); });
}
