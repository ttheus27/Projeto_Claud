import { getMongoClient, closeMongoClient } from "./infrastructure/mongo.client.js";
import { requireInternalApi } from "./security/internal-auth.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createOrcamentoRouter } from "./presentation/orcamento.routes.js";
import { orcamentoUseCases } from "./composition/orcamento-use-cases.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

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
app.use("/api", createOrcamentoRouter(orcamentoUseCases));

// Health Check
app.get("/health", async (req, res) => {
  try {
    const client = await getMongoClient();
    await client.db(process.env.MONGO_DB_NAME || "schulz").command({ ping: 1 });
    res.json({ status: "UP", banco: "MongoDB Atlas" });
  } catch { res.status(503).json({ status: "DOWN", banco: "MongoDB Atlas" }); }
});

const server = app.listen(PORT, () => {
  console.log(`🚀 [MS1 - Orçamentos Mongo] Rodando na porta ${PORT}`);
  console.log(`📖 Swagger UI disponível em: http://localhost:${PORT}/api-docs`);
});

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, async () => { server.close(); await closeMongoClient(); process.exit(0); });
