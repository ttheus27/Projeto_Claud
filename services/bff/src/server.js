import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { bffRouter } from "./routes/bff.routes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Swagger UI
const swaggerDocPath = path.join(__dirname, "docs/swagger.json");
const swaggerSpec = JSON.parse(fs.readFileSync(swaggerDocPath, "utf-8"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", bffRouter);

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
  console.log(`🌐 [BFF - Gateway Schulz] Rodando na porta ${PORT}`);
  console.log(`📖 Swagger UI do BFF: http://localhost:${PORT}/api-docs`);
  console.log(`⚡ Endpoint Mandatório: http://localhost:${PORT}/api/aggregated-data`);
});
