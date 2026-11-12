import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";

export function createHttpApp({ sessionUseCases, proxy, durationMs, origins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8090"], secureCookie = false, staticDir, trustProxy = false }) {
  const app = express(); app.disable("x-powered-by"); app.set("trust proxy", trustProxy);
  const cookieName = "schulz_session";
  const cookieOptions = { httpOnly: true, secure: secureCookie, sameSite: "strict", path: "/", maxAge: durationMs };
  const readToken = req => (req.headers.cookie || "").split(";").map(item => item.trim()).find(item => item.startsWith(cookieName + "="))?.slice(cookieName.length + 1);
  const errorResponse = (error, res) => res.status([400, 401, 503].includes(error.statusCode) ? error.statusCode : 503).json({ error: error.statusCode ? error.message : "Não foi possível acessar o serviço." });
  const authenticate = (req, res, next) => {
    try { req.sessionUser = sessionUseCases.get(readToken(req)); next(); }
    catch (error) { errorResponse(error, res); }
  };
  app.use((req, res, next) => {
    res.set({ "X-Request-ID": randomUUID(), "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Cache-Control": "no-store" });
    if (req.headers.origin && !origins.includes(req.headers.origin)) return res.status(403).json({ error: "Origem não permitida." });
    next();
  });
  app.use(cors({ origin: origins, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit({ windowMs: 60000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Muitas requisições. Aguarde um minuto." } }));
  app.get("/health", (req, res) => res.json({ status: "UP", servico: "API Gateway" }));
  app.post("/api/session", rateLimit({ windowMs: 15 * 60000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Muitas tentativas de login. Aguarde 15 minutos." } }), async (req, res) => {
    try { const session = await sessionUseCases.login(req.body); res.cookie(cookieName, session.token, cookieOptions).json({ user: session.user }); }
    catch (error) { errorResponse(error, res); }
  });
  app.get("/api/session", authenticate, (req, res) => res.json({ user: req.sessionUser }));
  app.delete("/api/session", authenticate, (req, res) => {
    try { sessionUseCases.logout(readToken(req)); res.clearCookie(cookieName, { path: "/", httpOnly: true, sameSite: "strict", secure: secureCookie }).status(204).end(); }
    catch (error) { errorResponse(error, res); }
  });
  async function forward(req, res, targetPath = req.originalUrl) {
    if (!["GET", "POST", "PUT", "DELETE"].includes(req.method)) return res.status(405).json({ error: "Método não permitido." });
    try {
      const response = await proxy({ path: targetPath, method: req.method, body: req.body, requestId: res.get("X-Request-ID") });
      if (response.contentType) res.type(response.contentType);
      if (response.location?.startsWith("/")) res.set("Location", response.location);
      res.status(response.status).send(response.body);
    } catch { res.status(503).json({ error: "Não foi possível acessar os serviços. Sincronize os dados antes de repetir uma alteração." }); }
  }
  app.get("/aggregated-data", authenticate, (req, res) => forward(req, res, "/api/aggregated-data"));
  app.use("/api", authenticate, (req, res) => forward(req, res));
  if (staticDir && fs.existsSync(path.join(staticDir, "index.html"))) {
    app.use(express.static(staticDir)); app.get("*", (req, res) => res.sendFile(path.join(staticDir, "index.html")));
  }
  app.use((error, req, res, next) => res.status(error.status === 413 ? 413 : 400).json({ error: error.status === 413 ? "Conteúdo excede o limite permitido." : "Envie um JSON válido." }));
  return app;
}
