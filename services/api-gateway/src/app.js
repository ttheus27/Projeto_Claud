import path from "node:path";
import fs from "node:fs";
import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { randomBytes, randomUUID, createHash, scryptSync, timingSafeEqual } from "node:crypto";

export function createGateway({ bffUrl, internalToken, username, password, origins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8090"], secureCookie = false, staticDir, httpFetch = fetch }) {
  if (!bffUrl || !internalToken || !username || !password) throw new Error("Configure BFF_URL, INTERNAL_API_TOKEN, GATEWAY_USERNAME e GATEWAY_PASSWORD no backend do gateway.");
  const app = express();
  app.disable("x-powered-by");
  const sessions = new Map();
  const salt = randomBytes(16);
  const passwordHash = scryptSync(password, salt, 32);
  const cookieName = "schulz_session";
  const sessionDuration = 8 * 60 * 60 * 1000;
  const cookieOptions = { httpOnly: true, secure: secureCookie, sameSite: "strict", path: "/", maxAge: sessionDuration };
  const hash = value => createHash("sha256").update(value).digest("hex");
  app.use((req, res, next) => {
    res.set({ "X-Request-ID": randomUUID(), "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Cache-Control": "no-store" });
    if (req.headers.origin && !origins.includes(req.headers.origin)) return res.status(403).json({ error: "Origem não permitida." });
    next();
  });
  app.use(cors({ origin: origins, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit({ windowMs: 60000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Muitas requisições. Aguarde um minuto." } }));
  const authenticate = (req, res, next) => {
    const raw = (req.headers.cookie || "").split(";").map(item => item.trim()).find(item => item.startsWith(cookieName + "="))?.slice(cookieName.length + 1);
    const key = raw && hash(raw);
    const session = key && sessions.get(key);
    if (!session || session.expires <= Date.now()) {
      if (key) sessions.delete(key);
      return res.status(401).json({ error: "Entre na sua conta para continuar." });
    }
    req.sessionKey = key;
    req.sessionUser = session.username;
    next();
  };
  app.get("/health", (req, res) => res.json({ status: "UP", servico: "API Gateway" }));
  app.post("/api/session", rateLimit({ windowMs: 15 * 60000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Muitas tentativas de login. Aguarde 15 minutos." } }), (req, res) => {
    if (typeof req.body?.username !== "string" || typeof req.body?.password !== "string" || req.body.password.length > 256) return res.status(400).json({ error: "Informe usuário e senha." });
    const candidate = scryptSync(req.body.password, salt, 32);
    if (!timingSafeEqual(candidate, passwordHash) || req.body.username !== username) return res.status(401).json({ error: "Usuário ou senha inválidos." });
    for (const [key, session] of sessions) if (session.expires <= Date.now()) sessions.delete(key);
    if (sessions.size >= 1000) return res.status(503).json({ error: "Limite de sessões atingido. Tente novamente mais tarde." });
    const token = randomBytes(32).toString("base64url");
    sessions.set(hash(token), { username, expires: Date.now() + sessionDuration });
    res.cookie(cookieName, token, cookieOptions).json({ user: username });
  });
  app.get("/api/session", authenticate, (req, res) => res.json({ user: req.sessionUser }));
  app.delete("/api/session", authenticate, (req, res) => {
    sessions.delete(req.sessionKey);
    res.clearCookie(cookieName, { path: "/", httpOnly: true, sameSite: "strict", secure: secureCookie }).status(204).end();
  });
  app.use("/api", authenticate);
  app.use("/api", async (req, res) => {
    if (!["GET", "POST", "PUT", "DELETE"].includes(req.method)) return res.status(405).json({ error: "Método não permitido." });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 115000);
    try {
      const response = await httpFetch(bffUrl.replace(/\/$/, "") + req.originalUrl, {
        method: req.method, signal: controller.signal,
        headers: { "x-internal-api-token": internalToken, "x-request-id": res.get("X-Request-ID"), ...(["POST", "PUT"].includes(req.method) ? { "Content-Type": "application/json" } : {}) },
        ...(["POST", "PUT"].includes(req.method) ? { body: JSON.stringify(req.body) } : {}),
        redirect: "manual",
      });
      const contentType = response.headers.get("content-type");
      if (contentType) res.type(contentType);
      const location = response.headers.get("location");
      if (location?.startsWith("/")) res.set("Location", location);
      res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
    } catch {
      res.status(503).json({ error: "Não foi possível acessar os serviços. Sincronize os dados antes de repetir uma alteração." });
    } finally { clearTimeout(timer); }
  });
  if (staticDir && fs.existsSync(path.join(staticDir, "index.html"))) {
    app.use(express.static(staticDir));
    app.get("*", (req, res) => res.sendFile(path.join(staticDir, "index.html")));
  }
  app.use((error, req, res, next) => res.status(error.status === 413 ? 413 : 400).json({ error: error.status === 413 ? "Conteúdo excede o limite permitido." : "Envie um JSON válido." }));
  return app;
}
