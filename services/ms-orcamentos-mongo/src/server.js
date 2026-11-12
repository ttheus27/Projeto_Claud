import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { orcamentoRouter } from "./presentation/orcamento.routes.js";

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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", orcamentoRouter);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    servico: "Microserviço 1 — Gestão de Orçamentos (MongoDB)",
    timestamp: new Date().toISOString(),
    banco: process.env.MONGO_URI ? "MongoDB Atlas Conectado" : "MongoDB (Armazenamento Local Integrado)"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 [MS1 - Orçamentos Mongo] Rodando na porta ${PORT}`);
  console.log(`📖 Swagger UI disponível em: http://localhost:${PORT}/api-docs`);
});
