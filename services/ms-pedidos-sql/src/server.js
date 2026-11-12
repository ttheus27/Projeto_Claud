import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pedidoRouter } from "./presentation/pedido.routes.js";

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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", pedidoRouter);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    servico: "Microserviço 2 — Gestão de Pedidos (Azure SQL / Relacional)",
    tabela: "TB_PEDIDOS",
    timestamp: new Date().toISOString(),
    banco: "Azure SQL Database (Motor Relacional Ativo)"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 [MS2 - Pedidos SQL] Rodando na porta ${PORT}`);
  console.log(`📖 Swagger UI disponível em: http://localhost:${PORT}/api-docs`);
});
