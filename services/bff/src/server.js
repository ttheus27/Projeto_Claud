import { requireInternalApi } from "./security/internal-auth.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createBffRouter } from "./routes/bff.routes.js";
import { createBffDependencies } from "./composition/bff.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Swagger UI
const swaggerDocPath = path.join(__dirname, "docs/swagger.json");
const swaggerSpec = JSON.parse(fs.readFileSync(swaggerDocPath, "utf-8"));

app.use("/api", requireInternalApi);
swaggerSpec.servers = [{ url: "/", description: "API Gateway autenticado" }];
swaggerSpec.components = { ...swaggerSpec.components, securitySchemes: { gatewaySession: { type: "apiKey", in: "cookie", name: "schulz_session" } } };
swaggerSpec.security = [{ gatewaySession: [] }];
app.get("/openapi.json", requireInternalApi, (req, res) => res.json(swaggerSpec));
app.use("/api-docs", requireInternalApi, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const bffRouter = createBffRouter(createBffDependencies());
app.use("/api", bffRouter);
app.get("/aggregated-data", requireInternalApi, (req, res, next) => { req.url = "/aggregated-data"; bffRouter(req, res, next); });

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    servico: "BFF (Backend for Frontend) — Integrador Schulz S/A",
    timestamp: new Date().toISOString(),
    endpoints: {
      aggregatedData: "/api/aggregated-data",
      swagger: "/api-docs"
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌐 [BFF - Agregador Schulz] Rodando na porta ${PORT}`);
  console.log(`📖 Swagger UI do BFF: http://localhost:${PORT}/api-docs`);
  console.log(`⚡ Endpoint Mandatório: http://localhost:${PORT}/api/aggregated-data`);
});
