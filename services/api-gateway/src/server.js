import path from "node:path";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { createGateway } from "./app.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });
const app = createGateway({
  bffUrl: process.env.BFF_URL || "http://localhost:8080",
  internalToken: process.env.INTERNAL_API_TOKEN,
  username: process.env.GATEWAY_USERNAME,
  password: process.env.GATEWAY_PASSWORD,
  origins: (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8090").split(","),
  staticDir: process.env.FRONTEND_DIR ? path.resolve(fileURLToPath(new URL("..", import.meta.url)), process.env.FRONTEND_DIR) : fileURLToPath(new URL("../public", import.meta.url)),
  secureCookie: process.env.GATEWAY_COOKIE_SECURE === "true",
});
app.listen(process.env.PORT || 8090, () => console.log("API Gateway iniciado na porta", process.env.PORT || 8090));
