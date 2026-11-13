import { timingSafeEqual } from "node:crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

export function requireInternalApi(req, res, next) {
  const expected = process.env.INTERNAL_API_TOKEN;
  const actual = req.get("x-internal-api-token") || "";
  if (!expected) return res.status(503).json({ error: "Autenticação interna não configurada." });
  const a = Buffer.from(actual); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(401).json({ error: "Acesso permitido somente pelo API Gateway/BFF." });
  next();
}
